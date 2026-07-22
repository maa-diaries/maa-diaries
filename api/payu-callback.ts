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

    // CORS Headers — restrict to configured origin
    const allowedOrigin = process.env.ALLOWED_ORIGIN || process.env.BASE_URL || 'http://localhost:5173';
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type'
    );

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // PayU sends payment callbacks as a POST request containing transaction details
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const data = req.body || {};
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
      additionalCharges,
      udf1, udf2, udf3, udf4, udf5, udf6, udf7, udf8, udf9, udf10
    } = data;

    const salt = process.env.PAYU_MERCHANT_SALT;
    const merchantKey = process.env.PAYU_MERCHANT_KEY;
    const baseUrl = process.env.BASE_URL || 'http://localhost:5173';

    if (!salt) {
      console.error('PAYU_MERCHANT_SALT environment variable is missing.');
      return res.redirect(`${baseUrl}/#payment_status=warning&reason=salt_missing`);
    }

    // Verify key matches process.env.PAYU_MERCHANT_KEY if configured (H4 security guard)
    if (merchantKey && key && key !== merchantKey) {
      console.error('Merchant key mismatch in PayU callback.');
      return res.redirect(`${baseUrl}/#payment_status=failure&reason=key_mismatch`);
    }

    // Re-verify hash sent by PayU:
    // sha512(SALT|status|udf10|udf9|udf8|udf7|udf6|udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
    const udf1Str = udf1 || '';
    const udf2Str = udf2 || '';
    const udf3Str = udf3 || '';
    const udf4Str = udf4 || '';
    const udf5Str = udf5 || '';
    const udf6Str = udf6 || '';
    const udf7Str = udf7 || '';
    const udf8Str = udf8 || '';
    const udf9Str = udf9 || '';
    const udf10Str = udf10 || '';

    const udfsString = `${udf10Str}|${udf9Str}|${udf8Str}|${udf7Str}|${udf6Str}|${udf5Str}|${udf4Str}|${udf3Str}|${udf2Str}|${udf1Str}`;
    
    let calculatedHash = '';
    if (additionalCharges) {
      const hashString = `${additionalCharges}|${salt}|${status}|${udfsString}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
      calculatedHash = createHash('sha512').update(hashString).digest('hex');
    } else {
      const hashString = `${salt}|${status}|${udfsString}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
      calculatedHash = createHash('sha512').update(hashString).digest('hex');
    }

    // Check if hash matches
    const isValid = calculatedHash.toLowerCase() === (hash || '').toLowerCase();

    if (!isValid) {
      console.error('PayU hash verification failed.', { calculatedHash, receivedHash: hash });
      return res.redirect(`${baseUrl}/#payment_status=failure&txnid=${txnid || ''}&reason=hash_mismatch`);
    }

    // Secure database status reconciliation using Service Role Key (C5/H4)
    if (status === 'success') {
      if (supabaseAdmin && txnid) {
        try {
          const { data: order, error: fetchError } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('txnid', txnid)
            .maybeSingle();

          if (!fetchError && order) {
            const { error: updateError } = await supabaseAdmin
              .from('orders')
              .update({
                payment_status: 'Paid',
                status: 'Confirmed',
                payu_id: payuMoneyId || null
              })
              .eq('id', order.id);

            if (updateError) {
              console.error('Error updating order payment status in payu-callback:', updateError);
            }
          }
        } catch (dbErr) {
          console.error('Supabase admin connection error in callback:', dbErr);
        }
      }
      return res.redirect(`${baseUrl}/#payment_status=success&txnid=${txnid}&payuid=${payuMoneyId || ''}`);
    } else {
      return res.redirect(`${baseUrl}/#payment_status=failure&txnid=${txnid}`);
    }
  } catch (error: any) {
    console.error('Uncaught error in payu-callback handler:', error);
    const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
    return res.redirect(`${baseUrl}/#payment_status=failure&reason=internal_error`);
  }
}
