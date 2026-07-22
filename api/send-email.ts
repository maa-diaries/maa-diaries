import { rateLimit } from './_rateLimit';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = (supabaseUrl && serviceRoleKey)
  ? createClient(supabaseUrl, serviceRoleKey)
  : null;

function escapeHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export default async function handler(req: any, res: any) {
  // Rate limit: 5 requests per minute per IP (email sending is expensive)
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 'unknown';
  const { allowed } = await rateLimit(`send-email:${ip}`, 5, 60000);
  if (!allowed) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { type, payload } = req.body;
  if (!type || !payload) {
    return res.status(400).json({ error: 'Missing type or payload' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not defined in environment variables.');
    return res.status(500).json({ error: 'Resend API key not configured on server.' });
  }

  // ─── Email Address Configuration ───────────────────────────────
  // Each email type uses a dedicated sender/recipient for proper routing
  const infoEmail = process.env.INFO_EMAIL || 'info@maadiaries.com';
  const ordersEmail = process.env.ORDERS_EMAIL || 'support@maadiaries.com';
  const deliveryEmail = process.env.DELIVERY_EMAIL || 'support@maadiaries.com';
  const supportEmail = process.env.SUPPORT_EMAIL || 'support@maadiaries.com';

  try {
    // Validate order against Supabase before sending email to prevent relay abuse (C6/H3)
    if (type === 'order') {
      const { order } = payload;
      if (!order || !order.id) {
        return res.status(400).json({ error: 'Missing order details.' });
      }
      if (supabaseAdmin) {
        const { data: dbOrder, error: dbError } = await supabaseAdmin
          .from('orders')
          .select('*')
          .eq('id', order.id)
          .maybeSingle();
        if (dbError || !dbOrder) {
          console.error(`Email relay blocked: Order ${order.id} not found in database.`);
          return res.status(403).json({ error: 'Unauthorized: Order not found.' });
        }
        if (dbOrder.customer_email.toLowerCase() !== order.customerEmail.toLowerCase()) {
          console.error(`Email relay blocked: Recipient email mismatch for order ${order.id}.`);
          return res.status(403).json({ error: 'Unauthorized: Recipient email mismatch.' });
        }
      }
    }

    if (type === 'delivery_update') {
      const { order } = payload;
      if (!order || !order.id) {
        return res.status(400).json({ error: 'Missing order details.' });
      }
      if (supabaseAdmin) {
        const { data: dbOrder, error: dbError } = await supabaseAdmin
          .from('orders')
          .select('*')
          .eq('id', order.id)
          .maybeSingle();
        if (dbError || !dbOrder) {
          console.error(`Email relay blocked: Order ${order.id} not found in database.`);
          return res.status(403).json({ error: 'Unauthorized: Order not found.' });
        }
      }
    }

    let emailData: { from: string; to: string; subject: string; html: string } | null = null;

    if (type === 'order') {
      const { order } = payload;
      const itemsListHtml = order.items
        .map(
          (item: any) => `
          <tr style="border-bottom: 1px solid #f0f0f0;">
            <td style="padding: 12px 0;">
              <strong style="color: #333;">${escapeHtml(item.product.name)}</strong><br/>
              <span style="font-size: 12px; color: #888;">${escapeHtml(item.selectedMetal)} &middot; ${escapeHtml(item.selectedStone)}</span>
            </td>
            <td style="padding: 12px 0; text-align: center; color: #666;">${item.quantity}</td>
            <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #b08d57;">₹${(item.product.price * item.quantity).toLocaleString('en-IN')}</td>
          </tr>`
        )
        .join('');

      // 1. Email for the Customer
      const customerSubject = `Thank you for your order! - Maa Diaries (Order #${order.id})`;
      const customerHtml = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden; background-color: #fff;">
          <div style="background-color: #b08d57; padding: 30px 20px; text-align: center; color: #fff;">
            <h1 style="margin: 0; font-family: Georgia, serif; font-size: 28px; font-weight: 300; letter-spacing: 2px;">MAA DIARIES</h1>
            <p style="margin: 5px 0 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Aapki pasand hamari pehchaan</p>
          </div>
          <div style="padding: 30px 20px; line-height: 1.6; color: #444;">
            <h2 style="color: #333; font-family: Georgia, serif; font-weight: 300; font-size: 20px; border-bottom: 1px solid #f0f0f0; padding-bottom: 10px;">Order Confirmation</h2>
            <p>Dear <strong>${escapeHtml(order.customerName)}</strong>,</p>
            <p>Thank you so much for your order! We are absolutely delighted to prepare your handcrafted premium jewelry. Our team is already on it, ensuring every detail is checked for quality.</p>
            
            <div style="background-color: #faf7f2; border: 1px solid #f3ebd8; border-radius: 6px; padding: 15px; margin: 20px 0;">
              <table style="width: 100%; font-size: 13px;">
                <tr><td style="color: #888;">Order ID:</td><td><strong>${escapeHtml(order.id)}</strong></td></tr>
                <tr><td style="color: #888;">Estimated Delivery:</td><td><strong>${escapeHtml(order.estimatedDelivery)}</strong></td></tr>
                <tr><td style="color: #888;">Payment Method:</td><td><strong>${escapeHtml(order.paymentMethod)} (${escapeHtml(order.paymentStatus)})</strong></td></tr>
              </table>
            </div>

            <h3 style="color: #333; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #b08d57; padding-bottom: 5px; margin-top: 25px;">Summary of Items</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <thead>
                <tr style="border-bottom: 2px solid #eaeaea; color: #888; font-size: 12px; text-transform: uppercase;">
                  <th style="text-align: left; padding-bottom: 8px;">Product</th>
                  <th style="text-align: center; padding-bottom: 8px; width: 60px;">Qty</th>
                  <th style="text-align: right; padding-bottom: 8px; width: 100px;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsListHtml}
              </tbody>
            </table>

            <table style="width: 100%; margin-top: 20px; border-top: 2px solid #eaeaea; font-size: 14px;">
              <tr>
                <td style="padding: 8px 0; color: #888;">Shipping Fee:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 500;">₹${order.shippingCost}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-size: 16px; font-weight: bold; color: #333;">Total Amount:</td>
                <td style="padding: 8px 0; text-align: right; font-size: 18px; font-weight: bold; color: #b08d57;">₹${order.totalAmount.toLocaleString('en-IN')}</td>
              </tr>
            </table>

            <div style="margin-top: 30px; border-top: 1px solid #f0f0f0; padding-top: 20px;">
              <h3 style="color: #333; font-size: 14px; margin-bottom: 5px;">Shipping Address:</h3>
              <p style="font-size: 13px; color: #666; margin: 0; line-height: 1.5;">
                ${escapeHtml(order.addressLine)}<br/>
                ${escapeHtml(order.city)}, ${escapeHtml(order.state)} - ${escapeHtml(order.pincode)}<br/>
                Phone: ${escapeHtml(order.customerPhone)}
              </p>
            </div>
            
            <p style="margin-top: 35px; font-size: 13px; color: #888; text-align: center; border-top: 1px dashed #eaeaea; padding-top: 20px;">
              If you have any questions, reply to this email or reach us on WhatsApp at +91 84482 29528.
            </p>
          </div>
        </div>
      `;

      // 2. Email for the Owner
      const ownerSubject = `[New Order Alert] Order #${order.id} placed by ${order.customerName}`;
      const ownerHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
          <h2 style="color: #b08d57; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 0;">New Order Alert!</h2>
          <p>Hi Admin,</p>
          <p>A new order has been successfully placed on Maa Diaries.</p>
          
          <h3 style="background-color: #f9f9f9; padding: 10px; border-left: 4px solid #b08d57; font-size: 15px;">Customer Contact details:</h3>
          <p style="font-size: 14px; margin: 0 0 15px 10px; line-height: 1.5;">
            <strong>Name:</strong> ${escapeHtml(order.customerName)}<br/>
            <strong>Email:</strong> ${escapeHtml(order.customerEmail)}<br/>
            <strong>Phone:</strong> ${escapeHtml(order.customerPhone)}<br/>
            <strong>Shipping Address:</strong> ${escapeHtml(order.addressLine)}, ${escapeHtml(order.city)}, ${escapeHtml(order.state)} - ${escapeHtml(order.pincode)}
          </p>

          <h3 style="background-color: #f9f9f9; padding: 10px; border-left: 4px solid #b08d57; font-size: 15px;">Order Summary:</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <thead>
              <tr style="border-bottom: 2px solid #ccc; font-weight: bold; text-align: left;">
                <th style="padding: 8px 0;">Item</th>
                <th style="padding: 8px 0; text-align: center; width: 50px;">Qty</th>
                <th style="padding: 8px 0; text-align: right; width: 100px;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsListHtml}
            </tbody>
          </table>
          <p style="text-align: right; font-size: 16px; font-weight: bold; margin-top: 15px;">Total Amount: ₹${order.totalAmount.toLocaleString('en-IN')}</p>
          <p style="font-size: 14px;">
            <strong>Payment Method:</strong> ${escapeHtml(order.paymentMethod)}<br/>
            <strong>Payment Status:</strong> ${escapeHtml(order.paymentStatus)}
          </p>
          <p style="margin-top: 30px; font-size: 13px; color: #888;">
            Access the <a href="https://maadiaries.com/admin" target="_blank" style="color: #b08d57;">Admin Portal</a> to update status or generate courier label.
          </p>
        </div>
      `;

      // Customer email FROM: orders@maadiaries.com → Customer
      const customerRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `Maa Diaries Orders <${ordersEmail}>`,
          to: order.customerEmail,
          subject: customerSubject,
          html: customerHtml,
        }),
      });

      // Admin alert FROM: orders@maadiaries.com → orders@maadiaries.com
      const ownerRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `Maa Diaries Orders <${ordersEmail}>`,
          to: ordersEmail,
          subject: ownerSubject,
          html: ownerHtml,
        }),
      });

      if (!customerRes.ok && !ownerRes.ok) {
        const errorText = await customerRes.text();
        throw new Error(`Resend API calls failed: ${errorText}`);
      }

      return res.status(200).json({ success: true, message: 'Order emails dispatched successfully' });
    }

    if (type === 'feedback') {
      const { name, email, phone, message, orderId } = payload;
      const subject = orderId 
        ? `[Order Feedback] Order #${orderId} - Feedback from ${name}`
        : `[Website Feedback] New Message from ${name}`;
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
          <h2 style="color: #b08d57; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 0;">
            ${orderId ? `Order Feedback (#${escapeHtml(orderId)})` : 'General Website Feedback'}
          </h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Phone:</strong> ${escapeHtml(phone) || 'N/A'}</p>
          ${orderId ? `<p><strong>Associated Order ID:</strong> #${escapeHtml(orderId)}</p>` : ''}
          <div style="background-color: #fafafa; padding: 15px; border-radius: 6px; border: 1px solid #eee; margin-top: 15px;">
            <h4 style="margin-top: 0; color: #555;">Message/Feedback:</h4>
            <p style="margin: 0; line-height: 1.6; color: #333; white-space: pre-wrap;">${escapeHtml(message)}</p>
          </div>
          <p style="margin-top: 25px; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 10px;">
            This feedback was submitted dynamically through the Maa Diaries website.
          </p>
        </div>
      `;

      // Feedback emails TO: info@maadiaries.com
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `Maa Diaries Website <${supportEmail}>`,
          to: infoEmail,
          subject,
          html,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Resend API call failed: ${errorText}`);
      }

      return res.status(200).json({ success: true, message: 'Feedback email dispatched successfully' });
    }

    if (type === 'review') {
      const { productName, userName, rating, comment } = payload;
      const subject = `[New Product Review] ${productName} - ${rating} Stars by ${userName}`;
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
          <h2 style="color: #b08d57; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 0;">New Product Review</h2>
          <p><strong>Product:</strong> ${escapeHtml(productName)}</p>
          <p><strong>Reviewer:</strong> ${escapeHtml(userName)}</p>
          <p><strong>Rating:</strong> ${'★'.repeat(rating)}${'☆'.repeat(5 - rating)} (${rating}/5)</p>
          <div style="background-color: #fafafa; padding: 15px; border-radius: 6px; border: 1px solid #eee; margin-top: 15px;">
            <h4 style="margin-top: 0; color: #555;">Review Comment:</h4>
            <p style="margin: 0; line-height: 1.6; color: #333;">${escapeHtml(comment)}</p>
          </div>
          <p style="margin-top: 25px; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 10px;">
            This review was posted via the Maa Diaries Product Details page.
          </p>
        </div>
      `;

      // Review emails TO: info@maadiaries.com
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `Maa Diaries Reviews <${supportEmail}>`,
          to: infoEmail,
          subject,
          html,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Resend API call failed: ${errorText}`);
      }

      return res.status(200).json({ success: true, message: 'Review email dispatched successfully' });
    }

    // ─── Delivery Update Emails (FROM: deliveryupdate@maadiaries.com → Customer) ───
    if (type === 'delivery_update') {
      const { order, status, trackingNumber, estimatedDelivery } = payload;

      const headerHtml = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden; background-color: #fff;">
          <div style="background-color: #b08d57; padding: 30px 20px; text-align: center; color: #fff;">
            <h1 style="margin: 0; font-family: Georgia, serif; font-size: 28px; font-weight: 300; letter-spacing: 2px;">MAA DIARIES</h1>
            <p style="margin: 5px 0 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Aapki pasand hamari pehchaan</p>
          </div>
          <div style="padding: 30px 20px; line-height: 1.6; color: #444;">`;

      const footerHtml = `
            <p style="margin-top: 35px; font-size: 13px; color: #888; text-align: center; border-top: 1px dashed #eaeaea; padding-top: 20px;">
              If you have any questions, reply to this email or reach us on WhatsApp at +91 84482 29528.
            </p>
          </div>
        </div>`;

      let subject = '';
      let bodyHtml = '';

      if (status === 'Confirmed') {
        subject = `Order Confirmed - ID: ${order.id}`;
        bodyHtml = `${headerHtml}
            <h2 style="color: #333; font-family: Georgia, serif; font-weight: 300; font-size: 20px; border-bottom: 1px solid #f0f0f0; padding-bottom: 10px;">Order Confirmed!</h2>
            <p>Dear <strong>${escapeHtml(order.customerName)}</strong>,</p>
            <p>We are pleased to inform you that your order <strong>(ID: ${escapeHtml(order.id)})</strong> has been confirmed!</p>
            <div style="background-color: #f0f7ed; border: 1px solid #d4e8cb; border-radius: 6px; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #2d6a2e; font-weight: 500;">We are now preparing your handcrafted jewelry for shipment.</p>
            </div>
            <p>You will receive another email once your order has been shipped with tracking details.</p>
            <div style="margin-top: 20px; background-color: #faf7f2; border: 1px solid #f3ebd8; border-radius: 6px; padding: 15px;">
              <table style="width: 100%; font-size: 13px;">
                <tr><td style="color: #888;">Order ID:</td><td><strong>${escapeHtml(order.id)}</strong></td></tr>
                <tr><td style="color: #888;">Estimated Delivery:</td><td><strong>${escapeHtml(order.estimatedDelivery)}</strong></td></tr>
              </table>
            </div>
          ${footerHtml}`;
      } else if (status === 'Shipped') {
        subject = `Order Shipped - ID: ${order.id}`;
        bodyHtml = `${headerHtml}
            <h2 style="color: #333; font-family: Georgia, serif; font-weight: 300; font-size: 20px; border-bottom: 1px solid #f0f0f0; padding-bottom: 10px;">Your Order Has Been Shipped!</h2>
            <p>Dear <strong>${escapeHtml(order.customerName)}</strong>,</p>
            <p>Great news! Your order <strong>(ID: ${escapeHtml(order.id)})</strong> has been shipped and is on its way to you!</p>
            <div style="background-color: #f0f4f7; border: 1px solid #c8d8e4; border-radius: 6px; padding: 15px; margin: 20px 0;">
              <table style="width: 100%; font-size: 13px;">
                <tr><td style="color: #888;">Order ID:</td><td><strong>${escapeHtml(order.id)}</strong></td></tr>
                ${trackingNumber ? `<tr><td style="color: #888;">Tracking ID:</td><td><strong>${escapeHtml(trackingNumber)}</strong></td></tr>` : ''}
                <tr><td style="color: #888;">Courier Partner:</td><td><strong>${escapeHtml(order.courierPartner) || 'Delivery Partner'}</strong></td></tr>
                ${estimatedDelivery ? `<tr><td style="color: #888;">Estimated Delivery:</td><td><strong>${escapeHtml(estimatedDelivery)}</strong></td></tr>` : ''}
              </table>
            </div>
            <p>Track your order anytime from the <a href="https://maadiaries.com/tracking" target="_blank" style="color: #b08d57;">Track Order</a> page on our website.</p>
          ${footerHtml}`;
      } else if (status === 'Delivered') {
        subject = `Order Delivered - ID: ${order.id}`;
        bodyHtml = `${headerHtml}
            <h2 style="color: #333; font-family: Georgia, serif; font-weight: 300; font-size: 20px; border-bottom: 1px solid #f0f0f0; padding-bottom: 10px;">Order Delivered Successfully!</h2>
            <p>Dear <strong>${escapeHtml(order.customerName)}</strong>,</p>
            <p>Your order <strong>(ID: ${escapeHtml(order.id)})</strong> has been successfully delivered!</p>
            <div style="background-color: #f0f7ed; border: 1px solid #d4e8cb; border-radius: 6px; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #2d6a2e; font-weight: 500;">Your handcrafted jewelry has arrived. We hope you absolutely love it!</p>
            </div>
            <p>We would love to hear your experience. Feel free to share your feedback or leave a review on our website.</p>
            <p style="margin-top: 20px;">
              <a href="https://maadiaries.com" target="_blank" style="display: inline-block; background-color: #b08d57; color: #fff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600;">Visit Maa Diaries</a>
            </p>
          ${footerHtml}`;
      }

      if (!subject || !bodyHtml) {
        return res.status(400).json({ error: 'Invalid delivery update status' });
      }

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `Maa Diaries Delivery <${deliveryEmail}>`,
          to: order.customerEmail,
          subject,
          html: bodyHtml,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Resend API call failed: ${errorText}`);
      }

      return res.status(200).json({ success: true, message: 'Delivery update email dispatched successfully' });
    }

    if (type === 'welcome') {
      const { name, email } = payload;
      if (!email || !name) {
        return res.status(400).json({ error: 'Missing name or email for welcome message.' });
      }

      const subject = `Welcome to Maa Diaries! ✨`;
      const html = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden; background-color: #fff;">
          <div style="background-color: #b08d57; padding: 30px 20px; text-align: center; color: #fff;">
            <h1 style="margin: 0; font-family: Georgia, serif; font-size: 28px; font-weight: 300; letter-spacing: 2px;">MAA DIARIES</h1>
            <p style="margin: 5px 0 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Aapki pasand hamari pehchaan</p>
          </div>
          <div style="padding: 30px 20px; line-height: 1.6; color: #444;">
            <h2 style="color: #333; font-family: Georgia, serif; font-weight: 300; font-size: 20px; border-bottom: 1px solid #f0f0f0; padding-bottom: 10px;">Welcome to the Family!</h2>
            <p>Dear <strong>${escapeHtml(name)}</strong>,</p>
            <p>We are absolutely thrilled to welcome you to Maa Diaries! Thank you for creating an account with us.</p>
            <p>At Maa Diaries, we curate premium anti-tarnish, water-resistant jewelry designed for daily wear and special occasions. As a registered member, you can track your orders, manage your wishlist, and check out faster.</p>
            
            <div style="background-color: #faf7f2; border: 1px solid #f3ebd8; border-radius: 6px; padding: 20px; margin: 25px 0; text-align: center;">
              <p style="margin: 0 0 15px 0; color: #333; font-weight: 500;">Start exploring our latest collections today!</p>
              <a href="${process.env.BASE_URL || 'https://maadiaries.com'}/shop" style="display: inline-block; background-color: #b08d57; color: #fff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600;">Shop the Collection</a>
            </div>

            <p>If you have any questions, feel free to reach out to us by replying to this email or sending us a message on WhatsApp at +91 84482 29528.</p>
            
            <p style="margin-top: 35px; font-size: 13px; color: #888; text-align: center; border-top: 1px dashed #eaeaea; padding-top: 20px;">
              D-16, Part 1, Chanakya Place, 40 Feet Road, Opp. Gurudwara, New Delhi - 110059
            </p>
          </div>
        </div>
      `;

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `Maa Diaries <${supportEmail}>`,
          to: email,
          subject,
          html,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Resend API call failed: ${errorText}`);
      }

      return res.status(200).json({ success: true, message: 'Welcome email dispatched successfully' });
    }

    return res.status(400).json({ error: `Unsupported email type: ${type}` });
  } catch (error: any) {
    console.error('Error in send-email handler:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
