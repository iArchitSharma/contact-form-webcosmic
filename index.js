const express = require('express');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const port = 5000;

// Load environment variables
require('dotenv').config();

// Helmet security
app.use(helmet())
app.use(helmet({
  frameguard: {   
    action: 'deny'
  },
  dnsPrefetchControl: false 
}))

// Content Security Policy
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:'],
    connectSrc: ["'self'"],
    fontSrc: ["'self'", 'data:'],
    objectSrc: ["'none'"],
    upgradeInsecureRequests: [],
  }
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, //15 min
  max: 20,
  message: "Too many requests from this IP, please try again after 15 minutes"
});

app.use(limiter);

app.use(bodyParser.json());
app.use(cors()); 


app.post('/send',
  // Input validation
  body('firstName').notEmpty().isString().custom(value => {
    if (/\d/.test(value)) {
      throw new Error('First name should not contain numbers');
    }
    return true;
  }),
  body('lastName').notEmpty().isString().custom(value => {
    if (/\d/.test(value)) {
      throw new Error('Last name should not contain numbers');
    }
    return true;
  }),
  body('email').isEmail(),
  body('budget').isNumeric(),
  body('message').notEmpty().isString(),
  body('selectedOptions').isArray(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, budget, message, selectedOptions, agreement1, agreement2 } = req.body;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
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
