import { rateLimit } from './_rateLimit.js';
import { createClient } from '@supabase/supabase-js';
import { getOtpHash } from './send-otp.js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = (supabaseUrl && serviceRoleKey)
  ? createClient(supabaseUrl, serviceRoleKey)
  : null;

export default async function handler(req: any, res: any) {
  try {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 'unknown';
    const { allowed } = await rateLimit(`verify-otp:${ip}`, 10, 60000);
    if (!allowed) {
      return res.status(429).json({ error: 'Too many verification attempts. Please wait a minute before trying again.' });
    }

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

    const { email, otp } = req.body || {};
    if (!email || !otp || typeof email !== 'string' || typeof otp !== 'string') {
      return res.status(400).json({ error: 'Email and verification code are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.trim();
    const codeHash = getOtpHash(cleanEmail, cleanOtp);

    let isValid = false;

    if (supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin
          .from('otp_codes')
          .select('id, expires_at, used')
          .eq('email', cleanEmail)
          .eq('code_hash', codeHash)
          .eq('used', false)
          .gte('expires_at', new Date().toISOString())
          .order('id', { ascending: false })
          .limit(1);

        if (!error && data && data.length > 0) {
          isValid = true;
          // Mark code as used
          await supabaseAdmin
            .from('otp_codes')
            .update({ used: true })
            .eq('id', data[0].id);
        }
      } catch (dbErr) {
        console.error('Error verifying OTP in Supabase:', dbErr);
      }
    }

    // Fallback simulation mode / dev check
    if (!isValid && (!supabaseAdmin || process.env.NODE_ENV === 'development')) {
      if (cleanOtp.length === 6 && /^\d+$/.test(cleanOtp)) {
        isValid = true;
      }
    }

    if (isValid) {
      return res.status(200).json({
        success: true,
        verified: true,
        message: 'Email verified successfully.'
      });
    } else {
      return res.status(400).json({
        success: false,
        verified: false,
        error: 'Invalid or expired verification code. Please check and try again.'
      });
    }
  } catch (error: any) {
    console.error('Error in verify-otp handler:', error);
    return res.status(500).json({ error: error.message || 'Verification failed.' });
  }
}
