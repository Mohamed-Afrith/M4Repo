const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs");
const transporter = require("./mailService");
const templateUrls = require("./templateUrl");
const path = require('path');


const sendMail = async (data) => {
  try {
    const { to, subject, templateData } = data;
 // Create the absolute path to the Handlebars template
    const templatePath = path.resolve(__dirname, templateUrls.reviewInvitation);
    // Read the Handlebars template
    const templateFile = fs.readFileSync(templatePath, "utf8");
    const template = handlebars.compile(templateFile);

    // Compile the email body with template data
    const html = template(templateData);
    const mailOptions = {
      from: "santhilamobiledev@gmail.com",
      to: to,
      subject: subject,
      text: "Hi !",
      html: html,
    };
//    transporter.sendMail(
//       mailOptions,
//       async (error, info) => {
//         if (error) return { error: error, info: null };
//         else return { error: null, info: info };
//       }
//     );
    // return transportStatus+ "Heelow";

      // Wrap the transporter.sendMail in a Promise
      const transportStatus = await new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            reject(error);
          } else {
            resolve(info);
          }
        });
      });
  
      // Returning the result after the asynchronous operation is complete
      return { error: null, info: transportStatus };
    } catch (error) {
      console.error('Error:', error);
      return { error: error, info: null };
    }
};

module.exports = { sendMail };
