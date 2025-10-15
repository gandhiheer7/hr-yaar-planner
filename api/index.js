require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize Resend with the API key from your environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

app.post('/send-email', async (req, res) => {
  try {
    const { name, email, company, pdfData, initiatives, ...otherDetails } = req.body;

    // Convert the Base64 PDF data to a Buffer, which Resend uses
    const pdfBuffer = Buffer.from(pdfData.split('base64,')[1], 'base64');
    
    // Send one email to both the user and your company at the same time
    await resend.emails.send({
      from: 'HR Yaar <onboarding@resend.dev>', // Resend's default sending address
      to: [email, 'yourcompany@email.com'], // Sends to both user and your company
      subject: `New Proposal from ${company}`,
      html: `
        <h3>New Corporate Initiative Proposal Submitted</h3>
        <p>A new proposal was submitted by ${name} from ${company}.</p>
        <p>You can reach them at: ${email}.</p>
        <p>The full proposal summary is attached as a PDF.</p>
        <hr>
        <p><em>This is a copy of the confirmation sent to the user:</em></p>
        <p>Dear ${name},</p>
        <p>Thank you for planning your corporate initiatives with us! We have received your proposal and will get back to you within two working days.</p>
        <p>A summary of your selected plan is attached for your reference.</p>
        <p>Best Regards,<br>The HR Yaar Team</p>
      `,
      attachments: [{
        filename: 'Initiative_Proposal.pdf',
        content: pdfBuffer,
      }],
    });
    
    res.status(200).json({ message: 'Email sent successfully!' });

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});