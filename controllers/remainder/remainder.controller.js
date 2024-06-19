const transporter = require("../../lib/mails/mailService");
const moment = require('moment');
const LmsPlanHistory = require("../../models/planHistory");
const Creator = require("../../models/Creator");
const Learner =require("../../models/learner")
const { Op } = require("sequelize");

const remainderMail = async (req, res) => {
    try {
        let getplantype = await Creator.findAll();

        for (const plantype of getplantype) {
            console.log('Plant Type:', plantype.ctId);

            const planvalidity = await LmsPlanHistory.findOne({
                where: {
                    phCreatorId: plantype.ctId,
                },
                order: [['phId', 'DESC']],
            });

            if (planvalidity) {
                let plancurrentDate = moment().format('YYYY-MM-DD'); // Get current date
                let planEndDate = moment(planvalidity.phPlanValidityTo).format('YYYY-MM-DD'); // Format 

                let daysDifference = moment(planEndDate).diff(plancurrentDate, 'days');

                if (daysDifference <= 10) {
                    const mailOptions = {
                        from: 'santhilamobiledev@gmail.com',
                        to: plantype.ctMail,
                        subject: 'Atlantis  Remainder',
                        html: `<div><p>hi MR/MS ${plantype.ctName}</p>` +
                            `<p>Your plan is expiring soon on ${planEndDate}</p>` +
                            `<p>So please update your plan</p></div>`
                    };

                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) return res.status(400).json({ status: 'Failure', message: error.message});
                        console.log('Email sent: ' + info.response);
                        res.status(200).json({ status: 'Success', message: 'Reminder Successfully'+plantype.ctMail });
                    });
                }
            }
        }

    } catch (err) {
        res.status(500).json({ status: 'Failure', message: 'RemainderMail not work', error: err.message });
    }
}
const learnerAdd = async (req, res) => {
    try {
        let id = req.params.id;
        if(!id){
            res.status(404).json({status: "Failure", message: "Bad request"});
        }
        
        let learner = await Learner.findOne({
            where: { lenId: id }
          });
          
        // for (const getlearner of learner  ) {
            if(learner){
                    const mailOptions = {
                        from: 'santhilamobiledev@gmail.com',
                        to: learner?.lenMail,
                        subject: 'Welcome Atlantis  ',
                        html: `<div><p>hi Mr/Ms ${learner.lenUserName}</p>` +
                            `<p>Every day, you can learn something new if you listen</p>`+
                            `<p>Your Account as beed Created .</p>
                            <a style='color: white; background-color:blue; padding: 5px;' href='http://35.183.46.127:3000/auth/sign-in/default'>Login</a>`
                    };
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) return res.status(400).json({ status: 'Failure', message: 'Mail Not Sent...!',data:learner.lenMail });

                        console.log('Email sent: ' + info.response);
                        res.status(200).json({ status: 'Success', message: 'Reminder Successfully'});
                    });
                }
                else{
                    res.status(400).json({ status: 'Failure', message: 'RemainderMail not work'});
 
                }
        }

     catch (err) {
        res.status(500).json({ status: 'Failure', message: 'RemainderMail not work', error: err.message });
    }
}

module.exports = { remainderMail ,learnerAdd };
