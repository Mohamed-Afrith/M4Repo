const lmsGameActivityLog=require('../../models/gameActivityLog')
const LmsLearner = require("../../models/learner");
const gameassinged = require("../../models/gameassinged");
const LmsGame = require("../../models/game");
// const lmsGame = require("../../models/game");
const LoginHistory = require('../../models/loginHistory')
const { Sequelize, DataTypes, Op } = require('sequelize');
const lmsQuestionOptions=require('../../models/questionOptions')
const LmsBlocks=require('../../models/blocks');

const lmsgameplayhistory = require("../../models/gamePlayHistory");

const LmsCreator = require('../../models/Creator');
const Company = require("../../models/companies");
const Creator=require("../../models/Creator")
const LmsCohorts=require('../../models/cohorts')
const lmsCollectFeedback=require('../../models/feedbackScreen')
const getCreatorname = async (req, res) => {
  try {
      const data = req.body;
      const LoginUserRole = req.user.user.role;
      const LoginUserId = req.user.user.id;
 // Construct the where clause for filtering creators
 const whereClause = {
  [Op.and]: [
      {
          ctDeleteStatus: {
              [Op.or]: {
                  [Op.not]: "Yes",
                  [Op.is]: null,
              },
          },
      },
  ],
};
      const { count, rows: allData } = await Creator.findAndCountAll({
     
          order: [
              ['ctId', 'ASC'],
          ],
          where: {
              [Op.and]: [{
                  ctDeleteStatus: {
                      [Op.or]: {
                          [Op.not]: "Yes",
                          [Op.is]: null,
                      },
                  },
              }, 
            ],
              ...(data.creatorId 
                ? { ctId: data.creatorId } // Apply this condition only if data.creatorId is present
                : {
                  ...(LoginUserRole === 'Creator' ? {
                    [Op.or]: [
                      { ctId: req.user.user.id },
                    ],
                  } : {}),
                }
              ),
              ...(data.companyId
                ? { ctId: data.companyId }
                : {}),
                
                ...(data.companyId
                  ? { ctId: data.companyId }
                  : {}),
                  
                }
      });

      if (count === 0) {
          return res.status(404).json({ status: 'Failure', message: "No records found" });
      }
// Apply the condition to filter by data.creatorId if it's present
if (data.creatorId) {
  whereClause[Op.and].push({ ctId: data.creatorId });
} else if (LoginUserRole === 'Creator') {
  // If data.creatorId is not present and user role is Creator, filter by the logged-in user's ID
  whereClause[Op.and].push({ ctId: req.user.user.id });
}
      // Fetch mapped users data
      const lmsCreators = await Creator.findAll({
          attributes: ['ctId', 'ctName', 'ctCreatedUserId', 'ctCompanyId', 'ctStatus'],
          where: whereClause,
      });

      // Initialize an empty array to store mapped data
      const mappedUsers = [];

      // Map the fields from Sequelize model to your object
      const mappedCreators = await Promise.all(lmsCreators.map(async(creator) => {
        
          // Count the number of learners associated with this creator
          const learnerCount = await LmsLearner.count({
            where: {
                LenCreatorId: creator.ctId,
                lenDeleteStatus :'NO'
            }
        });

        // Count the number of games launched associated with this creator
        const gameCount = await LmsGame.count({
            where: {
                gameGameStage: 'Launched',
                gameCreatorUserId: creator.ctId,
                gameDeleteStatus:'NO'
            }
        });

        const gameCountforlaunched = await LmsGame.count({
            where: {
                gameGameStage: 'Review',
                gameCreatorUserId: creator.ctId,
                gameDeleteStatus:'NO'
            }
        });

        const gameCountGroupedByExtension = await LmsGame.count({
            attributes: ['gameExtensionId'],
            where: {
                gameCreatorUserId: creator.ctId,
                gameDeleteStatus:'NO'
            },
            group: ['gameExtensionId']
        });

    
      const timeSpentData = await LoginHistory.findAll({
        attributes: ['lgTotalTime','lgUserId'],
        
        where: {
          lgUserId:creator.ctId,
          lgUserRole: 'Creator',
        
          }
        
      });

      // Function to convert "HH:MM:SS" to seconds
function timeStringToSeconds(timeString) {
  if (!timeString) {
    return 0; // Return 0 if timeString is null or undefined
  }
  const [hours, minutes, seconds] = timeString.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds;
}

// Function to convert seconds to "HH:MM:SS"
function secondsToTimeString(seconds) {
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  seconds = seconds % 60;
  return `${hours}:${minutes}:${seconds}`;
}

// Summing the total time in seconds
let totalTimeInSeconds = 0;
timeSpentData.forEach(record => {
  totalTimeInSeconds += timeStringToSeconds(record.lgTotalTime);
});

// Converting total time back to "HH:MM:SS"
const totalTimeString = secondsToTimeString(totalTimeInSeconds);

console.log(`Total time for user ${creator.ctId}: ${totalTimeString}`);

      const FindLastActiveDate = await LoginHistory.findOne({
        attributes: [
          [Sequelize.fn('DATE', Sequelize.fn('MAX', Sequelize.col('createdAt'))), 'lastDate'],
          'lgUserId'
        ],
        where:{
          lgUserId:creator.ctId,
          lgUserRole: 'Creator',
        
        },raw:true
      })
    

     
        // const LastActiveDate = FindLastActiveDate.createdAt;
        const lastActiveDate = FindLastActiveDate.lastDate || 0;

          // Map the fields from Sequelize model to your object
          return {
              id: creator.ctId,
              name: creator.ctName,
              company:creator.ctCompanyId,
              nooflearners: learnerCount,
              noofgamespublished: gameCount,
              noofgameslaunched: gameCountforlaunched,
              noofgames: gameCountGroupedByExtension.length,
               timeSpent:totalTimeString,
              LastActiveDate:lastActiveDate
          }
      }));

      mappedUsers.push(mappedCreators);

      // Send response with mappedUsers data
      res.status(200).json({
          status: 'Success',
          message: "All Data Retrieved Successfully",
          datas: allData,
          count: count,
          data:mappedCreators
          // mappedUsers: mappedUsers // Sending mappedUsers data in response
      });
  } catch (error) {
      res.status(500).json({ status: 'Failure', message: "Internal Server Error", error: error.message });
  }
};

const getGameWiseData = async (req, res) => {
    try {
      // const log = await lmsGameActivityLog.findOne();
      // const galGameId = log.galGameId;
      // if (log) {
      // const galLearnerId = log.galLearnerId;
      // LOkieDatasLeaners { creatorId: 2, cohortId: '' }
  
      const data = req.body;
      console.log('Datas234567', data);
      const LoginUserId = req.user.user.id;
     console.log("LoginUserId",LoginUserId);
      const assignGameID=data.gamesAssignCount;
      //  const assignGameID=[1,2];
     console.log("assignGameID",assignGameID);
      // companyId  creatorId  cohortId  lenUserName
      let condition;
      
      if (LoginUserId) {
        condition = {
          // where: {
          //   gameCreatorUserId: LoginUserId,
          // },

          where: {
            [Op.and]: [
              {
                gameDeleteStatus: {
                  [Op.or]: {
                    [Op.not]: "Yes",
                    [Op.is]: null,
                  },
                },
              },
              // type !== "All" ? { gameGameStage: type } : {},
              // data.gameCategoryId
              //   ? { gameCategoryId: { [Op.like]: `%${data.gameCategoryId}%` } }
              //   : {},
            ],
            [Op.or]: [
              {
                gameCreatorUserId: LoginUserId,
              },
              {
                gameAnotherCreatorId: LoginUserId,
              },
            ],
          },
          group: ["gameExtensionId"],
          order: [["updatedAt", "DESC"]],
         
        };
      }
   
  console.log("data.creatorId",condition)
      // if (data.companyId) {
      //   condition = {
      //     where: {
      //       gameCreatorUserId: data.companyId,
      //     },
      //   };
      // }
      
      const gameWiseData = [];
//    const learners = await LmsLearner.findAll();
  
//    for (const learner of learners) {
//   const lenMail = learner.lenMail;
//       const lenUserName = learner.lenUserName;
//       const lenCompanyId = learner.lenCompanyId;
//       const lenId = learner.lenId;
  

      const Games = await LmsGame.findAll(condition);
 
  
  for (const Game of Games) {
    try {
    
    const gameId = Game.gameId;
   
    // const gameIddata = await LmsGame.findAll({
    //   where: { gameCreatorUserId: LoginUserId },
    //   attributes: ['gameId'],
    //   group:['gameId'],

    // });
     console.log("gameIdpower",gameId);
    //  const gameId = gameIddata.map(option => option.gameId);
    //  console.log("gameIdpowerman",gameId);
    const gameName=Game.gameTitle;
const gameCreatorUserId=Game.gameCreatorUserId;

      const gamesAssignCount = await gameassinged.count({
        where: { gaGameId: gameId },
        
        
        
      });
 
      const CompletedCount = await lmsGameActivityLog.count({
        where: { galGameId: gameId,
           galQuestionState: 'complete' }
      });
  
      const progressCount = await lmsGameActivityLog.count({
        where: { galGameId: gameId, galQuestionState: 'start' }
      });
      const startedCounts = await lmsGameActivityLog.count({

                where: {
                  galGameId: gameId,
                  galQuestionState: {
                    [Sequelize.Op.ne]: 'complete'
                  }
                },
                group: ['galGameId']
              });
  
              const startedCount = startedCounts.length;

         const gamesAssignedData = await gameassinged.findAll({
                where: {
                  gaGameId: assignGameID
                },
                attributes: ['gaGameId'],
                group:['gaGameId'],
              });
    
              const gameAssignedIds = gamesAssignedData.map(option => option.gaGameId);
              console.log("gameAssignedIds", gameAssignedIds);
              // const orignalGameId=gameId==gameAssignedIds;
    
              // Check if gameId matches any value in gameAssignedIds
              const isGameIdAssigned = gameAssignedIds.includes(gameId);
    
              if (isGameIdAssigned) {
                  // If gameId is assigned, get the matching values
                  const matchingGameIds = gameAssignedIds.filter(id => id === gameId);
                  console.log("Matching Game IDs:", matchingGameIds);
                  // Do something with matchingGameIds
              } else {
                  console.log("Game ID is not assigned");
                  // Handle the case when gameId is not assigned
              }
              // console.log("orignalGameId",orignalGameId);
              const gamesNotAssignedData = await gameassinged.findAll({
                where: {
                  gaGameId: { [Op.notIn]: assignGameID }
                },
                attributes: ['gaGameId'],
                group:['gaGameId'],
              });
    
          const gameNotAssignedIds = gamesNotAssignedData.map(option => option.gaGameId);
          console.log("gameNotAssignedIds", gameNotAssignedIds);
              
      const originalScore = await LmsGame.findAll({
        attributes: ['gameTotalScore'],
        where: {
          gameId: Sequelize.col('lmsGameActivityLogs.galGameId'),
        },
        include: [{
          model: lmsGameActivityLog,
          required: true,
        }],
        group: Sequelize.col('lmsGameActivityLogs.galLearnerId')
      });
  
      const [originalScores] = originalScore;
      const originalScoretosend = originalScores ? originalScores.gameTotalScore : null;
  
      const timesAttended = await lmsGameActivityLog.count({
 where: { galGameId: gameId,  
  // galQuestionState: 'start'
                  }
                });
     
  
  
      gameWiseData.push({
        // lenId: lenId,
        // lenMail: lenMail,
        // lenUserName: lenUserName,
        // lenCompanyId: lenCompanyId,
        gameID:gameId,
        GameName:gameName,
        gamesAssignCount: gamesAssignCount,
        completed: CompletedCount,
        started: startedCount,
        progress:progressCount,
        finalScore: originalScoretosend,
        originalScore: originalScoretosend,
        timesAttended:timesAttended,
        //  timeSpent: timeSpent,
        AssignedIds:gameAssignedIds,
        NotAssignedIds:gameNotAssignedIds
       
      });

// }
    } catch (error) {
      console.error('Error processing learner data:', error);
    }
    
  }
  

  console.log('Learner Datasss234:', gameWiseData);
  
      return res.status(200).json({ status: "Success", message: "Data Updated Successfully", data: gameWiseData });
  
    } catch (error) {
      console.error('Error fetching data:', error);
      return res.status(500).json({ status: 'Failure', message: "Internal Server Error", err: error.message });
    }
  }
  
  const getSkillWiseScore = async (req, res) => {
    
    const learnerGameId = req.params.id; // Assuming you have this value
    console.log("learnerGameId", learnerGameId);
    try {
      // Find the game based on gameId
      const game = await LmsGame.findOne({
        where: { gameId: learnerGameId },
        attributes: ['gameTitle', 'gameStoryLine', 'gameQuestNo']
      });
  
      if (!game) {
        return res.status(404).json({ message: 'Game not found' });
      }
  
      // Find the relevant lmsQuestionOptions based on gameId
      const questOptions = await lmsQuestionOptions.findAll({
        where: { qpGameId: learnerGameId },
        attributes: ['qpQuestNo', 'qpGameId', 'qpScore','qpQuestionId'], // specify the attributes you want to select
        group: ['qpQuestionId', 'qpGameId']
      });
      console.log("options",questOptions);
      const questionIds = questOptions.map(option => option.qpQuestionId);
      console.log("questionIds", questionIds);
  


      const blocks = await LmsBlocks.findAll({
        where: { blockGameId: learnerGameId, blockId: questionIds },
        attributes: ['blockText', 'blockQuestNo',"blockId",'blockGameId'],
        gropu: ['blockId', ],
      });
      const blockQuestion = blocks.map(option => option.blockText);
      console.log("questionIds", blockQuestion);


  console.log("blocks text",blocks);
      const maxScores = await lmsQuestionOptions.findAll({
        where: { qpGameId: learnerGameId },
        attributes: [
          'qpQuestNo',
          [Sequelize.fn('MAX', Sequelize.col('qpScore')), 'maxScore']
        ],
        group: ['qpQuestNo']
      });
  
      // Process the results into a single object
      const maxscoredata = {};
      maxScores.forEach(score => {
        maxscoredata[score.qpQuestNo] = score.get('maxScore');
      });
  
      // Extract qpQuestNo and qpGameId from questOptions
      const questNumbers = questOptions.map(option => ({
        qpQuestNo: option.qpQuestNo,
        qpGameId: option.qpGameId,
        qpScore: option.qpScore,
      }));
  
      console.log("maxscoredata", maxscoredata);
  
      // Find matching blocks based on qpQuestNo and qpGameId
      const SkillTags = await LmsBlocks.findAll({
        where: {
          blockGameId: learnerGameId,
          blockQuestNo: questNumbers.map(option => option.qpQuestNo),
        },
        attributes: ['blockQuestNo', 'blockSkillTag'] // Select only the blockQuestNo and blockSkillTag
      });
  
      // Single dummy question
      // const dummyQuestion = { interaction: "dummy question ?" };
  
      // Construct the response data
      // const responseData = questNumbers.map(qn => ({
      //   gameQuestNo: qn.qpQuestNo,
      //   // dummyQuestions: [dummyQuestion],
      //   blockQuestion,
      //   data: SkillTags.filter(tag => tag.blockQuestNo === qn.qpQuestNo),
      //   maxscoredata: { [qn.qpQuestNo]: maxscoredata[qn.qpQuestNo] }
      // }));
      const responseData = questNumbers.map(qn => {
        const filteredBlockQuestion = blockQuestion.filter((_, index) => index === qn.qpQuestNo - 1);
        return {
          gameQuestNo: qn.qpQuestNo,
          blockQuestion: filteredBlockQuestion.length > 0 ? filteredBlockQuestion[0] : null,
          data: SkillTags.filter(tag => tag.blockQuestNo === qn.qpQuestNo),
          maxscoredata: { [qn.qpQuestNo]: maxscoredata[qn.qpQuestNo] }
        };
      });
      
  
      // Send the constructed response data
      return res.status(200).json({ status: "Success", data: responseData,game ,questOptions,blocks });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error", err: error });
    }
  };



  const getGamesList = async(req,res) =>
    {
           try{
              const data = req.body;
              const creatorsWithCompanies = await LmsCreator.findAll({
                attributes: ['ctId', 'ctName', 'ctCreatedUserId', 'ctCompanyId', 'ctStatus'],
                include: [{
                  model: Company, // Use the model name defined in Sequelize
                  attributes: ['cpId', 'cpCompanyName'],
                  where: {
                    [Op.and]: [
                      {
                        cpDeleteStatus: {
                          [Op.or]: {
                            [Op.not]: "YES",
                            [Op.is]: null,
                          },
                        },
                      },
                      Sequelize.literal('`lmscreator`.`ctCompanyId` = `lmscompany`.`cpId`'),
                    ],
                  },
                  required: true,
                }],
                
                where: {
                  [Op.and]: [
                    {
                      ctDeleteStatus: {
                        [Op.or]: {
                          [Op.not]: "YES",
                          [Op.is]: null,
                        },
                      },
                      ctId: data.CreatorId,
                    },
                  ],
                },
              });
              if(data.pathName === 'Noofgame')
                {
                  const gameCountGroupedByExtension = await LmsGame.findAll({
                    where: {
                        gameCreatorUserId: data.CreatorId,
                        gameDeleteStatus:'NO'
                    },
                    group: ['gameExtensionId']
                });
                return res.status(200).json({ status: "Success", data:gameCountGroupedByExtension,CreatorDetail:creatorsWithCompanies });
                }
             else if(data.pathName === 'Noofgamelaunch')
              {
                const gameCountforlaunched = await LmsGame.findAll({
                  where: {
                      gameGameStage: 'Review',
                      gameCreatorUserId: data.CreatorId,
                      gameDeleteStatus:'NO'
                  }
              });
              return res.status(200).json({ status: "Success", data:gameCountforlaunched ,CreatorDetail:creatorsWithCompanies  });
              }
              else if(data.pathName === 'Noofgamepublish')
                {
                  const gameCount = await LmsGame.findAll({
                    where: {
                        gameGameStage: 'Launched',
                        gameCreatorUserId: data.CreatorId,
                        gameDeleteStatus:'NO'
                    }
                });
                return res.status(200).json({ status: "Success", data:gameCount ,CreatorDetail:creatorsWithCompanies  });
                }
           }
           catch(error){
            console.error('Error:', error);
            res.status(500).json({ message: 'An error occurred', error });
           }
    }
    const getLearnerData = async (req, res) => {
      try {
        const { id } = req.params;
        const creatorsWithCompanies = await LmsCreator.findAll({
          attributes: ['ctId', 'ctName', 'ctCreatedUserId', 'ctCompanyId', 'ctStatus'],
          include: [{
            model: Company, // Use the model name defined in Sequelize
            attributes: ['cpId', 'cpCompanyName'],
            where: {
              [Op.and]: [
                {
                  cpDeleteStatus: {
                    [Op.or]: {
                      [Op.not]: "YES",
                      [Op.is]: null,
                    },
                  },
                },
                Sequelize.literal('`lmscreator`.`ctCompanyId` = `lmscompany`.`cpId`'),
              ],
            },
            required: true,
          }],
          
          where: {
            [Op.and]: [
              {
                ctDeleteStatus: {
                  [Op.or]: {
                    [Op.not]: "YES",
                    [Op.is]: null,
                  },
                },
                ctId: id,
              },
            ],
          },
        });
        if (!id) {
          return res.status(400).json({ status: 'Failure', message: 'Bad Request' });
        }
    
        const specificData = await LmsLearner.findAll({
          where: {
            lenCreatorId: id,
            lenDeleteStatus :'NO'
          }
        });
    
        // if (!specificData.length) {
        //   return res.status(404).json({ status: 'Failure', message: "Record not found" });
        // }
    
        res.status(200).json({ status: 'Success', message: "Data Retrieved Successfully", data: specificData, CreatorDetail:creatorsWithCompanies });
      } catch (error) {
        res.status(500).json({ status: 'Failure', message: "Internal Server Error", error: error.message });
      }
    };
  
    const gamesListData= async (req,res)=>{
      try {
        const data=req.body;
        //  return res.status(404).json({ status: 'Failure', message: data });
        console.log('data************',data);
        const LoginUserId = data.id;
         const LoginUserRole =data.role;
         if(LoginUserRole === 'Admin')
          {
            const { count, rows: allData } = await LmsGame.findAndCountAll({
          
          order: [
            ['gameId', 'ASC'], // Sort the results by `lenLearnerId` in ascending order
          ],
          where: {
                gameDeleteStatus:  "No",
                },
              });
         if (count === 0) {
          return res.status(404).json({ status: 'Failure', message: "No records found" });
        }
        return res.status(200).json({
          status: 'Success',
          message: "All Data Retrieved Successfully",
          data: allData,
          count: count,
        });
          }
          else if(LoginUserRole === 'Creator')
            {
              const { count, rows: allData } = await LmsGame.findAndCountAll({
            
                order: [
                  ['gameId', 'ASC'], // Sort the results by `lenLearnerId` in ascending order
                ],
                where: {
                      gameDeleteStatus:  "No",
      gameCreatorUserId:LoginUserId,
                      },
                    });
                   
               if (count === 0) {
                return res.status(404).json({ status: 'Failure', message: "No records found" });
              }
              return res.status(200).json({
                status: 'Success',
                message: "All Data Retrieved Successfully",
                data: allData,
                count: count,
              });
            }
        // const LoginUserId =req.user.user.id;
    
        
        
      
       
      
       
      } catch (error) {
        return res.status(500).json({ status: 'Failure', message: "Internal Server Error", error: error.message });
      }
    
    }
    const updatecohortsgame = async (req, res) => {
      const data = req.body;
      const gamereqId = data.gameId;
      const gamereqCohorts = data.gameCohorts;
    
      try {
          const FindGameData = await LmsGame.findAll({
              where: {
                  gameId: {
                      [Op.in]: gamereqId,
                  },
              },
          }); 
    
          if (FindGameData.length > 0) {
              await Promise.all(FindGameData.map(async (value) => {
                  let filterDatacohorts = value.gameCohorts ? [...JSON.parse(value.gameCohorts)] : [];
    console.log('value.gameCohorts',value.gameCohorts,'.....',gamereqId);
                  // Check if the current lenId is in the lenreqId array
                  if (gamereqId.includes(value.gameId)) {
                      // If lenreqCohorts is an array
                      if (gamereqCohorts !== null) {
                      if (Array.isArray(gamereqCohorts)) {
                          filterDatacohorts = [...filterDatacohorts, ...gamereqCohorts];
                      } else {
                          // If lenreqCohorts is a single value
                          filterDatacohorts.push(gamereqCohorts);
                      }
    
                      // Remove duplicates if necessary (optional)
                      filterDatacohorts = [...new Set(filterDatacohorts)];
    
                    const Updatedata =  await LmsGame.update(
                          { gameCohorts: filterDatacohorts },
                          { where: { gameId: value.gameId } }
                      );
                    }
                      console.log('valueschorts', filterDatacohorts,'...',filterDatacohorts);
                  }
              }));
    
              res.status(200).send({status:'success', message: 'Update successful',data :FindGameData});
          } else {
              res.status(404).send({ message: 'No learners found' });
          }
      } catch (error) {
          console.error(error);
          res.status(500).send({ message: error.message });
      }
    };

    const gameAnswer = async (req, res) => {
      try {
        const gameId = req.params.id;
        console.log('Received id:', gameId);
    
        const game = await LmsGame.findOne({
          where: { gameId },
          attributes: ['gameTitle', 'gameStoryLine', 'gameQuestNo']
        });
    
        if (!game) {
          return res.status(404).json({ message: 'Game not found' });
        }
    
        const QuestNo = await lmsQuestionOptions.findAll({
          where: { qpGameId: gameId },
          attributes: ['qpQuestNo','qpQuestionId'],
          group: ['qpQuestionId'],
        });
        console.log("leoname qpQuestionId:QuestNo", QuestNo);
    
        const options = await lmsQuestionOptions.findAll({
          where: { qpGameId: gameId },
          attributes: ['qpOptions', 'qpOptionText', 'qpTag', 'qpScore', 'qpQuestionId'],
        });
        console.log("options", options);
        const questionIds = options.map(option => option.qpQuestionId);
        console.log("questionIds", questionIds);
    
        const blocks = await LmsBlocks.findAll({
          where: { blockGameId: gameId, blockId: questionIds },
          attributes: ['blockText', 'blockQuestNo', 'blockId'],
        });
        console.log("blocks", blocks);
    
        let optionsObject = {};
        let ansObject = {};
        let scoreObject = {};
    
        options.forEach(option => {
          let questionId = option.qpQuestionId;
          if (!optionsObject[questionId]) {
            optionsObject[questionId] = {};
          }
          optionsObject[questionId][option.qpOptions] = option.qpOptionText ? option.qpOptionText : "";
          if (!ansObject[questionId]) {
            ansObject[questionId] = {};
          }
          ansObject[questionId][option.qpOptions] = option.qpTag ? option.qpTag : "";
          if (!scoreObject[questionId]) {
            scoreObject[questionId] = {};
          }
          scoreObject[questionId][option.qpOptions] = option.qpScore ? option.qpScore : "";
        });
    
        const formattedInteractionBlocks = QuestNo.map(({ qpQuestNo, qpQuestionId }) => {
          const block = blocks.find(block => block.blockQuestNo === qpQuestNo); // Find the block with the matching QuestNo
          return {
            QuestNo: qpQuestNo,
            question: block ? `${block.blockQuestNo}: ${block.blockText}` : '', // If block is found, create the question, otherwise leave it empty
            qpQuestionId: QuestNo.filter(q => q.qpQuestNo === qpQuestNo),
            values: {
              ansObject: ansObject[qpQuestionId],
              optionsObject: optionsObject[qpQuestionId],
              scoreObject: scoreObject[qpQuestionId]
            }
          };
        });
    
        console.log("formattedInteractionBlocks", formattedInteractionBlocks);
    
        res.status(200).json({
          gameTitle: game.gameTitle,
          QuestNo,
          blocks,
          gameStoryLine: game.gameStoryLine,
          value: {
            interactionBlocks: formattedInteractionBlocks
          }
        });
      } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'An error occurred', error });
      }
    };


        const learnerListData = async (req, res) => {
      try {
        const data = req.body;
        //  return res.status(404).json({ status: 'Failure', message: data });
        console.log("data************", data);
        const LoginUserId = data.id;
        const LoginUserRole = data.role;
        if (LoginUserRole === "Admin") {
          const { count, rows: allData } = await LmsLearner.findAndCountAll({
            order: [
              ["lenId", "ASC"], // Sort the results by `lenLearnerId` in ascending order
            ],
            where: {
              lenDeleteStatus: "No",
            },
          });
          if (count === 0) {
            return res
              .status(404)
              .json({ status: "Failure", message: "No records found" });
          }
          res.status(200).json({
            status: "Success",
            message: "All Data Retrieved Successfully",
            data: allData,
            count: count,
          });
        }
        else if(LoginUserRole === "Creator")
          {
            const { count, rows: allData } = await LmsLearner.findAndCountAll({
              order: [
                ["lenId", "ASC"], // Sort the results by `lenLearnerId` in ascending order
              ],
              where: {
                lenCreatorId: LoginUserId,
                lenDeleteStatus: "No",
              },
            });
            if (count === 0) {
              return res
                .status(404)
                .json({ status: "Failure", message: "No records found" });
            }
            res.status(200).json({
              status: "Success",
              message: "All Data Retrieved Successfully",
              data: allData,
              count: count,
            });
          }
        // const LoginUserId =req.user.user.id;
      } catch (error) {
        res
          .status(500)
          .json({
            status: "Failure",
            message: "Internal Server Error",
            error: error.message,
          });
      }
    };
    const updatecohortsLearner = async (req, res) => {
      const data = req.body;
      const lenreqId = data.lenId;
      const lenreqCohorts = data.lenCohorts;
    
      try {
        const FindLearnerData = await LmsLearner.findAll({
          where: {
            lenId: {
              [Op.in]: lenreqId,
            },
          },
        });
    
        if (FindLearnerData.length > 0) {
          await Promise.all(
            FindLearnerData.map(async (value) => {
              let filterDatacohorts = value.lenCohorts? [...JSON.parse(value.lenCohorts)]: [];
    
              // Check if the current lenId is in the lenreqId array
              if (lenreqId.includes(value.lenId)) {
                // If lenreqCohorts is an array
                if (lenreqCohorts !== null) {
                  if (Array.isArray(lenreqCohorts)) {
                    filterDatacohorts = [...filterDatacohorts, ...lenreqCohorts];
                  } else {
                    // If lenreqCohorts is a single value
                    filterDatacohorts.push(lenreqCohorts);
                  }
    
                  // Remove duplicates if necessary (optional)
                  filterDatacohorts = [...new Set(filterDatacohorts)];
    
                  const Updatedata = await LmsLearner.update(
                    { lenCohorts: filterDatacohorts },
                    { where: { lenId: value.lenId } }
                  );
                }
    
                console.log("valueschorts", filterDatacohorts);
              }
            })
          );
    
          res
            .status(200)
            .send({
              status: "success",
              message: "Update successful",
              data: FindLearnerData,
            });
        } else {
          res.status(404).send({ message: "No learners found" });
        }
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: error.message});
      }
    };

    // const gameCompleteList = async (req, res) => {
    //   const gameId = req.params.id;
    
    //   try {
    //     // Find completed games based on gameId
    //     const completedGames = await lmsGameActivityLog.findAll({
    //       where: {
    //         galGameId: gameId,
    //         galQuestionState: 'complete'
    //       },
    //       attributes: ['galLearnerId'] // Select only the learner ids
    //     });
    
    //     // Extract learner IDs from completed games
    //     const learnerIds = completedGames.map(game => game.galLearnerId);
    
    //     // Find learner details based on learner IDs
    //     const learnerDetails = await LmsLearner.findAll({
    //       where: {
    //         lenId: {
    //           [Op.in]: learnerIds // Filter by learner IDs from completed games
    //         }
    //       },
    //       include: [{
    //         model: Company, // Include the Company model for learner's company details
    //         attributes: ['cpCompanyName'], // Select only the company name
    //         as: 'company' // Alias for the included Company model
    //       }],
    //       attributes: ['lenId', 'lenUserName', 'lenCompanyId'], // Select only the learner username and company ID
    //     });
    
    //     // Fetch game details
    //     const game = await LmsGame.findOne({
    //       where: { gameId },
    //       attributes: ['gameTitle', 'gameStoryLine']
    //     });
    
    //     // If game not found, return error
    //     if (!game) {
    //       return res.status(404).json({ error: 'Game not found' });
    //     }
    
    //     // Fetch feedback data related to the gameId
    //     const feedbackData = await lmsCollectFeedback.findAll({
    //       where: {
    //         feedGameId: gameId
    //       },
    //       attributes: ['feedLearnerId', 'feedContent', 'feedRecommendation', 'feedRelevance', 'feedGamification', 'feedBehaviour', 'feedOthers'] // Select feedback columns
    //     });
    
    //     // Filter out columns without values
    //     const filteredFeedbackData = feedbackData.map(feedback => {
    //       const feedbackValues = {};
    
    //       Object.keys(feedback.dataValues).forEach(key => {
    //         if (feedback[key] !== null && feedback[key] !== undefined && feedback[key] !== '') {
    //           feedbackValues[key] = feedback[key];
    //         }
    //       });
    //       return feedbackValues;
    //     });
    
    //     // Create the combined object structure
    //     const combinedData = learnerDetails.map(learner => {
    //       const learnerFeedback = filteredFeedbackData.filter(feedback => feedback.feedLearnerId === learner.lenId);
    //       return {
    //         username: learner.lenUserName,
    //         companyName: learner.Company.cpCompanyName,
    //         feedback: learnerFeedback
    //       };
    //     });
    
    //     // Return the formatted data along with game details
    //     return res.status(200).json({
    //       gameTitle: game.gameTitle,
    //       gameStoryLine: game.gameStoryLine,
    //       learnerFeedback: combinedData
    //     });
    //   } catch (error) {
    //     console.error('Error fetching game data:', error);
    //     return res.status(500).json({ error:error.message });
    //   }
    // };
    
const gameCompleteList = async (req, res) => {
  const gameId = req.params.id;

  try {
    // Fetch completed game activity logs
    const completedGames = await lmsGameActivityLog.findAll({
      where: {
        galGameId: gameId,
        galQuestionState: 'complete'
      },
      attributes: ['galLearnerId'],
      group: ['galLearnerId'],
      raw: true
    });

    console.log('Completed Games:', completedGames);

    const learnerIds = completedGames.map(game => game.galLearnerId);

    // Fetch learner details
    const learners = await LmsLearner.findAll({
      where: {
        lenId: {
          [Op.in]: learnerIds
        }
      },
      attributes: ['lenId', 'lenUserName', 'lenCompanyId'],
      group: ['lenId'],
      raw: true
    });

    console.log('Learners:', learners);

    const companyIds = learners.map(learner => learner.lenCompanyId);

    // Fetch company details
    const companies = await Company.findAll({
      where: {
        cpId: {
          [Op.in]: companyIds
        }
      },
      attributes: ['cpId', 'cpCompanyName'],
      group: ['cpId'],
      raw: true
    });

    console.log('Companies:', companies);

    // Fetch feedback data
    const feedbacks = await lmsCollectFeedback.findAll({
      where: {
        feedGameId: gameId,
        feedLearnerId: {
          [Op.in]: learnerIds
        }
      },
      attributes: ['feedLearnerId', 'feedContent', 'feedRecommendation', 'feedRelevance', 'feedGamification', 'feedBehaviour', 'feedOthers'],
      group: ['feedLearnerId', 'feedContent', 'feedRecommendation', 'feedRelevance', 'feedGamification', 'feedBehaviour', 'feedOthers'],
      raw: true
    });

    console.log('Feedbacks:', feedbacks);

    // Filter out feedback with empty or null values
    const filteredFeedbackData = feedbacks.filter(feedback => {
      return ['feedContent', 'feedRecommendation', 'feedRelevance', 'feedGamification', 'feedBehaviour', 'feedOthers'].some(key => {
        return feedback[key] !== null && feedback[key] !== '';
      });
    });

    console.log('Filtered Feedbacks:', filteredFeedbackData);

    // Fetch game details
    const game = await LmsGame.findOne({
      where: { gameId },
      attributes: ['gameTitle', 'gameStoryLine'],
      raw: true
    });

    console.log('Game:', game);

    // If game not found, return error
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Combine learner details with company names
    const learnerDetails = learners.map(learner => {
      const company = companies.find(comp => comp.cpId === learner.lenCompanyId);
      return {
        lenId: learner.lenId,
        lenUserName: learner.lenUserName,
        cpCompanyName: company ? company.cpCompanyName : null
      };
    });

    console.log('Learner Details:', learnerDetails);

    // Create the combined object structure
    const combinedData = learnerDetails.map(learner => {
      const learnerFeedback = filteredFeedbackData.filter(feedback => feedback.feedLearnerId === learner.lenId);
      return {
        username: learner.lenUserName,
        companyName: learner.cpCompanyName,
        feedback: learnerFeedback
      };
    });

    console.log('Combined Data:', combinedData);

    // Return the formatted data along with game details
    return res.status(200).json({
      gameTitle: game.gameTitle,
      gameStoryLine: game.gameStoryLine,
      learnerFeedback: combinedData
    });
  } catch (error) {
    console.error('Error fetching game data:', error);
    return res.status(500).json({ error: error.message });
  }
};


    const getAssignedGames = async (req, res) => {
      try {
        const id = req.params.id;
        const GetAllData = [];
    
        const learners = await LmsLearner.findOne({
          attributes: ['lenUserName', 'lenCompanyId'],
          where: { lenId: id }
        });
        const lenUserName = learners.lenUserName;
        const cpID = learners.lenCompanyId;
    
        const gamesAssignCount = await gameassinged.findAll({
          attributes: ['gaGameState', 'gaGameId', 'gaId'],
          where: { gaLearnerId: id ,gaDeleteStatus:'No'},
        });
    
        const companiesName = await Company.findOne({
          attributes: ['cpCompanyName'],
          where: { cpId: cpID }
        });
        const companyName = companiesName.cpCompanyName;
    
        for (const gamesAssign of gamesAssignCount) {
          const gaGameId = gamesAssign.gaGameId;
    
          const gamenames = await LmsGame.findAll({
            attributes: ['gameTitle'],
            where: { gameId: gaGameId },
          });
          const gameName = gamenames.length > 0 ? gamenames[0].gameTitle : '';
    
          const progressData = await lmsGameActivityLog.findAll({
            attributes: [
              'galQuestionState'
            ],
            where: { galLearnerId: id, galGameId: gaGameId },
            group: ['galGameId'],
          });
    
          const progress = progressData.length > 0 ? progressData[0].dataValues.galQuestionState : 'Not Yet Started';
    
          GetAllData.push({
            gameName: gameName,
            progress: progress,
          });
        }
    
        GetAllData.push({
          companyName: companyName,
          lenUserName: lenUserName,
        });
    
        return res.status(200).send({ status: 'success', message: 'Get Success', data: GetAllData });
    
      } catch (error) {
        res.status(500).json({ status: 'Failure', message: 'Internal Server Error', error: error.message });
      }
    };


    // const getAllLearners = async (req, res) => {
    //   try {
    //     const data = req.body;
    //     console.log('LOkieDatasLeaners', data);
    //     const LoginUserId = req.user.user.id;
    //     console.log("LoginUserId",LoginUserId);
    //     // Constructing the condition based on provided data
    //     let conditions = [];

    //     if (data.companyId) {
    //       conditions.push({ lenCompanyId: data.companyId });
    //     }
    //     if (data.creatorId) {
    //       conditions.push({ lenCreatorId: data.creatorId });
    //     }
    //     if (data.lenUserName) {
    //       conditions.push({ lenId: data.lenUserName });
    //     }
        
    //     conditions.push({
    //       where: {
    //         [Op.and]: [
    //           {
    //             lenDeleteStatus: {
    //               [Op.or]: {
    //                 [Op.not]: "Yes",
    //                 [Op.is]: null,
    //               },
    //             },
    //           },
    //           // Uncomment the following lines if necessary
    //           // type !== "All" ? { gameGameStage: type } : {},
    //           // data.gameCategoryId ? { gameCategoryId: { [Op.like]: `%${data.gameCategoryId}%` } } : {},
    //         ],
    //         [Op.or]: [
    //           {
    //             lenCreatorId: LoginUserId,
    //           },
             
    //           // { gameAnotherCreatorId: LoginUserId },
    //         ],
    //       },
       
    //       // group: ["gameExtensionId"],
    //       // order: [["updatedAt", "DESC"]],
    //     });
        
       
    //     // Creating the condition object
    //     let condition = conditions.length > 0 ? { where: { [Sequelize.Op.or]: conditions } } : {};
    
    //     const learners = await LmsLearner.findAll(condition);
    
    //     const learnerData_1 = [];
    
    //     for (const learner of learners) {
    //       try {
    //         const lenMail = learner.lenMail;
    //         const lenUserName = learner.lenUserName;
    //         const lenCompanyId = learner.lenCompanyId;
    //         const lenId = learner.lenId;
    
    //         const gamesAssignCount = await gameassinged.count({
    //           where: { gaLearnerId: lenId, gaDeleteStatus: 'No' },
    //         });
    
    //         const gamePlayedCountData = await lmsGameActivityLog.findAll({
    //           attributes: [
    //             [Sequelize.col('galGameId'), 'galGameId'],
    //             [Sequelize.fn('COUNT', Sequelize.col('galGameId')), 'count']
    //           ],
    //           where: { galLearnerId: lenId, galQuestionState: 'complete' },
    //           group: ['galGameId', 'galLearnerId']
    //         });
    
    //         const progressCountData = await lmsGameActivityLog.findAll({
    //           attributes: [
    //             [Sequelize.col('galGameId'), 'galGameId'],
    //             [Sequelize.fn('COUNT', Sequelize.col('galGameId')), 'count']
    //           ],
    //           where: { galLearnerId: lenId, galQuestionState: 'start' },
    //           group: ['galGameId', 'galLearnerId']
    //         });
    
    //         const countMap = {};
    
    //         gamePlayedCountData.forEach(entry => {
    //           const gameId = entry.dataValues.galGameId;
    //           const count = parseInt(entry.dataValues.count, 10);
    //           countMap[gameId] = count;
    //         });
    
    //         progressCountData.forEach(entry => {
    //           const gameId = entry.dataValues.galGameId;
    //           const count = parseInt(entry.dataValues.count, 10);
    //           if (countMap[gameId]) {
    //             countMap[gameId] += count;  // Add progress count to gamePlayed count if exists
    //           } else {
    //             countMap[gameId] = count;  // Otherwise, set the progress count
    //           }
    //         });
    
    //         const totalGamePlayedCount = Object.values(countMap).reduce((sum, count) => sum + count, 0);
    
    //         const score = await lmsGameActivityLog.findOne({
    //           attributes: [[Sequelize.fn('AVG', Sequelize.col('galAverageScore')), 'avgScore']],
    //           where: { galLearnerId: lenId },
    //         });
    
    //         const originalScore = await LmsGame.findAll({
    //           attributes: ['gameTotalScore'],
    //           where: {
    //             gameId: Sequelize.col('lmsGameActivityLogs.galGameId'),
    //           },
    //           include: [{
    //             model: lmsGameActivityLog,
    //             required: true,
    //           }],
    //           group: Sequelize.col('lmsGameActivityLogs.galLearnerId')
    //         });
    
    //         const [originalScores] = originalScore;
    //         const originalScoretosend = originalScores ? originalScores.gameTotalScore : null;
    
    //         const timeSpentData = await LoginHistory.findOne({
    //           attributes: ['lgTotalTime', 'lgId'],
    //           where: {
    //             lgUserId: lenId,
    //             lgUserRole: 'Learner'
    //           },
    //         });
    
    //         const timeSpent = timeSpentData ? timeSpentData.lgTotalTime : null;
    
    //         const FindLastActiveDate = await LoginHistory.findOne({
    //           attributes: [
    //             [Sequelize.fn('DATE', Sequelize.fn('MAX', Sequelize.col('createdAt'))), 'lastDate'],
    //           ],
    //           where: {
    //             lgUserId: lenId,
    //             lgUserRole: 'Learner',
    //           }
    //         });
    
    //         const lastActive = FindLastActiveDate ? FindLastActiveDate.dataValues.lastDate : null;
    
    //         learnerData_1.push({
    //           leanerId: lenId,
    //           lenMail: lenMail,
    //           lenUserName: lenUserName,
    //           lenCompanyId: lenCompanyId,
    //           gamesAssignedCount: gamesAssignCount,
    //           gamePlayed: totalGamePlayedCount,
    //           score: score ? score.dataValues.avgScore : 0,
    //           progress: totalGamePlayedCount, // since we aggregated the counts
    //           finalScore: originalScoretosend,
    //           originalScore: originalScoretosend,
    //           timeSpent: timeSpent,
    //           lastActive: lastActive
    //         });
    //       } catch (error) {
    //         console.error('Error processing learner data:', error);
    //       }
    //     }
    
    //     console.log('Learner Data:', learnerData_1);
    
    //     return res.status(200).json({ status: "Success", message: "Data Retrieved Successfully", data: learnerData_1 });
    
    //   } catch (error) {
    //     console.error('Error fetching data:', error);
    //     return res.status(500).json({ status: 'Failure', message: "Internal Server Error", err: error.message });
    //   }
    // }



    const getAllLearners = async (req, res) => {
      try {
        const data = req.body;
        const LoginUserId = req.user.user.id;
    
        // Constructing the condition based on provided data
        let conditions = {};
    
        if (data.companyId) {
          conditions.lenCompanyId = data.companyId;
        }
        if (data.creatorId) {
          conditions.lenCreatorId = data.creatorId;
        }
        if (data.lenUserName) {
          conditions.lenId = data.lenUserName;
        }
    
        // Additional conditions
        let additionalConditions = {
          [Op.and]: [
            {
              lenDeleteStatus: {
                [Op.or]: [
                  { [Op.not]: "Yes" },
                  { [Op.is]: null },
                ],
              },
            },
            // Uncomment the following lines if necessary
            // type !== "All" ? { gameGameStage: type } : {},
            // data.gameCategoryId ? { gameCategoryId: { [Op.like]: `%${data.gameCategoryId}%` } } : {},
          ],
          [Op.or]: [
            { lenCreatorId: LoginUserId },
            // Uncomment the following lines if necessary
            // { gameAnotherCreatorId: LoginUserId },
          ],
        };
    
        // Combine main conditions with additional conditions
        if (Object.keys(conditions).length > 0) {
          additionalConditions[Op.and].push(conditions);
        }
    
        // Query with the combined conditions
        const learners = await LmsLearner.findAll({
          where: additionalConditions,
          // Uncomment the following lines if necessary
          // group: ["gameExtensionId"],
          // order: [["updatedAt", "DESC"]],
        });
    
        const learnerData_1 = [];
    
        for (const learner of learners) {
          try {
            const lenMail = learner.lenMail;
            const lenUserName = learner.lenUserName;
            const lenCompanyId = learner.lenCompanyId;
            const lenId = learner.lenId;
    
            const gamesAssignCount = await gameassinged.count({
              where: { gaLearnerId: lenId, gaDeleteStatus: 'No' },
            });
    
            const gamePlayedCountData = await lmsGameActivityLog.findAll({
              attributes: [
                [Sequelize.col('galGameId'), 'galGameId'],
                [Sequelize.fn('COUNT', Sequelize.col('galGameId')), 'count'],
              ],
              where: { galLearnerId: lenId, galQuestionState: 'complete' },
              group: ['galGameId', 'galLearnerId'],
            });
    
            const progressCountData = await lmsGameActivityLog.findAll({
              attributes: [
                [Sequelize.col('galGameId'), 'galGameId'],
                [Sequelize.fn('COUNT', Sequelize.col('galGameId')), 'count'],
              ],
              where: { galLearnerId: lenId, galQuestionState: 'start' },
              group: ['galGameId', 'galLearnerId'],
            });
    
            const countMap = {};
    
            gamePlayedCountData.forEach(entry => {
              const gameId = entry.dataValues.galGameId;
              const count = parseInt(entry.dataValues.count, 10);
              countMap[gameId] = count;
            });
    
            progressCountData.forEach(entry => {
              const gameId = entry.dataValues.galGameId;
              const count = parseInt(entry.dataValues.count, 10);
              if (countMap[gameId]) {
                countMap[gameId] += count;  // Add progress count to gamePlayed count if exists
              } else {
                countMap[gameId] = count;  // Otherwise, set the progress count
              }
            });
    
            const totalGamePlayedCount = Object.values(countMap).reduce((sum, count) => sum + count, 0);
    
            const score = await lmsGameActivityLog.findOne({
              attributes: [[Sequelize.fn('AVG', Sequelize.col('galAverageScore')), 'avgScore']],
              where: { galLearnerId: lenId },
            });
    
            const originalScore = await LmsGame.findAll({
              attributes: ['gameTotalScore'],
              where: {
                gameId: Sequelize.col('lmsGameActivityLogs.galGameId'),
              },
              include: [{
                model: lmsGameActivityLog,
                required: true,
              }],
              group: Sequelize.col('lmsGameActivityLogs.galLearnerId'),
            });
    
            const [originalScores] = originalScore;
            const originalScoretosend = originalScores ? originalScores.gameTotalScore : null;
    
            const timeSpentData = await LoginHistory.findOne({
              attributes: ['lgTotalTime', 'lgId'],
              where: {
                lgUserId: lenId,
                lgUserRole: 'Learner',
              },
            });
    
            const timeSpent = timeSpentData ? timeSpentData.lgTotalTime : null;
    
            const FindLastActiveDate = await LoginHistory.findOne({
              attributes: [
                [Sequelize.fn('DATE', Sequelize.fn('MAX', Sequelize.col('createdAt'))), 'lastDate'],
              ],
              where: {
                lgUserId: lenId,
                lgUserRole: 'Learner',
              },
            });
    
            const lastActive = FindLastActiveDate ? FindLastActiveDate.dataValues.lastDate : null;
    
            learnerData_1.push({
              leanerId: lenId,
              lenMail: lenMail,
              lenUserName: lenUserName,
              lenCompanyId: lenCompanyId,
              gamesAssignedCount: gamesAssignCount,
              gamePlayed: totalGamePlayedCount,
              score: score ? score.dataValues.avgScore : 0,
              progress: totalGamePlayedCount, // since we aggregated the counts
              finalScore: originalScoretosend,
              originalScore: originalScoretosend,
              timeSpent: timeSpent,
              lastActive: lastActive,
            });
          } catch (error) {
            console.error('Error processing learner data:', error);
          }
        }
    
        return res.status(200).json({ status: "Success", message: "Data Retrieved Successfully", data: learnerData_1 });
    
      } catch (error) {
        console.error('Error fetching data:', error);
        return res.status(500).json({ status: 'Failure', message: "Internal Server Error", err: error.message });
      }
    };


    // const getAllLearners = async (req, res) => {
    //   try {
    //     const data = req.body;
    //     console.log('LOkieDatasLeaners', data);
    //     const LoginUserId = req.user.user.id;
    //     console.log("LoginUserId", LoginUserId);
    
    //     // Constructing the condition based on provided data
    //     let conditions = {
    //       where: {
    //         [Op.and]: [
    //           {
    //             lenDeleteStatus: {
    //               [Op.or]: {
    //                 [Op.not]: "Yes",
    //                 [Op.is]: null,
    //               },
    //             },
    //           },
    //         ],
    //         [Op.or]: [
    //           {
    //             lenCreatorId: LoginUserId,
    //           },
    //         ],
    //       },
    //       order: [["updatedAt", "DESC"]],
    //     };
    
    //     // Adding more conditions based on input data
    //     if (data.companyId) {
    //       conditions.where[Op.and].push({ lenCompanyId: data.companyId });
    //     }
    //     if (data.creatorId) {
    //       conditions.where[Op.and].push({ lenCreatorId: data.creatorId });
    //     }
    //     if (data.lenUserName) {
    //       conditions.where[Op.and].push({ lenId: data.lenUserName });
    //     }
    
    //     const learners = await LmsLearner.findAll(conditions);
    
    //     const learnerData_1 = [];
    
    //     for (const learner of learners) {
    //       try {
    //         const lenMail = learner.lenMail;
    //         const lenUserName = learner.lenUserName;
    //         const lenCompanyId = learner.lenCompanyId;
    //         const lenId = learner.lenId;
    
    //         const gamesAssignCount = await gameassinged.count({
    //           where: { gaLearnerId: lenId, gaDeleteStatus: 'No' },
    //         });
    
    //         const gamePlayedCountData = await lmsGameActivityLog.findAll({
    //           attributes: [
    //             [Sequelize.col('galGameId'), 'galGameId'],
    //             [Sequelize.fn('COUNT', Sequelize.col('galGameId')), 'count'],
    //           ],
    //           where: { galLearnerId: lenId, galQuestionState: 'complete' },
    //           group: ['galGameId', 'galLearnerId'],
    //         });
    
    //         const progressCountData = await lmsGameActivityLog.findAll({
    //           attributes: [
    //             [Sequelize.col('galGameId'), 'galGameId'],
    //             [Sequelize.fn('COUNT', Sequelize.col('galGameId')), 'count'],
    //           ],
    //           where: { galLearnerId: lenId, galQuestionState: 'start' },
    //           group: ['galGameId', 'galLearnerId'],
    //         });
    
    //         const countMap = {};
    
    //         gamePlayedCountData.forEach(entry => {
    //           const gameId = entry.dataValues.galGameId;
    //           const count = parseInt(entry.dataValues.count, 10);
    //           countMap[gameId] = count;
    //         });
    
    //         progressCountData.forEach(entry => {
    //           const gameId = entry.dataValues.galGameId;
    //           const count = parseInt(entry.dataValues.count, 10);
    //           if (countMap[gameId]) {
    //             countMap[gameId] += count;  // Add progress count to gamePlayed count if exists
    //           } else {
    //             countMap[gameId] = count;  // Otherwise, set the progress count
    //           }
    //         });
    
    //         const totalGamePlayedCount = Object.values(countMap).reduce((sum, count) => sum + count, 0);
    
    //         const score = await lmsGameActivityLog.findOne({
    //           attributes: [[Sequelize.fn('AVG', Sequelize.col('galAverageScore')), 'avgScore']],
    //           where: { galLearnerId: lenId },
    //         });
    
    //         const originalScore = await LmsGame.findAll({
    //           attributes: ['gameTotalScore'],
    //           where: {
    //             gameId: Sequelize.col('lmsGameActivityLogs.galGameId'),
    //           },
    //           include: [{
    //             model: lmsGameActivityLog,
    //             required: true,
    //           }],
    //           group: Sequelize.col('lmsGameActivityLogs.galLearnerId'),
    //         });
    
    //         const [originalScores] = originalScore;
    //         const originalScoretosend = originalScores ? originalScores.gameTotalScore : null;
    
    //         const timeSpentData = await LoginHistory.findOne({
    //           attributes: ['lgTotalTime', 'lgId'],
    //           where: {
    //             lgUserId: lenId,
    //             lgUserRole: 'Learner',
    //           },
    //         });
    
    //         const timeSpent = timeSpentData ? timeSpentData.lgTotalTime : null;
    
    //         const FindLastActiveDate = await LoginHistory.findOne({
    //           attributes: [
    //             [Sequelize.fn('DATE', Sequelize.fn('MAX', Sequelize.col('createdAt'))), 'lastDate'],
    //           ],
    //           where: {
    //             lgUserId: lenId,
    //             lgUserRole: 'Learner',
    //           },
    //         });
    
    //         const lastActive = FindLastActiveDate ? FindLastActiveDate.dataValues.lastDate : null;
    
    //         learnerData_1.push({
    //           leanerId: lenId,
    //           lenMail: lenMail,
    //           lenUserName: lenUserName,
    //           lenCompanyId: lenCompanyId,
    //           gamesAssignedCount: gamesAssignCount,
    //           gamePlayed: totalGamePlayedCount,
    //           score: score ? score.dataValues.avgScore : 0,
    //           progress: totalGamePlayedCount, // since we aggregated the counts
    //           finalScore: originalScoretosend,
    //           originalScore: originalScoretosend,
    //           timeSpent: timeSpent,
    //           lastActive: lastActive,
    //         });
    //       } catch (error) {
    //         console.error('Error processing learner data:', error);
    //       }
    //     }
    
    //     console.log('Learner Data:', learnerData_1);
    
    //     return res.status(200).json({ status: "Success", message: "Data Retrieved Successfully", data: learnerData_1 });
    
    //   } catch (error) {
    //     console.error('Error fetching data:', error);
    //     return res.status(500).json({ status: 'Failure', message: "Internal Server Error", err: error.message });
    //   }
    // }
    
    

    const getLearnerFilter = async (req, res) => {
      console.log('CheeckFilter');
      try {
    
        const learners = await LmsLearner.findAll(
          {
            attributes: [['lenId', 'value'], ['lenUserName', 'label']],
            where: {
              lenDeleteStatus: 'NO', lenStatus: 'Active'
    
            }
          });
        return res
          .status(200)
          .json({ status: "Success", message: "Data Get Successfully", data: learners });
      } catch (error) {
        return res.status(500).json({ status: 'Failure', message: "Internal Server Error", err: error });
      }
    }
    

    const cohortsLearnerDatas = async (req, res) => {
      const CohortsId = req.params.id;
      console.log('id', CohortsId);
    
      try {
        // Find learner details based on cohort ID
        const learnerCohortsDetails = await LmsLearner.findAll({
          where: Sequelize.literal(`JSON_CONTAINS(lenCohorts, '[${CohortsId}]', '$')`),
          include: [
            {
              model: Company, // Include the Company model for learner's company details
              attributes: ['cpCompanyName'], // Select only the company name
              as: 'company' // Alias for the included Company model
            }
          ],
          attributes: ['lenMail', 'lenUserName', 'lenCompanyId'], // Select only the learner email, username, and company ID
        });
    
        // Log learner details
        learnerCohortsDetails.forEach(learner => {
          const companyName = learner.company ? learner.company.cpCompanyName : 'N/A';
          console.log(`Username: ${learner.lenUserName}, Email: ${learner.lenMail}, Company Name: ${companyName}`);
        });
    
        const cohorts = await LmsCohorts.findOne({
          where: { chId: CohortsId },
          attributes: ['chCohortsName']
        });
    
        // If cohort not found, return error
        if (!cohorts) {
          return res.status(404).json({ error: 'Cohorts not found' });
        }
        console.log('Cohorts Name:', cohorts.chCohortsName);
    
        // Extract relevant data from learner details
        const formattedData = learnerCohortsDetails.map(learner => ({
          username: learner.lenUserName,
          email: learner.lenMail,
          companyName: learner.company ? learner.company.cpCompanyName : 'N/A',
        }));
    
        // Return the formatted data
        return res.status(200).json({
          cohortsName: cohorts.chCohortsName,
          learners: formattedData
        });
      } catch (error) {
        console.error('Error fetching learner data:', error);
        return res.status(500).json({ error: error.message });
      }
    };
    
   
    const cohortsGamesData = async (req, res) => {
        try {
          // const cohortsId = 88; // Replace with req.params.id if dynamic input is needed
          const cohortsId = req.params.id;
          console.log('Received id:', cohortsId);
      
          // Fetch game titles and gameCreatorUserId where gameCohorts array contains the given cohortsId
          const games = await LmsGame.findAll({
            attributes: ['gameTitle', 'gameCreatorUserId'],
            where: Sequelize.literal(`JSON_CONTAINS(gameCohorts, '[${cohortsId}]', '$')`)
          });
      
          const gameDetailsPromises = games.map(async (game) => {
            try {
              // Get creator details from LmsCreator table
              const creator = await LmsCreator.findOne({
                where: { ctId: game.gameCreatorUserId },
                attributes: ['ctId', 'ctCompanyId', 'ctName']
              });
      
              if (!creator) {
                return null;
              }
      
              // Get company details from Company table
              const company = await Company.findOne({
                where: { cpId: creator.ctCompanyId },
                attributes: ['cpCompanyName']
              });
      
              if (!company) {
                return null;
              }
      
              // Construct the desired object
              return {
                gameTitle: game.gameTitle,
                creatorName: creator.ctName,
                companyName: company.cpCompanyName
              };
            } catch (error) {
              console.error(`Error fetching details for game: ${game.gameTitle}`, error);
              return null;
            }
          });
          const cohorts = await LmsCohorts.findOne({
            where: { chId: cohortsId },
            attributes: ['chCohortsName']
          });
          // Wait for all promises to resolve
          const cohortsDetails = await Promise.all(gameDetailsPromises);
          console.log("cohortsDetails",cohortsDetails);
          // Filter out any null results
          const filteredCohortsDetails = cohortsDetails.filter(detail => detail !== null);
          console.log("filteredCohortsDetails",filteredCohortsDetails);
          res.status(200).json({
            message: 'success',
            cohortsDetails: filteredCohortsDetails,
            cohortsName: cohorts.chCohortsName,
            leo:cohortsDetails
          });
        } catch (error) {
          console.error('Error:', error);
          res.status(500).json({ message: 'An error occurred', error:error.message });
        }
      };
      const getBlocklWiseScore = async (req, res) => {
        try {
          const id = req.params.id;
          const getGameId = [];
      
          // Fetch assigned games for the learner
          const gamesAssign = await gameassinged.findAll({
            attributes: ['gaGameId'],
            where: { gaLearnerId: id, gaDeleteStatus: 'No' },
          });
      
          const learners = await LmsLearner.findOne({
            attributes: ['lenUserName', 'lenCompanyId'],
            where: { lenId: id }
          });
          const lenUserName = learners.lenUserName;
          const cpID = learners.lenCompanyId;
      
          const companiesName = await Company.findOne({
            attributes: ['cpCompanyName'],
            where: { cpId: cpID }
          });
          const companyName = companiesName.cpCompanyName;
      
          // Prepare an array of promises for fetching blocks
          const blockPromises = gamesAssign.map(async (gameAssign) => {
            const gameAssignId = gameAssign.gaGameId;
            console.log('gameAssignId', gameAssignId);
      
            const getQuest = await lmsgameplayhistory.findOne({
              attributes: ['histBlockId', 'histOption', 'histScore', 'histQuestNo'],
              where: {
                histLearnerId: id,
                histGameId: gameAssignId,
                histType: 'Interaction'
              }
            });
      
            if (!getQuest) {
              console.error(`No gameplay history found for learner ${id} and game ${gameAssignId}`);
              return null;
            }
      
            const blockId = getQuest.histBlockId;
            const questNum = getQuest.histQuestNo;
      
            if (blockId === undefined || questNum === undefined) {
              console.error(`Invalid blockId or questNum for learner ${id} and game ${gameAssignId}`);
              return null;
            }
      
            const blocks = await LmsBlocks.findOne({
              attributes: ['blockId'],
              where: {
                blockGameId: gameAssignId,
                blockQuestNo: questNum,
                blockSecondaryId: blockId,
              }
            });
      
            if (!blocks) {
              console.error(`No blocks found for game ${gameAssignId}, quest ${questNum}, and block ${blockId}`);
              return null;
            }
      
            const quesId = blocks.blockId;
      
            const questions = await lmsQuestionOptions.findAll({
              attributes: ['qpQuestNo', 'qpOptionText', 'qpSkillTag', 'qpScore'],
              where: {
                qpQuestionId: quesId,
              },
              include: [
                {
                  model: LmsGame,
                  attributes: ['gameTitle'],
                  required: true,
                  where: {
                    gameId: gameAssignId
                  }
                }
              ],
            });
      
            return {
              lenUserName: lenUserName,
              companyName: companyName,
              getQuest: questions
            };
          });
      
          const results = await Promise.all(blockPromises);
      
          // Filter out null results
          const filteredResults = results.filter(result => result !== null);
      
          console.log('getGameId', filteredResults);
          return res.status(200).json({
            getGameId: filteredResults
          });
      
        } catch (error) {
          res.status(500).json({ status: 'Failure', message: 'Internal Server Error', error: error.message });
        }
      };
      const getGameAssignData = async (req, res) => {
        const GameAssignId = req.params.id;
        console.log("GameAssignId", GameAssignId);
      
        try {
          // Fetch game data
          const game = await LmsGame.findAll({
            where: { gameId: GameAssignId },
            attributes: ['gameTitle', 'gameStoryLine', 'gameCreatorUserId'],
            group: ['gameTitle', 'gameStoryLine', 'gameCreatorUserId']
          });
      
          // Extract the gameCreatorUserId values
          const gameCreatorUserIds = game.map(g => g.gameCreatorUserId);
          console.log("gameCreatorUserIds", gameCreatorUserIds);
          console.log("game", game);
      
          // Fetch creator data
          const creatordata = await LmsCreator.findAll({
            where: { ctId: gameCreatorUserIds },
            attributes: ['ctName', 'ctCompanyId', 'ctId'],
            group: ['ctName', 'ctCompanyId', 'ctId']
          });
      
          // Fetch game assignment data
          const gameAssign = await gameassinged.findAll({
            where: { gaGameId: GameAssignId },
            attributes: ['gaLearnerId'],
            group: ['gaLearnerId']
          });
          console.log("gameAssign", gameAssign);
      
          // Extract learner IDs
          const LeanerIds = gameAssign.map(g => g.gaLearnerId);
      console.log("LeanerIds",LeanerIds);
          // Extract company IDs from creator data
          const gameCreator = creatordata.map(g => g.ctCompanyId);
      
          // Fetch company data
          const companyData = await Company.findAll({
            where: { cpId: gameCreator },
            attributes: ['cpCompanyName'],
            group: ['cpCompanyName']
          });
      
          // Fetch learner data
          const LeanerData = await LmsLearner.findAll({
            where: { lenId: LeanerIds },
            attributes: ['lenUserName', 'lenMail'],
            group: ['lenUserName', 'lenMail']
          });
      
          // Construct response object
          const response = {
            gameTitle: game[0]?.gameTitle, // Assuming there's at least one game
            gameStoryLine: game[0]?.gameStoryLine, // Assuming there's at least one game
            ctName: creatordata.map(c => c.ctName),
            cpCompanyName: companyData.map(c => c.cpCompanyName),
             LeanerData,
            gameAssign
          };
      
          // Send response
          res.status(200).json(response);
        } catch (error) {
          console.error('Error fetching data:', error);
          return res.status(500).json({ status: 'Failure', message: "Internal Server Error", err: error.message });
        }
      }
      
      const GameWiseCompletePrint = async (req, res) => {
        try {
          const gameId = req.params.id;
          // console.log(Received request for gameId: ${gameId});  
      
          // Step 1: Fetch activity logs
          const activityLogs = await lmsGameActivityLog.findAll({
            where: {
              galGameId: gameId,
              galGameState: 'Completed'
            },
            attributes: ['galGameId', 'galGameState', 'galLearnerId'],
            group: ['galGameId'],
          });
      
          const learnerIds = activityLogs.map(log => log.galLearnerId);
          // console.log(Learner IDs: ${learnerIds});
      
          // Step 2: Fetch learners
          const learners = await LmsLearner.findAll({
            where: {
              lenId: { [Op.in]: learnerIds }
            },
            attributes: ['lenId', 'lenUserName', 'lenMail', 'lenCompanyId'],
            group: ['lenId'],
          });
      
          const companyIds = learners.map(learner => learner.lenCompanyId);
          // console.log(Company IDs: ${companyIds});
      
          // Step 3: Fetch companies
          const companies = await Company.findAll({
            where: {
              cpId: { [Op.in]: companyIds }
            },
            attributes: ['cpId', 'cpCompanyName'],
            group: ['cpId'],
          });
      
          const creatorIds = companies.map(company => company.cpId);
          // console.log(Creator IDs: ${creatorIds});
      
          // Step 4: Fetch creators
          const creators = await LmsCreator.findAll({
            where: {
              ctCompanyId: { [Op.in]: creatorIds }
            },
            attributes: ['ctCompanyId', 'ctName'],
            group: ['ctCompanyId'],
          });
      
          // Step 5: Fetch game details
          const game = await LmsGame.findAll({
            where: {
              gameId: gameId
            },
            attributes: ['gameId', 'gameTitle'],
            group: ['gameId'],
          });
      
          // Combine data
          const data = activityLogs.map(log => {
            const learner = learners.find(l => l.lenId === log.galLearnerId);
            const company = companies.find(c => c.cpId === learner.lenCompanyId);
            const creator = creators.find(cr => cr.ctCompanyId === company.cpId);
            
            return {
              ...log.toJSON(),
              gameTitle: game.length > 0 ? game[0].gameTitle : null,
              learner: learner ? learner.toJSON() : null,
              company: company ? company.toJSON() : null,
              creator: creator ? creator.toJSON() : null
            };
          });
          console.log('Combined Data:', JSON.stringify(data, null, 2));
      
          return res.status(200).json({ status: "Success", message: "Data Retrieved Successfully", data :data});
        } catch (error) {
          console.error('Error fetching data:', error);
          return res.status(500).json({ status: 'Failure', message: "Internal Server Error", error: error.message });
        }
      };



      const GameWiseStartedPrint = async (req, res) => {
        try {
          const gameId = req.params.id;
          console.log(`Received request for gameId: ${gameId}`);  
      
          // Step 1: Fetch activity logs
          const activityLogs = await lmsGameActivityLog.findAll({
            where: {
              galGameId: gameId,
              galGameState: 'started'
            },
            attributes: ['galGameId', 'galGameState', 'galLearnerId'],
            group: ['galGameId'],
          });
      
          const learnerIds = activityLogs.map(log => log.galLearnerId);
          console.log(`Learner IDs: ${learnerIds}`);
      
          // Step 2: Fetch learners
          const learners = await LmsLearner.findAll({
            where: {
              lenId: { [Op.in]: learnerIds }
            },
            attributes: ['lenId', 'lenUserName', 'lenMail', 'lenCompanyId'],
            group: ['lenId'],
          });
      
          const companyIds = learners.map(learner => learner.lenCompanyId);
          console.log(`Company IDs: ${companyIds}`);
      
          // Step 3: Fetch companies
          const companies = await Company.findAll({
            where: {
              cpId: { [Op.in]: companyIds }
            },
            attributes: ['cpId', 'cpCompanyName'],
            group: ['cpId'],
          });
      
          const creatorIds = companies.map(company => company.cpId);
          console.log(`Creator IDs: ${creatorIds}`);
      
          // Step 4: Fetch creators
          const creators = await LmsCreator.findAll({
            where: {
              ctCompanyId: { [Op.in]: creatorIds }
            },
            attributes: ['ctCompanyId', 'ctName'],
            group: ['ctCompanyId'],
          });
      
          // Step 5: Fetch game details
          const game = await LmsGame.findAll({
            where: {
              gameId: gameId
            },
            attributes: ['gameId', 'gameTitle'],
            group: ['gameId'],
          });
      
          // Combine data
          const data = activityLogs.map(log => {
            const learner = learners.find(l => l.lenId === log.galLearnerId);
            const company = companies.find(c => c.cpId === learner.lenCompanyId);
            const creator = creators.find(cr => cr.ctCompanyId === company.cpId);
            
            return {
              ...log.toJSON(),
              gameTitle: game.length > 0 ? game[0].gameTitle : null,
              learner: learner ? learner.toJSON() : null,
              company: company ? company.toJSON() : null,
              creator: creator ? creator.toJSON() : null
            };
          });
          console.log('Combined Data:', JSON.stringify(data, null, 2));
      
          return res.status(200).json({ status: "Success", message: "Data Retrieved Successfully", data :data});
        } catch (error) {
          console.error('Error fetching data:', error);
          return res.status(500).json({ status: 'Failure', message: "Internal Server Error", error: error.message });
        }
      };
      


  module.exports ={ getCreatorname,getGameWiseData,getSkillWiseScore,getLearnerData,getGamesList,gamesListData,updatecohortsgame,gameAnswer, learnerListData, updatecohortsLearner, gameCompleteList, getAssignedGames,getAllLearners, getLearnerFilter,cohortsLearnerDatas,cohortsGamesData,getBlocklWiseScore,getGameAssignData,GameWiseCompletePrint,GameWiseStartedPrint}
