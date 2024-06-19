const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    // host: 'mail.santhila.co',
    // port: 465,
    // secure: true,
    service:'GMAIL',
    auth: {
      user: 'santhilamobiledev@gmail.com',
      pass: 'cgol dsad rchw unkn'
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
  
module.exports = transporter;

