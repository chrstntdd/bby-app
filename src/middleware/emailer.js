'use strict'

const nodemailer = require('nodemailer');
const moment = require('moment');
const logger = require('./logger').logger;

const SMTP_URL = process.env.SMTP_URL;
const FROM_EMAIL = process.env.FROM_EMAIL;

// `emailData` is an object that looks like this, defined below:
// {
//  from: "foo@bar.com",
//  to: "bizz@bang.com, marco@polo.com",
//  subject: "Hello world",
//  text: "Plain text content",
//  html: "<p>HTML version</p>"
// }
const sendEmail = (userEmail) => {

  const transporter = nodemailer.createTransport(SMTP_URL);

  const emailData = {
    from: FROM_EMAIL,
    to: userEmail,
    subject: `Your truck detail report from ${moment().format('MMMM Do YYYY, h:mm:ss a')}`,
    html: `<h1>Hello, world</h1>`
  }

  logger.info(`Attempting to send email from ${emailData.from}.`);
  return transporter
    .sendMail(emailData)
    .then((info) => {
      logger.info(`Message sent: ${info.response}.`);
    })
    .catch((err) => {
      console.log(`Problem sending email: ${err}`);
    });
}

// const sendTableData = (userEmail) => (err, req, res, next) => {
//   let emailData = {
//     from: FROM_EMAIL,
//     to: userEmail,
//     subject: `Your truck detail report from ${moment().format('MMMM Do YYYY, h:mm:ss a')}`,
//     html: `<h1>Hello, world</h1>`
//   }
//   sendEmail(emailData);
// }

module.exports = {
  sendEmail,
  // sendTableData
};