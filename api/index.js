const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors()); // Enable requests from your website
app.use(express.json({ limit: '10mb' })); // Allow large payloads for the PDF data

// Set up the email transporter using credentials from environment variables
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD, // The 16-digit App Password
  },
});

// Define the endpoint that will receive the data from your website
app.post('/send-email', async (req, res) => {
  try {
    const { name, email, company, pdfData, ...otherDetails } = req.body;

    const pdfBase64 = pdfData.split('base64,')[1];
    const pdfAttachment = {
      filename: 'Initiative_Proposal.pdf',
      content: pdfBase64,
      encoding: 'base64',
      contentType: 'application/pdf',
    };

    // --- Email to the User ---
    const userMailOptions = {
      from: `"HR Yaar" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Your Corporate Initiative Proposal from HR Yaar',
      html: `<p>Dear ${name},</p><p>Thank you for your proposal! We will get back to you within two working days.</p><p>A summary of your selected plan is attached.</p><p>Best Regards,<br>The HR Yaar Team</p>`,
      attachments: [pdfAttachment],
    };

    // --- Email to Your Company ---
    const companyMailOptions = {
      from: `"HR Yaar System" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER, // Sends the notification to your own Gmail
      subject: `URGENTLY NEEDED: New Proposal from ${company}`,
      html: `<h3>New Proposal Submitted:</h3><pre>${JSON.stringify(otherDetails, null, 2)}</pre>`,
      attachments: [pdfAttachment],
    };

    // Send both emails
    await transporter.sendMail(userMailOptions);
    await transporter.sendMail(companyMailOptions);
    
    res.status(200).json({ message: 'Emails sent successfully!' });

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email.' });
  }
});

module.exports = app;