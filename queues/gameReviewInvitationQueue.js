// queue.js
const Queue = require('bull');
const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');
const transporter = require("../lib/mails/mailService");
const ReviewersGame = require("../models/reviewersGame")
const sequelize = require("../lib/config/database");

const jobQueue = new Queue('myQueue',{
  // limiter: {
  //       max: 10, // Adjust as needed
  //       duration: 1000, // Adjust as needed
  //     },
  //     defaultJobOptions: {
  //       // Default job options that will be applied to all jobs in this queue
  //       attempts: 3, // Maximum number of retry attempts
  //       backoff: {
  //         type: 'fixed', // Retry backoff strategy (options: 'fixed', 'exponential')
  //         delay: 1000,   // Delay between retry attempts in milliseconds
  //       },
  //     },
      // createClient: function (type) {
      //   switch (type) {
      //     case 'client':
      //       return sequelize;
      //     case 'subscriber':
      //       return sequelize;
      //     // case 'bclient':
      //     //   return YourModel; // This could be another Sequelize model if needed
      //     default:
      //       throw new Error('Unexpected connection type: ' + type);
      //   }
      // },
});




// Register a worker for processing email jobs
jobQueue.process(async (job) => {
  // console.log("Worker process function is registered!");


  // const { to, subject, templateData } = job.data;

  // // Read the Handlebars template
  // const templateFile = fs.readFileSync('../templates/gameReviewInvitationTemplate.hbs', 'utf8');
  // const template = handlebars.compile(templateFile);

  // // Compile the email body with template data
  // const html = template(templateData);
try{
  const jobData = await JobModel.findByPk(job.id); // Fetch job data from Sequelize
  if (!jobData) {
    throw new Error('Job not found');
  }

  // Process the job using jobData.data

  jobData.update({ status: 'completed' }); // Update job status on success
} catch (error) {
  jobData.update({ status: 'failed', error: error.message }); // Update job status on failure
}



const mailOptions ={
  from:'santhilamobiledev@gmail.com',
  to:to,
  subject: subject,
  text: 'Hi !',
  html: html
  // Send the email
}
  transporter.sendMail(mailOptions, async (error, info)=>{
    const reviewer = ReviewersGame.findOne({where: {gameUuid: {[Op.like]: `%${templateData.gameUuid}%`}}});
    if (error) 
    {
      await reviewer.update({mailStatus: 'failed', statusMessage: error.message});
    }
    reviewer.update({mailStatus: 'sent'});
  });
});

jobQueue.on('completed', (job, result) => {
  console.log(`Job completed with result: ${result}`);
});


module.exports = jobQueue;