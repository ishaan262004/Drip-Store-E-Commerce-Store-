const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"GenZ Store 🛍️" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};

const orderConfirmationEmail = (order, userEmail) => {
  const itemsHtml = order.products
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px;border:1px solid #ddd;">${item.productId}</td>
          <td style="padding:8px;border:1px solid #ddd;">${item.quantity}</td>
          <td style="padding:8px;border:1px solid #ddd;">$${item.price.toFixed(2)}</td>
        </tr>`
    )
    .join("");

  return sendEmail({
    to: userEmail,
    subject: "🛒 Order Confirmed - GenZ Store",
    html: `
      <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#0f0f0f;color:#fff;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#6366f1,#a855f7);padding:32px;text-align:center;">
          <h1 style="margin:0;font-size:28px;">Order Confirmed! 🎉</h1>
          <p style="margin:8px 0 0;opacity:0.9;">Thanks for shopping with GenZ Store</p>
        </div>
        <div style="padding:24px;">
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>Total:</strong> $${order.totalPrice.toFixed(2)}</p>
          <p><strong>Status:</strong> ${order.orderStatus}</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            <thead><tr style="background:#1a1a2e;">
              <th style="padding:8px;border:1px solid #333;color:#a855f7;">Product</th>
              <th style="padding:8px;border:1px solid #333;color:#a855f7;">Qty</th>
              <th style="padding:8px;border:1px solid #333;color:#a855f7;">Price</th>
            </tr></thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <p style="color:#888;font-size:14px;">You'll receive updates as your order ships. Stay drippy! 💧</p>
        </div>
      </div>
    `,
  });
};

module.exports = { sendEmail, orderConfirmationEmail };
