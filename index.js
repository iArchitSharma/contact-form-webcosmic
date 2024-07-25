const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 5000;

// Load environment variables
require('dotenv').config();

// Middleware
app.use(bodyParser.json());
app.use(cors()); // Allow all origins by default

// If you want to restrict to specific origins, use:
// app.use(cors({ origin: 'http://localhost:3000' }));

// Route to handle form submissions
app.post('/send', (req, res) => {
  const { firstName, lastName, email, budget, message, selectedOptions, agreement1, agreement2 } = req.body;

  // Set up Nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Use environment variable
      pass: process.env.EMAIL_PASS  // Use environment variable
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: 'New Contact Form Submission',
    text: `
      First Name: ${firstName}
      Last Name: ${lastName}
      Email: ${email}
      Budget: ${budget}
      Message: ${message}
      Services: ${selectedOptions.join(', ')}
      Agreement to Newsletter: ${agreement1}
      Agreement to Privacy Policy: ${agreement2}
    `
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).json({ error: error.toString() });
    }
    res.status(200).json({ message: 'Email sent: ' + info.response });
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
