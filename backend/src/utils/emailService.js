const nodemailer = require('nodemailer');

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',  // You can change this to your preferred email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Function to send welcome email
const sendWelcomeEmail = async (email, username) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to The Greek Cook!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4a90e2;">Welcome to Zorba's Kitchen!</h2>
          <p>Dear ${username},</p>
          <p>Thank you for registering with Zorba's Kitchen! We're excited to have you join our community of Greek food enthusiasts.</p>
          <p>With your account, you can:</p>
          <ul>
            <li>Save your favorite recipes</li>
            <li>Create personalized collections</li>
            <li>Share your cooking experiences</li>
          </ul>
          <p>Start exploring our collection of authentic Greek recipes today!</p>
          <p>Best regards,<br>Zorba's Kitchen Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully to:', email);
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};

module.exports = {
  sendWelcomeEmail
}; 