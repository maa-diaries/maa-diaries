import { createHash } from 'crypto';
import { rateLimit } from './_rateLimit.js';

export default async function handler(req: any, res: any) {
  try {
    // Rate limit: 10 requests per minute per IP
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 'unknown';
    const { allowed } = await rateLimit(`payu-hash:${ip}`, 10, 60000);
    if (!allowed) {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }

    // CORS Headers — restrict to configured origin
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

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { txnid, amount, productinfo, firstname, email, phone, udf1 } = body;

    if (!txnid || !amount || !productinfo || !firstname || !email || !phone) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const key = process.env.PAYU_MERCHANT_KEY?.trim();
    const salt = process.env.PAYU_MERCHANT_SALT?.trim();
    const env = (process.env.PAYU_ENV || 'sandbox').trim(); // 'sandbox' or 'production'

    // If credentials are not set yet, let the frontend know so it can fall back to sandbox simulation mode
    if (!key || !salt) {
      return res.status(200).json({
        isMock: true,
        message: 'PayU credentials are not configured yet on Vercel. Falling back to secure simulated sandbox.'
      });
    }

    const actionUrl = env === 'production' 
      ? 'https://secure.payu.in/_payment' 
      : 'https://test.payu.in/_payment';

    // Format & sanitize parameters for PayU
    const formattedTxnId = String(txnid).trim();
    const formattedAmount = parseFloat(String(amount)).toFixed(2);
    const sanitizedProductInfo = String(productinfo).replace(/[^a-zA-Z0-9\s_-]/g, '').trim().substring(0, 100) || 'Maa Diaries Order';
    const sanitizedFirstName = String(firstname).replace(/[^a-zA-Z0-9\s]/g, '').trim() || 'Customer';
    const sanitizedEmail = String(email).trim().toLowerCase();
    const sanitizedPhone = String(phone).replace(/\D/g, '');
    const udf1Str = udf1 ? String(udf1).trim() : '';

    // Official PayU Request Hash Formula (16 pipes / 17 fields):
    // key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5|udf6|udf7|udf8|udf9|udf10|salt
    const hashParams = [
      key,
      formattedTxnId,
      formattedAmount,
      sanitizedProductInfo,
      sanitizedFirstName,
      sanitizedEmail,
      udf1Str,
      '', '', '', '', '', '', '', '', '', // udf2 through udf10 (9 empty strings)
      salt
    ];

    const hashString = hashParams.join('|');
    const hash = createHash('sha512').update(hashString).digest('hex');

    // Success and Failure URLs
    const baseUrl = (process.env.BASE_URL || 'http://localhost:5173').trim();
    const surl = `${baseUrl}/api/payu-callback`;
    const furl = `${baseUrl}/api/payu-callback`;

    return res.status(200).json({
      isMock: false,
      payuKey: key,
      txnid: formattedTxnId,
      amount: formattedAmount,
      productinfo: sanitizedProductInfo,
      firstname: sanitizedFirstName,
      email: sanitizedEmail,
      phone: sanitizedPhone,
      surl,
      furl,
      hash,
      action: actionUrl,
      udf1: udf1Str
    });
  } catch (error: any) {
    console.error('Error generating PayU hash:', error);
    return res.status(500).json({ error: 'Internal server error generating payment hash.' });
  }
}
