import { createHash } from 'crypto';
import { rateLimit } from './_rateLimit.js';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = (supabaseUrl && serviceRoleKey)
  ? createClient(supabaseUrl, serviceRoleKey)
  : null;

export default async function handler(req: any, res: any) {
  try {
    // Rate limit: 20 requests per minute per IP
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 'unknown';
    const { allowed } = await rateLimit(`payu-callback:${ip}`, 20, 60000);
    if (!allowed) {
      return res.status(429).json({ error: 'Too many requests.' });
    }

    // CORS Headers
    const allowedOrigin = process.env.ALLOWED_ORIGIN || process.env.BASE_URL || 'http://localhost:5173';
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const data = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { 
      status, 
      txnid, 
      amount, 
      firstname, 
      email, 
      key, 
      hash, 
      productinfo, 
      payuMoneyId, 
      mihpayid,
      additionalCharges,
      udf1, udf2, udf3, udf4, udf5, udf6, udf7, udf8, udf9, udf10
    } = data;

    const salt = process.env.PAYU_MERCHANT_SALT?.trim();
    const merchantKey = process.env.PAYU_MERCHANT_KEY?.trim();
    
    // Dynamic host resolution for production redirect return
    const host = (req.headers['x-forwarded-host'] as string) || req.headers.host || '';
    const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
    const dynamicBase = host ? `${proto}://${host}` : 'https://maadiaries.com';
    const baseUrl = (process.env.BASE_URL || dynamicBase).trim().replace(/\/+$/, '');

    if (!salt) {
      console.error('PAYU_MERCHANT_SALT environment variable is missing.');
      return res.redirect(303, `${baseUrl}/#payment_status=warning&reason=salt_missing`);
    }

    // Verify key matches process.env.PAYU_MERCHANT_KEY if configured
    if (merchantKey && key && key.trim() !== merchantKey) {
      console.error('Merchant key mismatch in PayU callback.');
      return res.redirect(303, `${baseUrl}/#payment_status=failure&reason=key_mismatch`);
    }

    // Official PayU Response Hash Formula (reverse order):
    // sha512(SALT|status|udf10|udf9|udf8|udf7|udf6|udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|key)
    // If additionalCharges: sha512(additionalCharges|SALT|status|udf10|...)
    const responseHashParams = [
      salt,
      status || '',
      udf10 || '',
      udf9 || '',
      udf8 || '',
      udf7 || '',
      udf6 || '',
      udf5 || '',
      udf4 || '',
      udf3 || '',
      udf2 || '',
      udf1 || '',
      email || '',
      firstname || '',
      productinfo || '',
      amount || '',
      txnid || '',
      key || merchantKey || ''
    ];

    if (additionalCharges) {
      responseHashParams.unshift(additionalCharges);
    }

    const hashString = responseHashParams.join('|');
    const calculatedHash = createHash('sha512').update(hashString).digest('hex');

    // Check if hash matches
    const isValid = calculatedHash.toLowerCase() === (hash || '').trim().toLowerCase();

    if (!isValid) {
      console.error('PayU hash verification failed.', { calculatedHash, receivedHash: hash });
      return res.redirect(303, `${baseUrl}/#payment_status=failure&txnid=${txnid || ''}&reason=hash_mismatch`);
    }

    const isSuccess = status === 'success';
    const payId = mihpayid || payuMoneyId || txnid;

    // Update order status in Supabase if database connection is available
    const dbOrderId = udf1;
    let amountVerified = true;

    if (supabaseAdmin && dbOrderId) {
      try {
        // Defense-in-depth: Fetch existing order to verify returned amount matches stored total_amount
        const { data: existingOrder } = await supabaseAdmin
          .from('orders')
          .select('total_amount')
          .eq('id', dbOrderId)
          .single();

        if (existingOrder && existingOrder.total_amount) {
          const returnedAmount = parseFloat(amount || '0');
          const expectedAmount = parseFloat(existingOrder.total_amount);
          if (Math.abs(returnedAmount - expectedAmount) > 0.05) {
            console.error(`PayU amount mismatch for order ${dbOrderId}. Expected ₹${expectedAmount}, got ₹${returnedAmount}. Marking as fraud/failed.`);
            amountVerified = false;
          }
        }

        const finalPaymentStatus = (isSuccess && amountVerified) ? 'Paid' : 'Failed';
        // Payment is complete, but fulfilment has not started until an admin
        // reviews the order and advances it from Pending.
        const finalOrderStatus = (isSuccess && amountVerified) ? 'Pending' : 'Cancelled';

        await supabaseAdmin
          .from('orders')
          .update({
            payment_status: finalPaymentStatus,
            status: finalOrderStatus,
            payu_id: payId
          })
          .eq('id', dbOrderId);
      } catch (dbErr) {
        console.error('Error updating order in database on PayU callback:', dbErr);
      }
    }

    if (isSuccess && amountVerified) {
      return res.redirect(303, `${baseUrl}/#payment_status=success&txnid=${txnid}&payuid=${payId}`);
    } else {
      const reason = !amountVerified ? 'amount_mismatch' : 'payment_failed';
      return res.redirect(303, `${baseUrl}/#payment_status=failure&txnid=${txnid}&reason=${reason}`);
    }
  } catch (error: any) {
    console.error('Error handling PayU callback:', error);
    const baseUrl = (process.env.BASE_URL || 'http://localhost:5173').trim();
    return res.redirect(303, `${baseUrl}/#payment_status=failure&reason=server_error`);
  }
}
