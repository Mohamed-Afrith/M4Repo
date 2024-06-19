
const LmsLearner = require("../../models/learner");
const Creator =require("../../models/Creator")
const learnerConfig = require("../../lib/config/learner");

const transporter = require("../../lib/mails/mailService");
const { Sequelize, DataTypes, Op } = require('sequelize');
const { v4: uuidv4 } = require("uuid");
const { error } = require("console");
//  create route
// Function to validate email address format
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};


const addlearner = async (req, res) => {
    try {
      const data= req.body;
      if (!data) {
        res.status(400).json({ status: "Failure", message: "Bad requestsss" });
      } else {
        const LoginUserRole =req.user.user.role;
        const LoginUserId =req.user.user.id;
       
        const defaultData = data.defaultData || {}; // Handle the case when defaultData is not provided
        
        // Set default values for the fields if they are empty //lenCohorts
        defaultData.lenDeleteStatus = defaultData.lenDeleteStatus || "NO";
        defaultData.lenIpAddress = defaultData.lenIpAddress || req.connection.remoteAddress;
        defaultData.lenUserAgent = defaultData.lenUserAgent || req.headers["user-agent"];
        defaultData.lenDeviceType = defaultData.lenDeviceType || req.device.type;
        defaultData.lenCreatedDate = defaultData.lenCreatedDate || Date.now();
        defaultData.lenStatus = defaultData.lenStatus ||'Active';
        defaultData.lenCohorts = defaultData?.chId??'' ;
        if(LoginUserRole==='Creator'){
          defaultData.lenCreatedUserId = LoginUserId;
          defaultData.lenCreatedDate =  Date.now();
        }else if(LoginUserRole==='Admin'){

          defaultData.lenAdminUserId = LoginUserId;
          defaultData.lenAdminDate = Date.now();

        }
                

       
        
        
        
        
        const learnerDataObject = data.learnerData;
        const invalidEmails = [];
        const existingLearnerEmails = [];
        const existingCreatorEmails = [];
       
       for (const key in learnerDataObject) {
  if (learnerDataObject.hasOwnProperty(key)) {
    const learnerData = learnerDataObject[key];
    
    // Check if lenMail property is present and has a valid email format
    if (learnerData.lenMail && !validateEmail(learnerData.lenMail)) {
      let filedName=`lenMail-${key}`
      invalidEmails.push(filedName);
    } else {
      // Check if the email already exists in the learner or creator table (replace with your actual logic)
      const emailExistsInLearnerTable =await LmsLearner.findOne({where:{ lenMail: learnerData.lenMail }});
      const emailExistsInCreatorTable = await Creator.findOne({where:{ ctMail: learnerData.lenMail }});

      if (emailExistsInLearnerTable) {
        let filedName=`lenMail-${key}`
        existingLearnerEmails.push(filedName);
      } else if (emailExistsInCreatorTable) {
        let filedName=`lenMail-${key}`
        existingCreatorEmails.push(filedName);
      }
    }
  }
}
      //  return res.status(400).json({ status: "Failure", message: invalidEmails });
        if (invalidEmails.length > 0) {
           res.status(400).json({ status: "ValidationFailure", message: "Invalid email format",mails: invalidEmails });
        } else if (existingLearnerEmails.length > 0){
          res.status(400).json({ status: "existingLearnerEmails", message: "The Mail Already In Learner",mails: existingLearnerEmails });
        }
        else  if (existingCreatorEmails.length > 0){
          res.status(400).json({ status: "existingCreatorEmails", message: "The Mail Already In Creator", mails:existingCreatorEmails });
        }
        else{

        if (typeof learnerDataObject === 'object' && learnerDataObject !== null) {

          const results = []; // Array to store results

          for (const key in learnerDataObject) {
            if (learnerDataObject.hasOwnProperty(key)) { 
              // Access the value for the current key
              const value = learnerDataObject[key];
              defaultData.lenUUID = defaultData.lenUUID ||uuidv4();
              // Check if value.lenGender is an object and replace it with an empty string
              if (value && typeof value.lenGender === 'object') {
                value.lenGender = null;
              }
              if (value && (typeof value.lenCountryId === 'object' || Array.isArray(value.lenCountryId))) {
                value.lenCountryId = null;
            }
            if (value && (typeof value.lenAge === 'object' || Array.isArray(value.lenAge))) {
                value.lenAge = null;
            }
              const mergedData = { ...defaultData, ...value };
          
              try {
                // Perform LmsLearner.create and store the result in the array
                const result = await LmsLearner.create(mergedData);
                results.push(result.lenId);
/****************************mail sending *************************************** */
if(result){
if(learnerConfig.learnerMailOptions.enableMailToSetPassword) {
  const mailOptions = {
    from: process.env.HOST_EMAIL,
    to: result.lenMail,
    subject: learnerConfig.learnerMailOptions.subject,
    html:
    `<h1>Greeting from Atlantis</h1><br><p>Your account for Atlantis has been created as Creator. So you have to set your account password by clicking the below link.,</p><br><a href="${process.env.FRONTEND_SERVER}` +
    `${learnerConfig.learnerMailOptions.navLink}` +
    `${result.lenUUID}` +
    `" target="_blank">${process.env.FRONTEND_SERVER}` +
    `${learnerConfig.learnerMailOptions.navLink}` +
    `${result.lenUUID}</a>`,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (!error) {
        res.status(201).json({
          status: "Success",
          message: "Creator Added Successfully",
        });
    } else {
      res
      .status(500)
      .json({ status: "Failure", error: "Internal Server Error", err: error });
    }
  });
}
              
else{
res.status(201).json({
  status: "Success",
  message: "Creator Added Successfully",
});
}
              }
              } catch (error) {
                console.error('Error creating learner data:', error);
                // Handle the error, e.g., return an error response
                res.status(500).json({ error: error.message });
                return;
              }
            }
          }
          // passwordSetMail(results);
          res.status(200).json({
            status: "Success",
            message: "Data stored in the database",
            data: results,
          });
          // Respond with success after all iterations
        } else {
          // If learnerDataObject is not an object
          res.status(500).json({
            status: "Failure",
            message: "Oops! Something went wrongssss",
            error: error.message,
          });
        }
      }
      }
    } catch (err) {
      console.error("Error in addlearner:", err.message); // Log the error for debugging
  
      res.status(500).json({
        status: "Failure",
        message: "Oops! Something went wrongs",
        error:err.message,
      });
    }
  };
  const updatelearner = async (req, res) => {
    try {
      const id = req.params.id;
      const data = req.body;
  
      const record = await LmsLearner.findByPk(id);
      if (!record) {
        return res.status(404).json({ status:'Failure',message: "Record not found" });
      }
      // const existingLearner = await LmsLearner.findOne({ lenMail: data.lenMail });
      // if (existingLearner) {
      //     return res.status(400).json({ status: "MailFailure", message: "Email already exists" });
      // }
      const updatedRecord = await record.update(data);
  
      res
        .status(200)
        .json({ status: "Success", message: "Data Updated Successfully", data: updatedRecord });
    } catch (error) {
      res.status(500).json({ status:'Failure', message: "Internal Server Error", err: error });
    }
  };
  const deletelearner = async (req, res) => {
    try {
      const id = req.params.id;
      const data = { lenDeleteStatus: "YES" }; // Define the data to update plDeleteStatus
      const record = await LmsLearner.findByPk(id);
      if (!record) {
        return res.status(404).json({status:'Failure',message: "Record not found" });
      }
      const updatedRecord = await record.update(data);
      res.status(200).json({
        status:'Success',
        message: "Record Successfully Marked as Deleted",
        data: updatedRecord,
      });
    } catch (error) {
      res.status(500).json({ status:'Failure',message: "Internal Server Error", err: error });
    }
  };
  
  const getlearner = async (req, res) => {
    try {
      const data=req.body;
      console.log("data leo",data);
      //  return res.status(404).json({ status: 'Failure', message: data });
      const LoginUserRole =req.user.user.role;
      const LoginUserId =req.user.user.id;

      const { count, rows: allData } = await LmsLearner.findAndCountAll({
        include: [
          {
            model: Creator,
            as: 'creator',
            attributes: ['ctName'],
            required: false,
          },
        ],
        order: [
          ['lenId', 'ASC'], // Sort the results by `lenLearnerId` in ascending order
        ],
        where: {
          [Op.and]: [
            {
              lenDeleteStatus: {
                [Op.or]: {
                  [Op.not]: "Yes",
                  [Op.is]: null,
                },
              },
            },
          ],
       
          ...(data.creatorId 
            ? { lenCreatorId: data.creatorId } // Apply this condition only if data.creatorId is present
            : {
              ...(LoginUserRole === 'Creator' ? {
                [Op.or]: [
                  { lenCreatorId: req.user.user.id },
                ],
              } : {}),
            }
          ),
          // ...(data.cohortId 
          //   ? { lenCohorts: data.cohortId } 
          //   : {
          //     ...(LoginUserRole === 'Creator' ? {
          //       [Op.or]: [
          //         { chId: req.user.user.id },
          //       ],
          //     } : {}),
          //   }
          // ),

          ...(data.companyId
            ? { lenCompanyId: data.companyId }
            : {}),
            
            ...(data.companyId
              ? { lenCompanyId: data.companyId }
              : {}),
              ...(data.cohortId
                ? {
                    lenCohorts: {
                      [Op.like]: `%${data.cohortId}%`,
                    },
                  }
                : {}),
        },
        
      });
      
    
      if (count === 0) {
        return res.status(404).json({ status: 'Failure', message: "No records found" });
      }
    
      res.status(200).json({
        status: 'Success',
        message: "All Data Retrieved Successfully",
        data: allData,
        count: count,
      });
    } catch (error) {
      res.status(500).json({ status: 'Failure', message: "Internal Server Error", error: error.message });
    }
    };
    
  
  const getlearnerById = async (req, res) => {
    try {
      const { id } = req.params;
  
      if (!id) {
        return res.status(400).json({ status:'Failure',message:'Bad Request'});
      }
  
      // Fetch data for the specific item based on the provided ID
      const specificData = await LmsLearner.findByPk(id);
  
      if (!specificData) {
        return res.status(404).json({ error: "Record not found" });
      }
  
      res
        .status(200)
        .json({ status:'Success',message: "Data Retrieved Successfully", data: specificData });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error", err: error });
    }
  };
  const updateStatus = async (req, res) => {
    try {
      const id = req.params.id;
  
      if (!id) {
        return res.status(400).json({ status: 'Failure', message: "ID not provided" });
      }
  
      // Find the current status
      const existingRecord = await LmsLearner.findByPk(id);
      
      if (!existingRecord) {
        return res.status(404).json({ status: 'Failure', message: "Record not found" });
      }
  
      // Toggle the status
      const newStatus = existingRecord.lenStatus === 'Active' ? 'Inactive' : 'Active';
  
      // Update the status
      const updatedCount = await LmsLearner.update(
        { lenStatus: newStatus },
        { where: { lenId: id } }
      );
  
      return res.status(200).json({ status: "Success", message: "Data Updated Successfully", data: { updatedCount, newStatus } });
    } catch (error) {
      res.status(500).json({ status: 'Failure', message: "Internal Server Error", err: error });
    }
  };
  
  
  const passwordSetMail = async (req, res) => {
    // try{
    console.log(req);
    for (const learnerId in req) {

      if(learnerConfig.learnerMailOptions.enableMailToSetPassword) {
        const mailOptions = {
          from: process.env.HOST_EMAIL,
          to: req.body.lenMail,
          subject: learnerConfig.learnerMailOptions.subject,
          html:
          `<h1>Greeting from Atlantis</h1><br><p>Your account for Atlantis has been created as Creator. So you have to set your account password by clicking the below link.,</p><br><a href="${process.env.FRONTEND_SERVER}` +
          `${learnerConfig.learnerMailOptions.navLink}` +
          `${result.ctUUID}` +
          `" target="_blank">${process.env.FRONTEND_SERVER}` +
          `${learnerConfig.learnerMailOptions.navLink}` +
          `${result.ctUUID}</a>`,
        };
        transporter.sendMail(mailOptions, (error, info) => {
          if (!error) {
              res.status(201).json({
                status: "Success",
                message: "Creator Added Successfully",
              });
          } else {
            res
            .status(500)
            .json({ status: "Failure", error: "Internal Server Error", err: error });
          }
        });
    }
    else{
      res.status(201).json({
        status: "Success",
        message: "Creator Added Successfully",
      });
    }
    // } catch (err) {
    //   res.status(500).json({
    //     status: "Failure",
    //     message: "RemainderMail not work",
    //     error: err.message,
    //   });
    // }
  }
  };
  
const gameCompleteList = async (req, res) => {
  const gameId = req.params.id;

  try {
    // Find completed games based on gameId
    const completedGames = await lmsGameActivityLog.findAll({
      where: {
        galGameId: gameId,
        galQuestionState: 'complete'
      },
      attributes: ['galLearnerId'] // Select only the learner ids
    });

    // Extract learner IDs from completed games
    const learnerIds = completedGames.map(game => game.galLearnerId);

    // Find learner details based on learner IDs
    const learnerDetails = await LmsLearner.findAll({
      where: {
        lenId: {
          [Op.in]: learnerIds // Filter by learner IDs from completed games
        }
      },
      include: [{
        model: companies, // Include the Company model for learner's company details
        attributes: ['cpCompanyName'], // Select only the company name
        as: 'companies' // Alias for the included Company model
      }],
      attributes: ['lenId', 'lenUserName', 'lenCompanyId'], // Select only the learner username and company ID
    });

    // Fetch game details
    const game = await lmsGame.findOne({
      where: { gameId },
      attributes: ['gameTitle', 'gameStoryLine']
    });

    // If game not found, return error
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Fetch feedback data related to the gameId
    const feedbackData = await lmsCollectFeedback.findAll({
      where: {
        feedGameId: gameId
      },
      attributes: ['feedLearnerId', 'feedContent', 'feedRecommendation', 'feedRelevance', 'feedGamification', 'feedBehaviour', 'feedOthers'] // Select feedback columns
    });

    // Filter out columns without values
    const filteredFeedbackData = feedbackData.map(feedback => {
      const feedbackValues = {};

      Object.keys(feedback.dataValues).forEach(key => {
        if (feedback[key] !== null && feedback[key] !== undefined && feedback[key] !== '') {
          feedbackValues[key] = feedback[key];
        }
      });
      return feedbackValues;
    });

    // Create the combined object structure
    const combinedData = learnerDetails.map(learner => {
      const learnerFeedback = filteredFeedbackData.filter(feedback => feedback.feedLearnerId === learner.lenId);
      return {
        username: learner.lenUserName,
        companyName: learner.companies.cpCompanyName,
        feedback: learnerFeedback
      };
    });

    // Return the formatted data along with game details
    return res.status(200).json({
      gameTitle: game.gameTitle,
      gameStoryLine: game.gameStoryLine,
      learnerFeedback: combinedData
    });
  } catch (error) {
    console.error('Error fetching game data:', error);
    return res.status(500).json({ error: 'Failed to fetch game data' });
  }
};

const getAssignedGames = async (req, res) => {
  try {
    const id = req.params.id;
    const GetAllData = [];

    const learners = await LmsLearner.findOne({
      attributes: ['lenUserName', 'lenCompanyId'],
      where:{lenId:id}
    });
    const lenUserName = learners.lenUserName;
    const cpID = learners.lenCompanyId;
    console.log('learnerslearners',cpID);

    const companiesName = await companies.findOne({
      attributes: ['cpCompanyName'],
      where:{cpId:cpID}
    });
    const companyName = companiesName.cpCompanyName;

    console.log('companies123',companiesName);

  const gamesAssignCount = await gameassinged.findAll({
      attributes: ['gaGameState'],
      where: { gaLearnerId: id },
    });

    GetAllData.push({
      companyName: companyName,
      lenUserName: lenUserName,
      gamesAssignCount:gamesAssignCount
      
    });

    return res.status(200).send({ status: 'success', message: "Get Success", data:GetAllData});

  } catch (error) {
    res.status(500).json({ status: 'Failure', message: "Internal Server Error", error: error.message });
  }
};

  
  module.exports = { addlearner ,updatelearner,deletelearner,getlearner,getlearnerById,updateStatus,passwordSetMail,gameCompleteList,getAssignedGames};
  