const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_APP_PASSWORD,
  },
});

app.post('/send', async (req, res) => {
  const { name, email, subject, message } = req.body || {};
  if (!name || !email || !message) return res.status(400).send('Name, email and message are required.');
  if (!process.env.MAIL_USER || !process.env.MAIL_APP_PASSWORD) return res.status(503).send('Mail service is not configured on the server.');
  try {
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      replyTo: email,
      to: process.env.MAIL_TO || process.env.MAIL_USER,
      subject: subject || `New message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    });
    res.send('Email sent successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Email not sent');
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server started on http://localhost:${port}`));
