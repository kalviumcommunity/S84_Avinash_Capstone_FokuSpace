const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTPEmail = async (email, content) => {
  console.log(`Sending email to ${email}`);
  const mailOptions = {
    from: FokuSpace-corporation,
    to: email,
    subject: 'FokuSpace Account Verification OTP',
    text: content,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${email}`);
  } catch (error) {
    console.error('Error sending email to', email, ':', error.message);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

module.exports = sendOTPEmail;