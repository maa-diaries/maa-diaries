import { createHash } from 'crypto';
import { rateLimit } from './_rateLimit.js';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = (supabaseUrl && serviceRoleKey)
  ? createClient(supabaseUrl, serviceRoleKey)
  : null;

// In-memory fallback if Supabase is not configured (e.g. local dev)
const inMemoryOtpStore = new Map<string, { codeHash: string; expiresAt: number }>();

export function getOtpHash(email: string, code: string): string {
  const secret = process.env.PAYU_MERCHANT_SALT || process.env.VITE_SUPABASE_ANON_KEY || 'maadiaries_otp_secret';
  return createHash('sha256')
    .update(`${email.toLowerCase().trim()}:${code}:${secret}`)
    .digest('hex');
}

export default async function handler(req: any, res: any) {
  try {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 'unknown';
    const { allowed } = await rateLimit(`send-otp:${ip}`, 5, 60000);
    if (!allowed) {
      return res.status(429).json({ error: 'Too many OTP requests. Please wait a minute before trying again.' });
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

    const { email } = req.body || {};
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email address is required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = getOtpHash(cleanEmail, otpCode);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store server-side
    if (supabaseAdmin) {
      try {
        await supabaseAdmin
          .from('otp_codes')
          .insert({
            email: cleanEmail,
            code_hash: codeHash,
            expires_at: expiresAt.toISOString(),
            used: false
          });
      } catch (dbErr) {
        console.error('Failed to store OTP in Supabase, using memory fallback:', dbErr);
        inMemoryOtpStore.set(cleanEmail, { codeHash, expiresAt: expiresAt.getTime() });
      }
    } else {
      inMemoryOtpStore.set(cleanEmail, { codeHash, expiresAt: expiresAt.getTime() });
    }

    // Send email via Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Maa Diaries <support@maadiaries.com>',
          to: [cleanEmail],
          subject: 'Your Maa Diaries Verification Code',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
              <h2 style="color: #832729; text-align: center;">Maa Diaries Verification Code</h2>
              <p>Hello,</p>
              <p>Your 6-digit email verification code is:</p>
              <div style="background: #f8f9fa; padding: 15px; text-align: center; border-radius: 6px; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #832729;">${otpCode}</span>
              </div>
              <p style="font-size: 13px; color: #666;">This code is valid for 10 minutes. Please do not share this code with anyone.</p>
              <p style="font-size: 13px; color: #666;">If you did not request this verification code, please ignore this email.</p>
            </div>
          `
        })
      });

      if (!emailRes.ok) {
        const errText = await emailRes.text();
        console.error('Resend API error sending OTP:', errText);
      }
    }

    // Return success response WITHOUT sending OTP code to browser client
    return res.status(200).json({
      success: true,
      message: 'Verification code sent to email.'
    });
  } catch (error: any) {
    console.error('Error in send-otp handler:', error);
    return res.status(500).json({ error: error.message || 'Failed to send verification code.' });
  }
}
