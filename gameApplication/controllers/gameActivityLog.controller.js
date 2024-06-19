const { generateToken } = require("../../lib/authentication/auth");
const { Sequelize, Op, where } = require('sequelize');
const transporter = require("../../lib/mails/mailService");
const { adminRegisterSchema, adminLoginSchema } = require("../../lib/validation/admin.validation");
const Learnerprofile = require("../../models/learner")
const GameTable = require("../../models/game");
const BlockTable = require("../../models/blocks");
const QuestionTable = require("../../models/questionOptions");
const AssetTable = require("../../models/gameAsset");
const SkillTable = require('../../models/skills');
const ReflectionTable = require('../../models/reflectionQuestions');

const bcrypt = require('bcrypt');

const sequelize = require("../../lib/config/database");

const Activity =require("../../models/gameActivityLog")
const GamePlayHistory =require("../../models/gamePlayHistory")


const createActivity = async (req, res) => {
  try {
    let data = req?.body
    const LoginUserId =req.user.user.id;
   
    const createActivity = await Activity.create({ 
      galGameId:data.gameId,
      galQuestNo:data.questNo,
      galLearnerId:LoginUserId,
      galQuestionState:'start',
      galBlockId:null,
      galTimeSpent:0,
      // galBadgeId: data.galBadgeId, //uncomment in old db
      galAverageScore:data.averageScore,
      galCreatedDate:Date.now(),
      galUserAgent:req.headers["user-agent"],
      galIpAddress:req.connection.remoteAddress,
      galDeviceType:req.device.type,
      galStartDateTime:Date.now(),
    });



    if(createActivity){
      console.log('ActivityCreate---',createActivity)
      return res.status(200).json({ status: 'Success', message: "Activity Created" ,data:createActivity.galId });
    }
    
    else{
      return res.status(500).json({ status: 'Failure', message: "Internal Server Error"});
    }
  } catch (error) {
    res.status(500).json({ status: 'Failure', message: "Internal Server Error", err: error.message });
  }

}

const ReacordActivity = async (req, res) => {
  try {

    const LoginUserId =req.user.user.id;

    const { id } = req.params;
    console.log('paramsId--',id);
    // Add By Lokie
    let data = req?.body;
    console.log('body12345',data);
    const getQuestList = await QuestionTable.findAll({
      attributes: ['qpQuestNo', [Sequelize.fn('MAX', Sequelize.col('qpScore')), 'maxQpScore']],
      where: {
        qpGameId: data.gameId,
        qpDeleteStatus: 'No'
      },
      group: ['qpQuestNo'],
      order: [[Sequelize.fn('MAX', Sequelize.col('qpScore')), 'DESC']]
    });
    
    const formattedQuestList = getQuestList.map(quest => ({
      qpQuestNo: quest.qpQuestNo,
      qpScore: quest.get('maxQpScore')
    }));
    
    console.log('formattedQuestList',formattedQuestList);
    const totalQpScore = formattedQuestList.reduce((sum, quest) => sum + parseInt(quest.qpScore, 10), 0);
    console.log('totalQpScore123',totalQpScore)
    // End By Lokie
    
    let totoalscore
    let gameflow = [];
    const  getlastScore= await Activity.findOne({
      where: { 
        // galId : LoginUserId
        galId : id,
      },
      });
      console.log('getlastScore==',getlastScore)


   if(data.blockname==='interaction'){

      // totoalscore=getlastScore.galAverageScore+data.galAverageScore
      if (getlastScore && getlastScore.galAverageScore !== null && data.galAverageScore !== null) {
        totoalscore = parseFloat(getlastScore.galAverageScore) + parseFloat(data.galAverageScore);
        console.log('ActivityScore---', totoalscore);
      } else if (data.galAverageScore !== null) {
        totoalscore = parseFloat(data.galAverageScore);
      } else {
        console.log('No valid score found in data');
      }

      console.log('ActivityScore---',totoalscore)
      /*(*/

      /*)*/

      console.log('ActivityScore123---',totoalscore)

   }
   const [rowCount, updatedRows] = await Activity.update({
    galTimeSpent: data.lenUserName,
    ...(data.blockname === 'interaction' ? { galAverageScore: totoalscore } : {}),
    ...(data.blockname === 'interaction' ? { galHighestScore: totalQpScore } : {}),// Add By Lokie
    ...(data.navigateId === 'Complete' ? { galEndDateTime: Date.now()} : {}),
    galBlockId: parseInt(data.galBlockId, 10),
    ...(data.navigateId === 'Complete' ? { galQuestionState:'complete'} : {}),
    // galBadgeId: data.galBadgeId, //unComment in old db
    galTimeSpent:data.galTimeSpent,
    galCreatedDate: Date.now(),
    galUserAgent: req.headers["user-agent"],
    galIpAddress: req.connection.remoteAddress,
    galDeviceType: req.device.type,
    // galgameflow:getlastScore.galgameflow,
  }, {
    where: {
      galId: id,
    },
  });
    
    if (rowCount > 0) {
      console.log(`Update successful. ${rowCount} row(s) updated.`);
      console.log('ActivityTrack1---',updatedRows); // This will show the actual updated rows
      return res.status(200).json({ status: 'Success', message: `Update successful. ${rowCount} row(s) updated.`,getUpdatedata:getlastScore
    });
    } else {
      console.log(`No rows were updated.`);
      return res.status(400).json({ status: 'Failure', message: `No rows were updated.` });
   
    }




  } catch (error) {
    res.status(500).json({ status: 'Failure', message: "Internal Server Error", err: error.message });
  }

}

// Afrith-modified-starts-08/Apr/24,09/APr/24

// const ReacordActivity = async (req, res) => {
//   try {
//     const LoginUserId = req.user.user.id;
//     const { id } = req.params;
//     console.log('paramsId--', id);

//     let data = req.body;
//     console.log('body12345', data);

//     const getQuestList = await QuestionTable.findAll({
//       attributes: ['qpQuestNo', [Sequelize.fn('MAX', Sequelize.col('qpScore')), 'maxQpScore']],
//       where: {
//         qpGameId: data.gameId,
//         qpDeleteStatus: 'No'
//       },
//       group: ['qpQuestNo'],
//       order: [[Sequelize.fn('MAX', Sequelize.col('qpScore')), 'DESC']]
//     });

//     const formattedQuestList = getQuestList.map(quest => ({
//       qpQuestNo: quest.qpQuestNo,
//       qpScore: quest.get('maxQpScore')
//     }));

//     console.log('formattedQuestList', formattedQuestList);
//     const totalQpScore = formattedQuestList.reduce((sum, quest) => sum + parseInt(quest.qpScore, 10), 0);
//     console.log('totalQpScore123', totalQpScore);

//     let totoalscore;
//     let gameflow = [];
//     const getlastScore = await Activity.findOne({
//       where: { 
//         galId: id,
//       },
//     });
//     console.log('getlastScore==', getlastScore);

//     if (data.blockname === 'interaction') {
//       if (getlastScore && getlastScore.galAverageScore !== null && data.galAverageScore !== null) {
//         totoalscore = parseFloat(getlastScore.galAverageScore) + parseFloat(data.galAverageScore);
//         console.log('ActivityScore---', totoalscore);
//       } else if (data.galAverageScore !== null) {
//         totoalscore = parseFloat(data.galAverageScore);
//       } else {
//         console.log('No valid score found in data');
//       }

//       console.log('ActivityScore---', totoalscore);
//     }

//     var today = new Date().toISOString().split('T')[0];

//     // Update galDailyScore
//     let galDailyScore = getlastScore && getlastScore.galDailyScore ? JSON.parse(getlastScore.galDailyScore) : [];
//     let galDS = getlastScore && getlastScore?.galDailyScore ? JSON.parse(getlastScore?.galDailyScore?.score) : [];
    


//     console.log('galDailyScoreUP--',galDailyScore)
//     console.log('galDS--',galDS)

//     if (!Array.isArray(galDailyScore)) {
//       galDailyScore = [];
//     }

//     const existingEntryIndex = galDailyScore.findIndex(entry => entry.date === today);
//     if (existingEntryIndex > -1) {
//       galDailyScore[existingEntryIndex].score += parseFloat(data.galAverageScore);
//     } else {
//       galDailyScore.push({ score: parseFloat(data.galAverageScore), date: today });
//     }

//     const galDailyScoreString = JSON.stringify(galDailyScore);
//     console.log('galDailyScoreString--',galDailyScoreString)


//     const [rowCount, updatedRows] = await Activity.update({
//       galTimeSpent: data.lenUserName,
//       ...(data.blockname === 'interaction' ? { galAverageScore: totoalscore } : {}),
//       ...(data.blockname === 'interaction' ? { galHighestScore: totalQpScore } : {}),
//       ...(data.navigateId === 'Complete' ? { galEndDateTime: Date.now() } : {}),
//       galBlockId: parseInt(data.galBlockId, 10),
//       ...(data.navigateId === 'Complete' ? { galQuestionState: 'complete' } : {}),
//       galBadgeId: data.galBadgeId,
//       galTimeSpent: data.galTimeSpent,
//       galDailyScore: galDailyScoreString,  // Ensure this is stringified only once
//       galCreatedDate: Date.now(),
//       galUserAgent: req.headers["user-agent"],
//       galIpAddress: req.connection.remoteAddress,
//       galDeviceType: req.device.type,
//     }, {
//       where: {
//         galId: id,
//       },
//     });

//     if (rowCount > 0) {
//       console.log(`Update successful. ${rowCount} row(s) updated.`);
//       console.log('ActivityTrack1---', updatedRows); // This will show the actual updated rows
//       return res.status(200).json({ status: 'Success', message: `Update successful. ${rowCount} row(s) updated.`, getUpdatedata: getlastScore });
//     } else {
//       console.log(`No rows were updated.`);
//       return res.status(400).json({ status: 'Failure', message: `No rows were updated.` });
//     }

//   } catch (error) {
//     res.status(500).json({ status: 'Failure', message: "Internal Server Error", err: error.message });
//   }
// }




const getGameAvgScore = async (req, res) => {
  const { id } = req.params;
  console.log('getGameAvgScoreID--', id);

  try {

    const result = await Activity.findOne({
      attributes: ['galId','galGameId','galQuestNo','galAverageScore'],  // Selecting only galGameId
      where: {
        galId: {
          [Sequelize.Op.eq]: Sequelize.literal(`(SELECT MAX(galId) FROM lmsgameactivitylog WHERE galGameId = '${id}')`)
        }
      }
    });
    

    console.log('getGameAvgScoreRes--', result);

    res.status(200).json({
      status: 'Success',
      message: 'Average scores retrieved successfully',
      data: result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'Failure',
      message: 'Error retrieving average scores',
      err: err.message,
    });
  }
};

const getGameOverallQuestScore = async (req, res) => {
  const { id } = req.params;
  console.log('getGameAvgScore--', id);

  try {
    // Find the maximum galId values for each galQuestNo for the given galGameId
    const maxGalIds = await Activity.findAll({
      attributes: [
        'galQuestNo',
        [Sequelize.fn('MAX', Sequelize.col('galId')), 'maxGalId']
      ],
      where: {
        galGameId: id
      },
      group: ['galQuestNo'],
      order: [['galQuestNo', 'ASC']]
    });

    // Extract the maximum galId values for each galQuestNo
    const galIds = maxGalIds.map(item => item.dataValues.maxGalId);

    // Fetch the corresponding galAverageScore values for the maximum galId values
    const results = await Activity.findAll({
      attributes: ['galId','galGameId', 'galQuestNo', 'galAverageScore'],
      where: {
        galId: {
          [Sequelize.Op.in]: galIds
        }
      }
    });

    res.status(200).json({
      status: 'Success',
      message: 'Average scores retrieved successfully',
      data: results,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'Failure',
      message: 'Error retrieving average scores',
      err: err.message,
    });
  }
};


//Afrith-modified-ends-08/Apr/24,09/Apr/24

//Priya-modified-starts-15/Apr/24 - getLastBlock
const getLastBlock = async (req, res) => {
  try {
    let data = req?.body;
    const LoginUserId = req.user.user.id;
    let getBlockActivity = await Activity.findAll({
      attributes: [
        "galId",
        "galGameId",
        "galQuestNo",
        "galLearnerId",
        "galGameState",
        "galBlockId",
        "galQuestionState",
        "galTimeSpent",
        "galgameflow",
        "galAverageScore",
      ],
      where: {
        galGameId: data.gameId,
        galQuestNo: data.questNo,
        galLearnerId: LoginUserId,
      },
      order: [['galId', 'DESC']],
      limit: 1,
      logging: (sql) => {
        console.log(sql);
      },
    });
    if(getBlockActivity){
    console.log('getBlockActivity---',getBlockActivity)
      return res.status(200).json({ status: 'Success', message: "Activity Created",data:getBlockActivity });
    }

    else{
      return res.status(500).json({ status: 'Failure', message: "Internal Server Error"});
    }
  } catch (error) {
    res
      .status(500)
      .json({
        status: "Failure",
        message: "Internal Server Error",
        err: error.message,
      });
  }
};



// GamePlayHistory
//Afrith-modified-starts-17/Apr/24 
const createGamePlayHistory = async (req, res) => {
 
  try {
    let data = req?.body
    const LoginUserId =req.user.user.id;
    const createGamePlayHistory = await GamePlayHistory.create({ 
      histActivityId: data.histActivityId,
      histLearnerId:LoginUserId,
      histGameId: data.histGameId,
      histQuestNo: data.histQuestNo,
      histBlockId: data.histBlockId,
      histType: data.histType,
      histNavigateTo: data.histNavigateTo,
      histOption: data.histOption,
      histScore: data.histScore,

      histCreatedDate:Date.now(),
      histIp:req.connection.remoteAddress,
      histUserAgent:req.headers["user-agent"],
      histDeviceType:req.device.type,
      histStartDateTime:Date.now(),
    });



    if(createGamePlayHistory){
      console.log('GamePlayHistCreate---',createGamePlayHistory)
      return res.status(200).json({ status: 'Success', message: "Activity Created" ,data:createGamePlayHistory.histId });
    }
    
    else{
      return res.status(500).json({ status: 'Failure', message: "Internal Server Error"});
    }
  } catch (error) {
    res.status(500).json({ status: 'Failure', message: "Internal Server Error", err: error.message });
  }

}


const getGamePlayHistory = async (req, res) => {
  const { id } = req.params;
  console.log('getGamePlayHistID--', id);
  let data = req?.body;
  try {
     let gameid =data.gameId;
     let questno = data.questNo;
    const result = await GamePlayHistory.findAll({
      attributes: [
        'histId',
        'histActivityId',
        'histLearnerId',
        'histGameId',
        'histQuestNo',
        'histBlockId',
        'histType',
        'histNavigateTo',
        'histOption',
        'histScore',
      ], 
      where: {
       histGameId:gameid,
       histQuestNo:questno,
        },
      order:[['histId', 'DESC']],
    });
    

    console.log('getGamePlayHistoryRes--', result);

    res.status(200).json({
      status: 'Success',
      message: 'Game Play History retrieved successfully',
      data: result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'Failure',
      message: 'Error retrieving Game Play History',
      err: err.message,
    });
  }
};
//Afrith-modified-ends-17/Apr/24

//Afrith-modified-starts-22/Apr/24
const getGameActId = async (req, res) => {
  const { id } = req.params;
  console.log('getGameId--', id);
  let data = req?.body;
  try {
     let gameid =data.gameId;
     let questno = data.questNo;
    const result = await Activity.findOne({
      attributes: [
        'galId',
        'galGameId',
        'galQuestNo',
      ], 
      where: {
        galGameId:gameid ,
        // galQuestNo:questno,
        },
      order:[['galGameId', 'DESC']],
    });
    

    console.log('getGameActId--', result);

    res.status(200).json({
      status: 'Success',
      message: 'GameActId retrieved successfully',
      data: result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'Failure',
      message: 'Error retrieving GameActId History',
      err: err.message,
    });
  }
};
//Afrith-modified-ends-22/Apr/24





module.exports = { createActivity, ReacordActivity,getLastBlock,  getGameAvgScore, getGameOverallQuestScore,getGamePlayHistory ,createGamePlayHistory,getGameActId}