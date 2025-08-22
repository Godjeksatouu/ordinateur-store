import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Check if email configuration is available
const isEmailConfigured = process.env.MAIL_HOST && process.env.MAIL_PORT && process.env.MAIL_USER && process.env.MAIL_PASS;

let mailer;

if (isEmailConfigured) {
  console.log('📧 Configuring email with:', {
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    user: process.env.MAIL_USER,
    secure: process.env.MAIL_SECURE === "true"
  });

  mailer = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT),
    secure: process.env.MAIL_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
    // Additional options for better compatibility
    tls: {
      rejectUnauthorized: false // Allow self-signed certificates
    },
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 5000, // 5 seconds
    socketTimeout: 10000, // 10 seconds
  });

  // Test the connection
  mailer.verify((error, success) => {
    if (error) {
      console.error('❌ Email configuration test failed:', error.message);
      if (error.message.includes('Username and Password not accepted')) {
        console.log('💡 Gmail requires an App Password. Please:');
        console.log('   1. Enable 2-Factor Authentication on your Gmail account');
        console.log('   2. Generate an App Password at: https://myaccount.google.com/apppasswords');
        console.log('   3. Use the App Password instead of your regular password');
      }
    } else {
      console.log('✅ Email server is ready to send messages');
    }
  });
} else {
  // Create a mock transporter for development
  console.warn('⚠️ Email not configured - using mock transporter for development');
  mailer = {
    sendMail: async (options) => {
      console.log('📧 Mock email would be sent:', {
        to: options.to,
        subject: options.subject,
        from: options.from
      });
      return { messageId: 'mock-message-id' };
    }
  };
}

mailer.send = (options) =>
  mailer.sendMail({
    from: process.env.MAIL_FROM || 'noreply@ordinateur-store.com',
    ...options,
  });

export default mailer;
