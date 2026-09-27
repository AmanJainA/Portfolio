const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Setup Gmail transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'amanjain033@gmail.com',           // <-- your Gmail
    pass: 'xsih iqfk etzp kaao',         // <-- Gmail App Password (NOT normal password)
  },
});

// Handle POST request from React form
app.post('/send', (req, res) => {
  const { name, email, message } = req.body;

  const mailOptions = {
    from: email,
    to: 'amanjain033@gmail.com',
    subject: `New message from ${name}`,
    text: `${message}`,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Email not sent');
    }
    res.send('Email sent successfully');
  });
});

app.listen(5000, () => console.log('Server started on http://localhost:5000'));
