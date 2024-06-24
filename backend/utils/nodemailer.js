
const nodemailer = require('nodemailer');
const SettingModel = require('../models/settings');

// Function to get email credentials from the database
async function getEmailCredentials() {
    try {
        const settings = await SettingModel.findOne().select('node_email node_emailPassword');
        if (!settings) {
            throw new Error('No email settings found');
        }
        return {
            user: settings.node_email,
            pass: settings.node_emailPassword,
        };
    } catch (error) {
        console.error('Error fetching email credentials:', error);
        throw error;
    }
}

// Function to create the transporter
async function createTransporter() {
    const credentials = await getEmailCredentials();
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: credentials.user,
            pass: credentials.pass,
        },
    });
}

// Function to send an email
async function sendEmail(to, subject, text) {
    try {
        const transporter = await createTransporter();
        const mailOptions = {
            from: process.env.EMAIL_USER, // Use environment variable or fetched email
            to: to,
            subject: subject,
            text: text,
        };
        
        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

module.exports = {
    sendEmail
};
// const nodemailer = require('nodemailer');
// const SettingModal = require('../models/admin')

// const fromEmail = await SettingModal.findOne().select('node_email node_emailPassword')
// // Step 1: Create a transporter
// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: fromEmail.node_email,
//         pass: fromEmail.node_emailPassword
//     }
// });

// // Step 2: Set up email data
// const sendEmail = (to, subject, text) => {
//   const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: to,
//       subject: subject,
//       text: text
//   };

//   return new Promise((resolve, reject) => {
//       transporter.sendMail(mailOptions, (error, info) => {
//           if (error) {
//               reject(error);
//           } else {
//               resolve(info);
//           }
//       });
//   });
// };

// // Step 3: Send the email
// // transporter.sendMail(mailOptions, (error, info) => {
// //   if (error) {
// //     return console.log('Error:', error);
// //   }
// //   console.log('Email sent:', info.response);
// // });


// module.exports = {
//   sendEmail
// };