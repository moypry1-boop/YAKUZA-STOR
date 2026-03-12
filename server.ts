import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API to send script link to customer
  app.post("/api/send-script", async (req, res) => {
    const { email, productName, downloadUrl, adminEmail, message } = req.body;

    // Check if admin is authorized (simple check for this demo, usually you'd verify a token)
    if (adminEmail !== "moypry1@gmail.com") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (!email || !productName || !downloadUrl) {
      return res.status(400).json({ error: "Missing data" });
    }

    try {
      // Configure your transporter
      // Note: User must provide GMAIL_USER and GMAIL_APP_PASSWORD in settings
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });

      const mailOptions = {
        from: `"YAKUZA STORE" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: `تم تأكيد طلبك: ${productName}`,
        html: `
          <div style="direction: rtl; font-family: sans-serif; padding: 40px; background-color: #050505; color: #fff; border-radius: 30px; border: 1px solid #dc2626;">
            <h1 style="color: #dc2626; font-size: 28px; margin-bottom: 20px;">YAKUZA STORE - تسليم الطلب</h1>
            <p style="font-size: 18px; line-height: 1.6;">${message || 'شكراً لثقتك بنا. تم التأكد من عملية الدفع الخاصة بك.'}</p>
            <div style="background-color: #111; padding: 20px; border-radius: 15px; margin: 30px 0;">
              <p style="margin: 0; color: #666; font-size: 12px;">المنتج:</p>
              <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: bold; color: #dc2626;">${productName}</p>
            </div>
            <p>يمكنك تحميل طلبك الآن من الرابط التالي:</p>
            <a href="${downloadUrl}" style="display: inline-block; padding: 20px 40px; background-color: #dc2626; color: #fff; text-decoration: none; border-radius: 15px; font-weight: 900; margin-top: 20px; text-transform: uppercase; letter-spacing: 1px;">تحميل الملفات</a>
            <p style="margin-top: 40px; font-size: 11px; color: #444; border-top: 1px solid #222; pt: 20px;">هذه الرسالة مرسلة تلقائياً من نظام YAKUZA STORE. إذا واجهت أي مشكلة، تواصل معنا عبر الديسكورد.</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      res.json({ success: true });
    } catch (error) {
      console.error("Email error:", error);
      res.status(500).json({ error: "Failed to send email. Check GMAIL_USER and GMAIL_APP_PASSWORD." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
