
const transporter = require("../../lib/mails/mailService");
const Creator = require("../../models/Creator");
const Learner = require("../../models/learner");
const LmsPlanValidity = require("../../models/planvaliditylogs");
const { Op } = require("sequelize");
const creatorConfig = require("../../lib/config/creator");
const { v4: uuidv4 } = require("uuid");
const { Console } = require("console");
require("dotenv").config();

//  create route

const createCreator = async (req, res) => {
    // try {
      const LoginUserId =req.user.user.id;
       const LoginUserRole =req.user.user.role;
      
        const existingLearner = await Creator.findOne({where:{ ctMail: req.body.ctMail }});
      if (!req.body) return res.status(400).json({ status: "Failure", message: "Bad request" });
      if(existingLearner) return res.status(400).json({ status: "MailFailure", message: "Email Exist" });
if(LoginUserRole==='Admin'){
  req.body.ctCreatedDate = null;
  req.body.ctCreatedUserId = null;

  req.body.ctCreateAdminDate = Date.now();;
  req.body.ctCreateAdminId=req.user.user.id;
}else if(LoginUserRole==='Creator'){

  req.body.ctCreatedDate = Date.now();
  req.body.ctCreatedUserId = req.user.user.id;

  req.body.ctCreateAdminDate =null ;
  req.body.ctCreateAdminId=null;
}
     

      req.body.ctEditedDate =null; 
      req.body.ctEditedUserId=null;
      req.body.ctEditAdminId=null;
      req.body.ctEditAdminDate =null;
      
     
   
      req.body.ctIpAddress = req.connection.remoteAddress;
      req.body.ctUserAgent = req.headers["user-agent"];
      req.body.ctDeviceType = req.device.type;
      const data = req.body;
      const tableColumns = Object.keys(Creator.rawAttributes);
      
      // Filter the request data to only include the table columns
      const filteredData = {};
      for (const key in data) {
          if (tableColumns.includes(key)) {
              filteredData[key] = data[key];
            }
        }
        
        const result = await Creator.create(filteredData);
        

        if (result) {
            if (creatorConfig.creatorMailOptions.enableMailToSetPassword) {
              const mailOptions = {
                from: process.env.HOST_EMAIL,
                to: req.body.ctMail,
                subject: creatorConfig.creatorMailOptions.subject,
                html:
                  `<h1>Greeting from Atlantis</h1><br><p>Your account for Atlantis has been created as Creator. So you have to set your account password by clicking the below link.,</p><br><a href="${process.env.FRONTEND_SERVER}` +
                  `${creatorConfig.creatorMailOptions.navLink}` +
                  `${result.ctUUID}` +
                  `" target="_blank">${process.env.FRONTEND_SERVER}` +
                  `${creatorConfig.creatorMailOptions.navLink}` +
                  `${result.ctUUID}</a>`,
              };
       
              transporter.sendMail(mailOptions, (error, info) => {
                if (!error) {
                  res.status(201).json({
                    status: "Success",
                    message: "Creator Added Successfully",
                    result: result,
                    requestData: filteredData,
                  });
                } else {
                  res
                    .status(500)
                    .json({
                      status: "Failure",
                      error: "Internal Server Error",
                      err: error,
                    });
                }
              });
            } else {
              res.status(201).json({
                status: "Success",
                message: "Creator Added Successfully",
                result: result,
                requestData: filteredData,
              });
            }
          }
        // } catch (error) {
        //   res
        //     .status(500)
        //     .json({ status: "Failure", error: "Internal Server Error", err: error });
        // }
};
//  edit route      
const updateCreator = async (req, res) => {

    try {
      const LoginUserRole =req.user.user.role;
      const LoginUserId =req.user.user.id;
     
        const id = req.params.id;
       
        const tableColumns = Object.keys(Creator.rawAttributes);

        if(LoginUserRole==='Admin'){
          req.body.ctEditedDate = null;
          req.body.ctEditedUserId = null;
        
          req.body.ctEditedAdminDate = Date.now();
          req.body.ctEditedAdminId=req.user.user.id;
        }else if(LoginUserRole==='Creator'){
        
          req.body.ctEditedDate = Date.now();
          req.body.ctEditedUserId = req.user.user.id;
        
          req.body.ctEditedAdminDate =null ;
          req.body.ctEditedAdminId=null;
        }
        const data = req.body;
        // Filter the request data to only include the table columns
        const filteredData = {};
        for (const key in data) {
            if (tableColumns.includes(key)) {
                filteredData[key] = data[key];
            }
        }


        const record = await Creator.findByPk(id);
        if (!record) {
            return res.status(404).json({ status:'Failure',message: 'Record not found' });
        }


        const updatedRecord = await record.update(filteredData);

        res.status(200).json({ status:'Success',message: 'Data Updated Successfully', data: updatedRecord });
    } catch (error) {
        res.status(500).json({status:'Failure', message: 'Internal Server Error', err: error });
    }
};

// Example delete route
const deleteCreator = async (req, res) => {

    try {
        const id = req.params.id;

        const record = await Creator.findByPk(id);
        if (!record) {
            return res.status(404).json({status:'Failure', error: 'Record not found' });
        }

        await record.update({ ctDeleteStatus: 'YES' });
        // await record.destroy();

        res.status(200).json({ status:'Success',message: 'Record Successfully Deleted' });
    } catch (error) {
        res.status(500).json({ status:'Failure',message: 'Internal Server Error', err: error });
    }
}

// Example read all route
// const getCreator = async (req, res) => {
//     try {
//     const data=req.body;
   
//       // const LoginUserRole =req.user.user.role;
//       // const LoginUserId =req.user.user.id;
//       const LoginUserRole =2;
//       const LoginUserId =2;
//         const allData = await Creator.findAll({
//             where: {
//                 ctDeleteStatus: {
//                     [Op.ne]: 'YES',
//                 },
//                 ...(LoginUserRole === 'Creator' ? {
//                   [Op.or]: [
//                     { ctCreatedUserId: LoginUserId },
//                     { ctId: LoginUserId }
//                   ]
//                 } : {}),
//                 ...(data.companyId
//                   ? { ctCompanyId: data.companyId }
//                   : {}),
//                   ...(data.planId
//                     ? { ctPlanId: data.planId }
//                     : {}),
//             },
//         }); 
       
//         if (allData.length === 0) {
//             return res.status(404).json({status:'Failure', message: 'No records found' });
//         }

//         res.status(200).json({ status:'Success',message: 'All Data Retrieved Successfully', data: allData });
//     } catch (error) {
//         res.status(500).json({status:'Failure', message: 'Internal Server Error', err: error.message });
//     }
// };
const editDetails = async (req, res) => {
    try {
        const id = req.params.id;
        const record = await Creator.findByPk(id);

        if (record) {
            res.status(200).json({ status:'Success',message: 'Record Found', data: record });
        } else {
            res.status(404).json({ status:'Failure',message: 'Record Not Found', });
        }
        
    } catch (error) {
        res.status(500).json({ status:'Failure',message: 'Internal Server Error', err: error });
    }
};

const getSelectCreator = async(req,res) => {
    try{
      const reqdata=req.body;
console.log("reqdata",reqdata)
      const LoginUserRole =req.user.user.role;
      const LoginUserId =req.user.user.id;
        const data = await Creator.findAll({
            attributes: [['ctId', 'value'], ['ctName', 'label'],['ctCompanyId','CompanyId']],
            where: {
                ctDeleteStatus: 'NO',
                ctStatus:'Active',
                ...(LoginUserRole === 'Creator' ? {
                  [Op.or]: [
                    { ctCreatedUserId: LoginUserId },
                    { ctId: LoginUserId },
                  ]
                } : {}),
                ...(reqdata.companyId
                  ? { ctCompanyId: reqdata.companyId}
                  : {}),
                  // ...(reqdata.chId
                  //   ? { ctCompanyId: reqdata.chId}
                  //   : {}),
            }
            
          });
        if(!data)
        {
            res.status(404).json({status:'Failure',message:'Bad request',err: err});  
        }
        else{
            res.status(200).json({status:'Success',message:'Data getted SuccessFully...!',data:data});
        }
    }
    catch(err)
    {
        res.status(500).json({status:'Failure',message:'oops! something went wrong',err: err.message});
    }
}


const EmailExistenceChecker = async (req, res) => {
    try {
      const isInCreator = await Creator.findOne({
        where: { ctMail: { [Op.eq]: req.body.email } },
      });
      if (!isInCreator) {
        const isInLearner = await Learner.findOne({
          where: { lenMail: { [Op.eq]: req.body.email }},
        });
        if (isInLearner) {
        return  res.status(200).json({ status: "success", message: "This Email Already registered as Learner",valid: false });
        }
        return res.status(200).json({ status: "success",message:"" , valid: true });
      } else {
        return res.status(200).json({ status: "success", message: "This Email Already registered as Creator",valid: false });
      }
    } catch (e) {
    return  res
        .status(500)
        .json({
          status: "Failure",
          message: "Oops!, Not able verify the usage of entered Email id",
          err: e,
        });
    }
  };
  const updatePassword = async (req, res) => {
    const randomUUID = uuidv4();
    if (req.body.type === "creator") {
      try {
        const model = await Creator.findOne({
          where: { ctUUID: { [Op.eq]: req.body.uuid } },
        });
        console.log(model);
        if (model !== null) {
          const result = await model.update({
            ctPassword: req.body.password,
            ctUUID: randomUUID,
          }); //UUID Changed after succesful password setup
          if (result) {
            res.status(200).json({
              status: "Success",
              message: "Password has been set Successfully",
            });
          } else {
            res
              .status(200)
              .json({ status: "Failure", message: "Unable to set Password" });
          }
        }
        else{
            res.status(402).json({
              status: "Failure",
              message: "You are not Authorized or Token Expired",
            });
        }
      } catch (e) {
        res.status(500).json({
          status: "Failure",
          message: "Oops!, Somthing went wrong",
          err: e,
        });
      }
    } else if (req.body.type === "learner") {
      try {
        const model = await Learner.findOne({
          where: { lenUUID: { [Op.eq]: req.body.uuid } },
        });
        if (model) {
          const result = await model.update({
            lenPassword: req.body.password,
            lenUUID: randomUUID,
          });
          if (result) {
            res.status(200).json({
              status: "Success",
              message: "Password has been set Successfully",
            });
          } else {
            res
              .status(200)
              .json({ status: "Failure", message: "Unable to set Password" });
          }
        }
        res.status(402).json({
          status: "Failure",
          message: "You are not Authorized or Token Expired",
        });
      } catch (e) {
        res.status(500).json({
          status: "Failure",
          message: "Oops!, Somthing went wrong",
          err: e,
        });
      }
    }
  };
  const getCreator = async (req, res) => {
    try {
      const data = req.body;
  
     
      const LoginUserId =req.user.user.id;
      const LoginUserRole =req.user.user.role;
  
      const allData = await Creator.findAndCountAll({
        include: [
          {
            model: LmsPlanValidity,
            as: 'validityLogs',
            attributes: ['phCreatorId','phPlanId','phValidityDays','phPlanValidityFrom','phPlanValidityTo','phRenewalPlanId','phRenewalValidityDays','phRenewalPlanValidityFrom','phRenewalPlanValidityTo'],
          }
        ],
        where: { 
          ctDeleteStatus: {
            [Op.ne]: 'YES',
          },
          ...(LoginUserRole === 'Creator'
            ? {
                [Op.or]: [
                  { ctCreatedUserId: LoginUserId },
                  { ctId: LoginUserId },
                ],
              }
            : {}),
          ...(data.companyId ? { ctCompanyId: data.companyId } : {}),
          ...(data.planId ? { ctPlanId: data.planId } : {}),
        },
        
      });
      if (allData.length === 0) {
        return res
          .status(404)
          .json({ status: 'Failure', message: 'No records found' });
      }
  
      res.status(200).json({
        status: 'Success',
        message: 'All Data Retrieved Successfully',
        data: allData,
      });
    } catch (error) {
      res.status(500).json({
        status: 'Failure',
        message: 'Internal Server Error',
        err: error.message,
      });
    }
  };


  const updateStatus = async (req, res) => {
    try {
      const id = req.params.id;
  
      if (!id) {
        return res.status(400).json({ status: 'Failure', message: "ID not provided" });
      }
  
      // Find the current status
      const existingRecord = await Creator.findByPk(id);
      
      if (!existingRecord) {
        return res.status(404).json({ status: 'Failure', message: "Record not found" });
      }
  
      // Toggle the status
      const newStatus = existingRecord.ctStatus === 'Active' ? 'Inactive' : 'Active';
  
      // Update the status
      const updatedCount = await Creator.update(
        { ctStatus: newStatus },
        { where: { ctId : id } }
      );
  
      return res.status(200).json({ status: "Success", message: "Data Updated Successfully", data: { updatedCount, newStatus } });
    } catch (error) {
      res.status(500).json({ status: 'Failure', message: "Internal Server Error", err: error });
    }
  };
  const changePassword = async (req,res) =>{
    try {
        const id = req.params.id;
        const data = req.body;
        const isInCreator = await Creator.findOne({ 
          where: { ctId: id },
        });   
        if (!isInCreator || isInCreator.ctPassword !== data.oldPassword) {
          return res.status(400).json({ status: "Failure", message: "Incorrect old password" });
        } 
      isInCreator.ctPassword = data.confirmed;
      await isInCreator.save();
     return res.status(200).json({ status: "Success", message: "password changed succesfully", });   
    } catch (e) {
    return res
        .status(500)
        .json({
          status: "Failure",
          message: "Oops!, Not able verify the usage of entered Email id",
          err: e,
        });
    }
  }
  

module.exports = { updatePassword,createCreator, updateCreator, deleteCreator, getCreator, editDetails,getSelectCreator,EmailExistenceChecker,getSelectCreator, updateStatus,changePassword};
