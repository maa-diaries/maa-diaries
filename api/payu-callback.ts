import { createHash } from 'crypto';

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // PayU sends payment callbacks as a POST request containing transaction details
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const data = req.body;
  const { status, txnid, amount, firstname, email, key, hash, productinfo, payuMoneyId, additionalCharges } = data;

  const salt = process.env.PAYU_MERCHANT_SALT;
  const baseUrl = process.env.BASE_URL || 'http://localhost:5173';

  if (!salt) {
    console.error('PAYU_MERCHANT_SALT environment variable is missing.');
    // If not configured, we still redirect back but with a warning or fallback status
    return res.redirect(`${baseUrl}/?payment_status=warning&reason=salt_missing`);
  }

  // Re-verify hash sent by PayU:
  // For verified responses, PayU calculates:
  // sha512(salt|status|additionalCharges|udf10|...|udf1|email|firstname|productinfo|amount|txnid|key)
  // Note: if additionalCharges is present, we calculate with it, otherwise without it.
  
  let calculatedHash = '';
  const udfs = '||||||||||'; // 10 empty udf fields
  
  if (additionalCharges) {
    const hashString = `${salt}|${status}|${additionalCharges}${udfs}${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
    calculatedHash = createHash('sha512').update(hashString).digest('hex');
  } else {
    const hashString = `${salt}|${status}${udfs}${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
    calculatedHash = createHash('sha512').update(hashString).digest('hex');
  }

  // Check if hash matches
  const isValid = calculatedHash.toLowerCase() === (hash || '').toLowerCase();

  if (!isValid) {
    console.error('PayU hash verification failed.', { calculatedHash, receivedHash: hash });
    return res.redirect(`${baseUrl}/?payment_status=failure&txnid=${txnid || ''}&reason=hash_mismatch`);
  }

  if (status === 'success') {
    return res.redirect(`${baseUrl}/?payment_status=success&txnid=${txnid}&amount=${amount}&payuid=${payuMoneyId || ''}`);
  } else {
    return res.redirect(`${baseUrl}/?payment_status=failure&txnid=${txnid}&amount=${amount}`);
  }
}
