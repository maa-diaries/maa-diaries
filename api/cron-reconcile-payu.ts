import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = (supabaseUrl && serviceRoleKey)
  ? createClient(supabaseUrl, serviceRoleKey)
  : null;

export default async function handler(req: any, res: any) {
  try {
    // Check Authorization / Cron Secret
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers['authorization'];
    const isVercelCron = req.headers['x-vercel-cron'] === '1';

    if (cronSecret && !isVercelCron && authHeader !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ error: 'Unauthorized cron request.' });
    }

    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Supabase admin client not configured.' });
    }

    // Find pending online orders created more than 15 minutes ago
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { data: pendingOrders, error: fetchErr } = await supabaseAdmin
      .from('orders')
      .select('id, payment_method, payment_status, txnid, created_at')
      .eq('payment_method', 'Online')
      .eq('payment_status', 'Pending')
      .lt('created_at', fifteenMinsAgo)
      .limit(50);

    if (fetchErr) {
      throw fetchErr;
    }

    if (!pendingOrders || pendingOrders.length === 0) {
      return res.status(200).json({ message: 'No pending online orders requiring reconciliation.', reconciled: 0 });
    }

    const payuKey = process.env.PAYU_MERCHANT_KEY;
    const payuSalt = process.env.PAYU_MERCHANT_SALT;
    const isProd = process.env.NODE_ENV === 'production';
    const payuApiUrl = isProd
      ? 'https://info.payu.in/merchant/postservice?form=2'
      : 'https://test.payu.in/merchant/postservice?form=2';

    let reconciledCount = 0;
    let paidCount = 0;
    let failedCount = 0;

    for (const order of pendingOrders) {
      const orderId = order.id;
      const txnid = order.txnid || orderId;

      if (payuKey && payuSalt) {
        try {
          // PayU verify_payment command hash: sha512(key|command|var1|salt)
          const command = 'verify_payment';
          const hashString = `${payuKey}|${command}|${txnid}|${payuSalt}`;
          const hash = createHash('sha512').update(hashString).digest('hex');

          const params = new URLSearchParams();
          params.append('key', payuKey);
          params.append('command', command);
          params.append('var1', txnid);
          params.append('hash', hash);

          const payuRes = await fetch(payuApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString()
          });

          if (payuRes.ok) {
            const payuData = (await payuRes.json()) as any;
            const transactionDetails = payuData?.transaction_details?.[txnid];

            if (transactionDetails && transactionDetails.status === 'success') {
              await supabaseAdmin
                .from('orders')
                .update({
                  payment_status: 'Paid',
                  status: 'Processing',
                  payu_id: transactionDetails.mihpayid || transactionDetails.payuMoneyId || txnid
                })
                .eq('id', orderId);

              paidCount++;
              reconciledCount++;
              continue;
            }
          }
        } catch (payuErr) {
          console.error(`PayU verify_payment API error for order ${orderId}:`, payuErr);
        }
      }

      // If order has been pending for over 1 hour without successful payment on PayU, mark as Failed/Cancelled
      if (new Date(order.created_at).getTime() < new Date(oneHourAgo).getTime()) {
        await supabaseAdmin
          .from('orders')
          .update({
            payment_status: 'Failed',
            status: 'Cancelled'
          })
          .eq('id', orderId);

        failedCount++;
        reconciledCount++;
      }
    }

    return res.status(200).json({
      success: true,
      message: `Reconciliation complete. Processed ${pendingOrders.length} pending orders.`,
      reconciled: reconciledCount,
      paidCount,
      failedCount
    });
  } catch (error: any) {
    console.error('Error in cron-reconcile-payu:', error);
    return res.status(500).json({ error: error.message || 'Reconciliation failed.' });
  }
}
