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

  // Owner Email Configuration (read from environment, fallback to a placeholder)
  const ownerEmail = process.env.OWNER_EMAIL || 'satya@maadiaries.com';
  // Send from onboarding@resend.dev on free sandbox, or custom domain if configured
  const sendFrom = process.env.SENDER_EMAIL || 'Maa Diaries <onboarding@resend.dev>';

  try {
    let emailData: { from: string; to: string; subject: string; html: string } | null = null;

    if (type === 'order') {
      const { order } = payload;
      const itemsListHtml = order.items
        .map(
          (item: any) => `
          <tr style="border-bottom: 1px solid #f0f0f0;">
            <td style="padding: 12px 0;">
              <strong style="color: #333;">${item.product.name}</strong><br/>
              <span style="font-size: 12px; color: #888;">${item.selectedMetal} &middot; ${item.selectedStone}</span>
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
            <p>Dear <strong>${order.customerName}</strong>,</p>
            <p>Thank you so much for your order! We are absolutely delighted to prepare your handcrafted premium jewelry. Our team is already on it, ensuring every detail is checked for quality.</p>
            
            <div style="background-color: #faf7f2; border: 1px solid #f3ebd8; border-radius: 6px; padding: 15px; margin: 20px 0;">
              <table style="width: 100%; font-size: 13px;">
                <tr><td style="color: #888;">Order ID:</td><td><strong>${order.id}</strong></td></tr>
                <tr><td style="color: #888;">Estimated Delivery:</td><td><strong>${order.estimatedDelivery}</strong></td></tr>
                <tr><td style="color: #888;">Payment Method:</td><td><strong>${order.paymentMethod} (${order.paymentStatus})</strong></td></tr>
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
                ${order.addressLine}<br/>
                ${order.city}, ${order.state} - ${order.pincode}<br/>
                Phone: ${order.customerPhone}
              </p>
            </div>
            
            <p style="margin-top: 35px; font-size: 13px; color: #888; text-align: center; border-top: 1px dashed #eaeaea; padding-top: 20px;">
              If you have any questions, reply to this email or reach us on WhatsApp at +91 99999 99999.
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
            <strong>Name:</strong> ${order.customerName}<br/>
            <strong>Email:</strong> ${order.customerEmail}<br/>
            <strong>Phone:</strong> ${order.customerPhone}<br/>
            <strong>Shipping Address:</strong> ${order.addressLine}, ${order.city}, ${order.state} - ${order.pincode}
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
            <strong>Payment Method:</strong> ${order.paymentMethod}<br/>
            <strong>Payment Status:</strong> ${order.paymentStatus}
          </p>
          <p style="margin-top: 30px; font-size: 13px; color: #888;">
            Access the <a href="https://maadiaries.com/admin" target="_blank" style="color: #b08d57;">Admin Portal</a> to update status or generate courier label.
          </p>
        </div>
      `;

      // For sandbox restrictions: we send BOTH notifications.
      // If we can only send to verified email in free tier, we will send to the customerEmail,
      // but also send a carbon copy or independent email to the ownerEmail.
      // Let's first make the customer email dispatch call.
      const customerRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: sendFrom,
          to: order.customerEmail,
          subject: customerSubject,
          html: customerHtml,
        }),
      });

      // Send to owner as well
      const ownerRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: sendFrom,
          to: ownerEmail,
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
            ${orderId ? `Order Feedback (#${orderId})` : 'General Website Feedback'}
          </h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
          ${orderId ? `<p><strong>Associated Order ID:</strong> #${orderId}</p>` : ''}
          <div style="background-color: #fafafa; padding: 15px; border-radius: 6px; border: 1px solid #eee; margin-top: 15px;">
            <h4 style="margin-top: 0; color: #555;">Message/Feedback:</h4>
            <p style="margin: 0; line-height: 1.6; color: #333; white-space: pre-wrap;">${message}</p>
          </div>
          <p style="margin-top: 25px; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 10px;">
            This feedback was submitted dynamically through the Maa Diaries website.
          </p>
        </div>
      `;

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: sendFrom,
          to: ownerEmail,
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
          <p><strong>Product:</strong> ${productName}</p>
          <p><strong>Reviewer:</strong> ${userName}</p>
          <p><strong>Rating:</strong> ${'★'.repeat(rating)}${'☆'.repeat(5 - rating)} (${rating}/5)</p>
          <div style="background-color: #fafafa; padding: 15px; border-radius: 6px; border: 1px solid #eee; margin-top: 15px;">
            <h4 style="margin-top: 0; color: #555;">Review Comment:</h4>
            <p style="margin: 0; line-height: 1.6; color: #333;">${comment}</p>
          </div>
          <p style="margin-top: 25px; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 10px;">
            This review was posted via the Maa Diaries Product Details page.
          </p>
        </div>
      `;

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: sendFrom,
          to: ownerEmail,
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

    return res.status(400).json({ error: `Unsupported email type: ${type}` });
  } catch (error: any) {
    console.error('Error in send-email handler:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
