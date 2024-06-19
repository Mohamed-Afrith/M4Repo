const LmsGame = require("../../models/game");
const { Sequelize, Op } = require('sequelize');
const CompletionScreen = require("../../models/completionScreen");
const ReflectionQuestion = require("../../models/reflectionQuestions");
const gameassest = require("../../models/gameAsset")
const gameHistory=require("../../models/gameviewhistory");
const LmsBlocks = require("../../models/blocks");
const lmsQuestionOptions = require("../../models/questionOptions");
const learners = require("../../models/learner");
const gamessign = require("../../models/gameassinged");
const Catgory=require("../../models/category");
const Skill =require("../../models/skills");
const { storageLocations } = require("../../config/storageConfig");
const lmsquestionsoption = require("../../models/questionOptions");
const fs = require("fs");
const path = require("path");
// const { gtts } = require('gtts');
const addGame = async (req, res) => {
  try {
    const LoginUserRole = req.user.user.role;
    const LoginUserId = req.user.user.id;
    if (!req.body) {
      return res.status(400).json({ status: "Failure", message: "Bad request" });
    }
    const gameLasttabValue = req.body.gameLastTab;
    const integerValue = parseInt(gameLasttabValue, 10); // Using parseInt
    // OR
    // const integerValue = +gameLasttabValue; // Using the unary plus operator

    const newArray = [integerValue];

    const cleanedBody = Object.fromEntries(
      Object.entries(req.body).filter(([key, value]) => value !== null && value !== '' && req.body.refQuestion)
    );
    delete cleanedBody.refQuestion;
// OR create a new object without refQuestion
    const { refQuestion, ...newCleanedBody } = cleanedBody;
cleanedBody.gameCreatedDatetime = Date.now();
    cleanedBody.gameActiveStatus = 'Active';
    cleanedBody.gameDeleteStatus = "NO";
    cleanedBody.gameCreatedUserId = req.user.user.id;
    cleanedBody.gameCreatorUserId = req.user.user.id;
    cleanedBody.gameIpAddress = req.connection.remoteAddress;
    cleanedBody.gameUserAgent = req.headers["user-agent"];
    cleanedBody.gameGameStage = 'Creation';
    cleanedBody.gameLastTabArray =  JSON.stringify([integerValue]);
    cleanedBody.gameStageDate=Date.now();
    cleanedBody.gameSkills='';
    cleanedBody.gameQuestNo=1;
    // cleanedBody.gameLastTab = JSON.stringify(req.body.gameLastTab);
   
   // Ensure req.device is available by using relevant middleware
    // Example middleware: express-device
    if (req.device) {
      cleanedBody.gameDeviceType = req.device.type;
    }
   

   
    const result = await LmsGame.create(cleanedBody);
    // return res.status(400).json({ status: "Failure", message: result });

    return res.status(200).json({
      status: "Success",
      message: "Data stored in the database",
      data: result,
    });
  } catch (err) {
    console.error("Error in addgame:", err.message);

    return res.status(500).json({
      status: "Failure",
      message: "Oops! Something went wrong",
      error: err.message || "Internal Server Error",
    });
  }
};


const getGame = async (req, res) => {

  try {
    const LoginUserRole = req.user.user.role;
    const LoginUserId = req.user.user.id;
    const data = req.body;


    const type = req?.params?.type;
    const { count, rows: allData } = await LmsGame.findAndCountAll({
      include: [
        {
          model: gameassest,
          as: 'image',
          attributes: [
            [Sequelize.literal(`CONCAT('${req.protocol}://${req.get('host')}/', gasAssetImage)`), 'gasAssetImage']
          ],
          required: false,
        }
      ],
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
          type !== 'All' ? { gameGameStage: type } : {},  // Corrected the condition here
          data.gameCategoryId ? { gameCategoryId: { [Op.like]: `%${data.gameCategoryId}%` } } : {}  // Corrected the condition here
        ],
        [Op.or]: [
          {
            gameCreatorUserId: LoginUserId
          },
          {
            gameAnotherCreatorId: LoginUserId

          },

        ],
     
      },
      group: ['gameExtensionId'], // Specify the column to group by
      order: [['gameId', 'DESC']]
      
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
    res.status(500).json({ status: 'Failure', message: "Internal Server Error", err: error.message });
  }
}
const getGameTemplate = async (req, res) => {

  try {
    const LoginUserRole = req.user.user.role;
    const LoginUserId = req.user.user.id;
    const data = req.body;


    // const type = req?.params?.type;
    const { count, rows: allData } = await LmsGame.findAndCountAll({
      include: [
        {
          model: gameassest,
          as: 'image',
          attributes: [
            [Sequelize.literal(`CONCAT('${req.protocol}://${req.get('host')}/', gasAssetImage)`), 'gasAssetImage']
          ],
          required: false,
        },
      ],
      attributes: [
        `gameId`, `gameNonPlayerName`, `gameNonPlayerVoice`, `gamePlayerMaleVoice`, `gamePlayerFemaleVoice`, `gameNarratorVoice`, `gameCategoryId`, `gameBackgroundId`, `gameNonPlayingCharacterId`, `gameCharacterName`, `gameTitle`, `gameStoryLine`, `gameSkills`, `gameLearningOutcome`, `gameDuration`, `gameAuthorName`, `gameIsShowLeaderboard`, `gameIsShowReflectionScreen`, `gameTakeawayContent`, `gameAdditionalWelcomeNote`, `gameThankYouMessage`, `gameIsCollectLearnerFeedback`, `gameIsFeedbackMandatory`, `gameIsLearnerMandatoryQuestion`, `gameIsAddanotherQuestions`, `gameIsSetMinPassScore`, `gameIsSetDistinctionScore`, `gameDistinctionScore`, `gameIsSetSkillWiseScore`, `gameIsSetBadge`, `gameBadge`, `gameBadgeName`, `gameIsSetCriteriaForBadge`, `gameAwardBadgeScore`, `gameScreenTitle`, `gameIsSetCongratsSingleMessage`, `gameIsSetCongratsScoreWiseMessage`, `gameCompletedCongratsMessage`, `gameMinimumScoreCongratsMessage`, `gameLessthanDistinctionScoreCongratsMessage`, `gameAboveDistinctionScoreCongratsMessage`, `gameIsShowTakeaway`, `gameIsShowSkill`, `gameIsShowStoryline`, `gameIsShowLearningOutcome`, `gameIsShowGameDuration`, `gameIsShowAuhorName`, `gameIsShowAdditionalWelcomeNote`, `gameMinScore`, `gameIsSetMinimumScore`, `gameMaxScore`, `gameTotalScore`, `gameCreatorUserId`, `gameEditorUserId`, `gameAnotherCreatorId`, `gameReplayAllowed`, `gameReflectionpageAllowed`, `gameReflectionpageBackground`, `gameFeedbackQuestion`, `gameWelcomepageBackground`, `gameLeaderboardAllowed`, `gameReflectionpageid`, `gameLanguageId`, `gameSummaryScreen`, `gameIntroMusic`, `gameDefaultFeedbackForm`, `gameSummarizes`, `gamWelcomePageText`, `gameThankYouPage`, `gameGameStage`, `gameDuplicated`, `gameCourseType`, `gameLaunchedWithinPlatform`, `gameDownloadedAsScorm`, `gameScormVersion`, `gameIsShowInteractionFeedBack`, `gameShuffle`, `gameDisableOptionalReplays`, `gameTrackQuestionWiseAnswers`, `gameDisableLearnerMailNotifications`, `gameLastTab`, `gameCreatedUserId`, `gameCreatedDate`, `gameEditedUserId`, `gameEditedDate`, `gameDeleteStatus`, `gameActiveStatus`, `gameIpAddress`, `gameUserAgent`, `gameDeviceType`, `createdAt`, `updatedAt`, `gameLastTabArray`, `gameCompletionScreenId`, `gameLeaderboardScreenId`, `gameReflectionScreenId`, `gameTakeawayScreenId`, `gameWelcomepageBackgroundScreenId`, `gameThankYouScreenId`, `gameExtensionId`, `gameQuestion1`, `gameQuestion2`, `gameQuestionValue1`, `gameQuestionValue2`, `gameQuestionValue3`, `gameQuestionValue4`, `gameStageDate`,
        [
          Sequelize.literal('(SELECT COUNT(*) FROM lmsgameviewhistory WHERE gvgameId = LmsGame.gameId)'),
          'gameview',
        ],
      ],
      where: {
        [Op.and]: [
          {
            gameDeleteStatus: {
              [Op.or]: {
                [Op.not]: 'Yes',
                [Op.is]: null,
              },
            },
          },
          { gameGameStage: 'Launched' },
          // Assuming data is defined or replace it with the correct variable
          data && data.gameCategoryId ? { gameCategoryId: { [Op.like]: `%${data.gameCategoryId}%` } } : {},
        ],
      },
      group: ['gameExtensionId'], // Specify the column to group by
      order: [['gameId', 'DESC']],
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
    res.status(500).json({ status: 'Failure', message: "Internal Server Error", err: error.message });
  }
}
const updateGame = async (req, res) => {
  try {
    const data = req?.body;
    console.log(data);
    const id = req?.params?.id;
    if(data.gameLastTab) {
      data.gameLastTab = JSON.stringify(data.gameLastTab);
    }

    if (data.gameLastTab) {
      const findlasttab = await LmsGame.findOne({
        where: { 
          gameId: id
        }
      });
     
      if (findlasttab && findlasttab.gameLastTabArray) {
        let updatedArray;
        // return res.status(404).json({ status: 'Failure', message: findlasttab});
        try {
          // Try to parse the existing value as JSON
          updatedArray = JSON.parse(findlasttab.gameLastTabArray);
          
          // If successful, check if the value is already in the array
          if (!updatedArray.includes(data.gameLastTab)) {
            // If not inside, push the value into the array
            updatedArray.push(data.gameLastTab);
            findlasttab.gameLastTabArray = JSON.stringify(updatedArray);
        await findlasttab.save();
        data.gameLastTabArray=findlasttab.gameLastTabArray;
          } else {
            data.gameLastTabArray=findlasttab.gameLastTabArray
            console.log(`Value ${data.gameLastTab} is already inside gameLastTabArray`);
          }
        } catch (error) { 
          // If parsing fails, handle it accordingly
          console.error('Error parsing gameLastTabArray:', error);
        }

        // Save the updated array back to the database
        
        
        console.log(`Value ${data.gameLastTab} processed for gameLastTabArray`);
      } else {
        console.log('gameLastTabArray not found or is null');
       
      }
      // Other logic...
   
     
     
      // data.gameLastTab = JSON.stringify(data.gameLastTab);
    }

    if (!id) return res.status(404).json({ status: 'Failure', message: "bad Request" });
    if (!req.body) return res.status(404).json({ status: 'Failure', message: "bad Request" });
    if (data.gameSkills && Array.isArray(data.gameSkills) && data.gameSkills.length > 0) {
      const updatedSkills = await Promise.all(
        data.gameSkills.map(async (skill) => {
          // Check if a skill with the same name exists
          const existingSkill = await Skill.findOne({
            where: { crSkillName: skill.crSkillName }
          });

          if (existingSkill) {
            // If the skill already exists, use its ID
             return skill.crSkillId ;
          } else {
            // If the skill doesn't exist, insert it and use the new ID
            const newSkill = await Skill.create({ crSkillName: skill.crSkillName,
              crSkillStatus:'Active',
              crDeleteStatus:'No',
              crCreatedDate:Date.now(),
              crUserAgent:req.headers["user-agent"],
              crIpAddress:req.connection.remoteAddress,
              crDeviceType:req.device.type
            });
            return newSkill.crSkillId;
          }
        })
      );
      data.gameSkills = updatedSkills.join(',');
      
      
      // Update data.gameSkills with the new skill IDs
      // data.gameSkills = updatedSkills;

      // Now you can use data.gameSkills which contains skillId and skillName
      // ... rest of your code
    }
    
    // if (data.gameCategoryId && Array.isArray(data.gameCategoryId) && data.gameCategoryId.length > 0) {
   
    //   const updatedCategory = await Promise.all(
    //     data.gameCategoryId.map(async (category) => {
    //       // Check if a skill with the same name exists
    //       const existingCategory = await Catgory.findOne({
    //         where: { catName: category.catName }
    //       });

    //       if (existingCategory) {
    //         // If the skill already exists, use its ID
    //          return category.catId ;
    //       } else {
    //         // If the skill doesn't exist, insert it and use the new ID
    //         const newCategory = await Catgory.create({ catName: category.catName,
    //           catStatus:'Active',
    //           catDeleteStatus:'No',
    //           catCreatedDate:Date.now(),
    //           catUserAgent:req.headers["user-agent"],
    //           catIpAddress:req.connection.remoteAddress,
    //           catDeviceType:req.device.type,
    //           ctCreatedUserId:req.user.user.id,
    //         });
    //         return  newCategory.catId;
    //       }
    //     })
    //   );
    //   data.gameCategoryId = updatedCategory.join(',');
      
    //   data.gameDuplicated='NO';
    //   // Update data.gameSkills with the new skill IDs
    //   // data.gameSkills = updatedSkills;

    //   // Now you can use data.gameSkills which contains skillId and skillName
    //   // ... rest of your code
    // }
    const checkextentsion = await LmsGame.findOne({where: {gameId: id}});
    // res.status(200).send(checkextentsion);
    if(checkextentsion.gameExtensionId){
      data.gameExtensionId=checkextentsion.gameExtensionId;
      
    }else{
      data.gameExtensionId=id;
    }
    
    
    const record = await LmsGame.update(data, {
      where: {
        gameId: id
      }
    });  

    let updateableData= {
      "gameBackgroundId" : data.gameBackgroundId,
      "gameNonPlayingCharacterId" : data.gameNonPlayingCharacterId,
      "gameNonPlayerName": data.gameNonPlayerName,
      "gameNonPlayerVoice": data.gameNonPlayerVoice,
      "gamePlayerMaleVoice": data.gamePlayerMaleVoice,
      "gamePlayerFemaleVoice": data.gamePlayerFemaleVoice,
      "gameNarratorVoice": data.gameNarratorVoice,
      "gameTitle": data.gameTitle,
      "gameStoryLine": data.gameStoryLine,
      "gameLearningOutcome": data.gameLearningOutcome,
      "gameCategoryId": data.gameCategoryId,
      "gameAuthorName": data.gameAuthorName,
      "gameSkills": data.gameSkills,
    }

   const saved= await LmsGame.update(updateableData, {where : {gameExtensionId: data.gameExtensionId}});
//Newly added code
    // data.gameExtensionId=id;
    // // return res.status(404).json({ status: 'Successsss', message: 'Game Updated Succesfully',data:data.gameSkills,datas : data.gameCategoryId})
    
    // const record = await LmsGame.update(data, {
    //   where: {
    //     gameId: id
    //   }
    // });
    if (!record) return res.status(404).json({ status: 'Failure', message: "bad Request" });
    return res.status(200).json({ status: 'Success', message: 'Game Updated Succesfully',data:data });
  }
  catch (error) {
    res.status(500).json({ status: 'Failure', message: "Internal Server Error", err: error.message });
  }
}
const getGameById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ status: 'Failure', message: 'Bad Request' });
    }

    // Fetch data for the specific item based on the provided ID
    const specificData = await LmsGame.findByPk(id);

    if (!specificData) {
      return res.status(404).json({ error: "Record not found" });
    }

    res
      .status(200)
      .json({ status: 'Success', message: "Data Retrieved Successfully", data: specificData });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error", err: error });
  }
};

const getBlocks = async (req, res) => {

  try {
    const id = req?.params?.id;
    if (!id) return res.status(404).json({ status: 'Failure', message: "Id Need" });
    const { count, rows: allData } = await LmsBlocks.findAndCountAll({
      attributes: ['blockId', 'blockTitleTag'],
      where: {
        blockGameId: {
          [Op.eq]: id,
        },
        blockChoosen: {
          [Op.eq]: 'Interactions',
        },
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

  } catch (error) {
    res.status(500).json({ status: 'Failure', message: "Internal Server Error", err: error });
  }
};
const countByStage = async (req, res) => {

  try {
    const LoginUserRole = req.user.user.role;
    const LoginUserId = req.user.user.id;

    const overallCount = await LmsGame.count({
      where: {
        [Op.and]: [
          {
            gameGameStage: {
              [Op.not]: null,
            },
          },
          {
            gameGameStage: {
              [Op.not]: '',
            },
          },
        ],
        gameDeleteStatus: 'No',
        [Op.or]: [
          {
            gameCreatorUserId: LoginUserId,
          },
          {
            gameAnotherCreatorId: LoginUserId,
          },
        ],
      },
      group: ['gameExtensionId'], // Specify the column to group by
    });
    const creationCount = await LmsGame.findAll({
      where: {
        gameGameStage:'Creation',
        gameDeleteStatus: 'No',
        [Op.or]: [
          {
            gameCreatorUserId: LoginUserId,
          },
          {
            gameAnotherCreatorId: LoginUserId,
          },
        ],
      },
      group: ['gameExtensionId'], // Specify the column to group by
    });
    const reviewCount = await LmsGame.findAll({
      where: {
        gameGameStage:'Review',
        gameDeleteStatus: 'No',
        [Op.or]: [
          {
            gameCreatorUserId: LoginUserId,
          },
          {
            gameAnotherCreatorId: LoginUserId,
          },
        ],
      },
      group: ['gameExtensionId'], // Specify the column to group by
    });
    const PublicCount = await LmsGame.findAll({
      where: {
        gameGameStage:'Launched',
        gameDeleteStatus: 'No',
        [Op.or]: [
          {
            gameCreatorUserId: LoginUserId,
          },
          {
            gameAnotherCreatorId: LoginUserId,
          },
        ],
      },
      group: ['gameExtensionId'], // Specify the column to group by
    });



    return res.status(200).json({
      status: 'Success',
      message: "All Data Retrieved Successfully", creationCount:creationCount.length, reviewCount:reviewCount.length, PublicCount:PublicCount.length,count:overallCount.length
    });
    
  } catch (error) {

    res.status(500).json({ status: 'Failure', message: "Internal Server Error", err: error });
  }

}
const gameDuplicate = async (req, res) => {
  try {

    const id = req?.params?.id;

const getAllgame= await LmsGame.findAll({
  where:{
    gameExtensionId:id
  }
  ,
  order: [['gameId', 'ASC']],
})
 

let setExtenstion=[];
const processedGames = await Promise.all(getAllgame.map(async (game, index) => {
  
  const gameToClone = await LmsGame.findByPk(game.gameId);
  let taketile= gameToClone?.gameTitle?.split('_');
  const currentDate = new Date();
const formattedDate = `${currentDate.getDate()}-${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`;
const formattedTime = `${currentDate.getHours()}.${currentDate.getMinutes()}.${currentDate.getSeconds()}`;

// Create newTitle with current date and time
let newTitle = `${taketile[0]}_copied(${formattedDate} ${formattedTime})`;
  const clonedGame = LmsGame.build({
    ...gameToClone.get(), // Using spread syntax to copy all fields
    gameId: null, // Set id to null to create a new record
    // Modify specific fields here
    gameTitle: newTitle, // Change 'someField' to the new value
    gameGameStage: 'Creation',
    gameExtensionId: null,
    gameDuplicated:'YES',
    gameStageDate:Date.now(),
    gameCreatedDatetime:Date.now(),
    gameIpAddress: req.connection.remoteAddress,
    gameUserAgent: req.headers["user-agent"],
   

  });
  await clonedGame.save();

  if(clonedGame && index=== 0){
    
    
    setExtenstion.push(clonedGame.gameId);
  }
      //  return false;
   const gameup= await LmsGame.update(
      { gameExtensionId: setExtenstion[0] },
      {
        where: {
          gameId: clonedGame.gameId
        }
      }
    );
    console.log('setExtenstion',setExtenstion[0]);
console.log('clonedGame.gameId',gameup,index);
  
  
  if (clonedGame) {
    const blocksToClone = await LmsBlocks.findAll({
      where: {
        blockGameId: id,
        blockQuestNo:clonedGame.gameQuestNo,// Replace 'yourValue' with the actual value you're searching for
      }

    });
   
    if (blocksToClone) {
      for (const block of blocksToClone) {
        // Perform your actions for each block here
        // For example, clone the block or perform any other operation
        const clonedBlock = await LmsBlocks.create({
          ...block.get(),
          blockId:null,
          blockGameId: setExtenstion[0],
         
        });
        await clonedBlock.save();
        if (clonedBlock) {
          const QuestionsOptionToClone = await lmsQuestionOptions.findAll({
            where: {
              qpQuestionId: block.blockId,
            }
          });

          if (QuestionsOptionToClone) {
            for (const option of QuestionsOptionToClone) {
              const clonedOption = await lmsQuestionOptions.create({
                ...option.get(),
                qpOptionId:null,
                qpQuestionId: clonedBlock.blockId,
                qpGameId:setExtenstion[0]
              });
              await clonedOption.save();

            }
          }
        }

      }
    } else {
      // const result = await LmsGame.destroy({
      //   where: {
      //     gameId: clonedGame.gameId,
      //   },
      // });
      // res.status(400).json({ message: 'Stroy Not In the Game .', data: clonedGame.gameId });

    }
    if(index===0){
      const relfectionToClone = await ReflectionQuestion.findAll({
        where: {
          refGameId: id // Replace 'yourValue' with the actual value you're searching for
        }
  
      });
      
      if (relfectionToClone) {
        for (const ref of relfectionToClone) {
  
          const clonedRelfection = await ReflectionQuestion.create({
            ...ref.get(),
            refId: null, // Set id to null to create a new record
            refGameId: setExtenstion[0]
          });
  
        }
      }
    }
   



   
  } else {
   
   return  res.status(400).json({ status: 'Failure', message: 'Game Not Duplicated .' });
  }

  
}));

if ( setExtenstion.length > 0) { // Check if setExtenstion is not empty
  const sendData = await LmsGame.findAll({
    where: {
      gameId: setExtenstion[0]
    }
  });
  return res.status(200).json({ status: 'Success', message: 'Game Duplicated successfully.', data: sendData });
}
return res.status(200).json({ status: 'Success', message: 'Game Duplicated successfully.', data: sendData });

  } catch(error) {

    res.status(500).json({ status: 'Failure', message: "Internal Server Error", err: error.message });
  }

}
const gameLaunch = async (req, res) => {
  try {
    const id = req?.params?.id;
    const record = await LmsGame.findByPk(id);
    if (!record) {
      return res.status(404).json({ status: 'Failure', error: 'Record not found' });
    }

    const intral = await LmsGame.update(
      {
        gameDuplicated: 'NO',
        gameGameStage: 'Review',
        gameStageDate: Date.now(),
      },
      {
        where: {
          gameExtensionId: id,
        },
      }
    );
    // await record.destroy();

    res.status(200).json({ status: 'Success', message: 'Record Successfully Deleted' });

  } catch {
    res.status(500).json({ status: 'Failure', message: "Internal Server Error", err: error });
  }

}
const gameAssign = async (req, res) => {
  try {
    const id = req?.params?.id;
    const data = req.body;


  } catch {

  }

}
const gamePublic = async (req, res) => {
  try {

    const id = req?.params?.id;

const getAllgame= await LmsGame.findAll({
  where:{
    gameExtensionId:id
  }
  ,
  order: [['gameId', 'ASC']],
})
 

let setExtenstion=[];
const processedGames = await Promise.all(getAllgame.map(async (game, index) => {
  
  const gameToClone = await LmsGame.findByPk(game.gameId);
  let taketile= gameToClone?.gameTitle?.split('_');
  const currentDate = new Date();
const formattedDate = `${currentDate.getDate()}-${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`;
const formattedTime = `${currentDate.getHours()}.${currentDate.getMinutes()}.${currentDate.getSeconds()}`;

// Create newTitle with current date and time
let newTitle = `${taketile[0]}_copied(${formattedDate} ${formattedTime})`;
  const clonedGame = LmsGame.build({
    
   ...gameToClone.get(), // Using spread syntax to copy all fields
      gameId: null, // Set id to null to create a new record
      gameGameStage: 'Launched',
      gameExtensionId:null,
      gameDuplicated:'NO',
      gameStageDate:Date.now(),
      gameCreatedDatetime:Date.now(),
      gameIpAddress: req.connection.remoteAddress,
      gameUserAgent: req.headers["user-agent"],
   

  });
  await clonedGame.save();

  if(clonedGame && index=== 0){
    
    
    setExtenstion.push(clonedGame.gameId);
  }
      //  return false;
   const gameup= await LmsGame.update(
      { gameExtensionId: setExtenstion[0] },
      {
        where: {
          gameId: clonedGame.gameId
        }
      }
    );
    console.log('setExtenstion',setExtenstion[0]);
console.log('clonedGame.gameId',gameup,index);
  
  
  if (clonedGame) {
    const blocksToClone = await LmsBlocks.findAll({
      where: {
        blockGameId: id,
        blockQuestNo:clonedGame.gameQuestNo,// Replace 'yourValue' with the actual value you're searching for
      }

    });
   
    if (blocksToClone) {
      for (const block of blocksToClone) {
        // Perform your actions for each block here
        // For example, clone the block or perform any other operation
        const clonedBlock = await LmsBlocks.create({
          ...block.get(),
          blockId:null,
          blockGameId: setExtenstion[0],
         
        });
        await clonedBlock.save();
        if (clonedBlock) {
          const QuestionsOptionToClone = await lmsQuestionOptions.findAll({
            where: {
              qpQuestionId: block.blockId,
            }
          });

          if (QuestionsOptionToClone) {
            for (const option of QuestionsOptionToClone) {
              const clonedOption = await lmsQuestionOptions.create({
                ...option.get(),
                qpOptionId:null,
                qpQuestionId: clonedBlock.blockId,
                qpGameId:setExtenstion[0]
              });
              await clonedOption.save();

            }
          }
        }

      }
    } else {
      // const result = await LmsGame.destroy({
      //   where: {
      //     gameId: clonedGame.gameId,
      //   },
      // });
      // res.status(400).json({ message: 'Stroy Not In the Game .', data: clonedGame.gameId });

    }
    if(index===0){
      const relfectionToClone = await ReflectionQuestion.findAll({
        where: {
          refGameId: id // Replace 'yourValue' with the actual value you're searching for
        }
  
      });
      
      if (relfectionToClone) {
        for (const ref of relfectionToClone) {
  
          const clonedRelfection = await ReflectionQuestion.create({
            ...ref.get(),
            refId: null, // Set id to null to create a new record
            refGameId: setExtenstion[0]
          });
  
        }
      }
    }
   



   
  } else {
   
   return  res.status(400).json({ status: 'Failure', message: 'Game Not Duplicated .' });
  }

  
}));

if ( setExtenstion.length > 0) { // Check if setExtenstion is not empty
  const sendData = await LmsGame.findAll({
    where: {
      gameId: setExtenstion[0]
    }
  });
  return res.status(200).json({ status: 'Success', message: 'Game Duplicated successfully.', data: sendData });
}
return res.status(200).json({ status: 'Success', message: 'Game Duplicated successfully.', data: sendData });

  } catch(error) {

    res.status(500).json({ status: 'Failure', message: "Internal Server Error", err: error.message });
  }

}
const gameDelete = async (req, res) => {
  try {
    const id = req?.params?.id;
    const record = await LmsGame.findByPk(id);
    if (!record) {
      return res.status(404).json({ status: 'Failure', error: 'Record not found' });
    }

    const gamedelete= await LmsGame.update({ gameDeleteStatus: 'YES',

  where:{
    gameExtensionId:id
  }
  
  });
    // await record.destroy();

    res.status(200).json({ status: 'Success', message: 'Record Successfully Deleted' });
  } catch {
    res.status(500).json({ status: 'Failure', message: "Internal Server Error", err: error });
  }

}
const gameLearnersList = async (req, res) => {
  try {
    const LoginUserRole = req.user.user.role;
    const LoginUserId = req.user.user.id;
    const id = req?.params?.id;

    const getlearners = await learners.findAll({
      where: {
        lenCreatorId: LoginUserId,
        lenDeleteStatus: 'NO',
        lenStatus: 'Active',
      },
    });

    const getassignlist = await gamessign.findAll({
      attributes: ['gaLearnerId'],
      where: {
        gaGameId: id,
        gaDeleteStatus: 'NO',
      },
    });
    
    // Extracting gaLearnerId values into an array
    const learnerIdsArray = getassignlist.map(item => item.gaLearnerId);

    res.status(200).json({
      status: 'Success',
      message: 'Record Successfully Deleted',
      learner: getlearners,
      assign: learnerIdsArray,
    });
  } catch (error) {
    res.status(500).json({
      status: 'Failure',
      message: 'Internal Server Error',
      err: error.message,
    });
  }
};


const textToSpeech = async (req, res) => {
  // const text = req.query.text || 'Hello, bakiya?';
  // const lang = req.query.lang || 'en';

  // const tts = new gtts(text, lang);
  // tts.save('output.mp3', (err, result) => {
  //   if (err) {
  //     console.error(err);
  //     res.status(500).send('Internal Server Error');
  //   } else {
  //     res.sendFile(__dirname + '/output.mp3');
  //   }
  // });
};
const gameQuestionDuplicateEntire = async (req, res) => {
  try {

    const { key ,questNo } = req.body; 

    const id = req?.params?.id;

    if(!key) return res.status(400).json({ status: "Failure", message: "key not found"});

    const getGameExtensionId = await LmsGame.findOne({
      attributes: ['gameExtensionId'],
      where: { 
        gameId:id,
      gameDeleteStatus:'No'},
      order: [['gameId', 'ASC']]
    });

    const getGameExtensionCounts = await LmsGame.count({
      where: {
        gameExtensionId: getGameExtensionId.gameExtensionId,
        gameDeleteStatus: 'No'
      }
    });

   const getGameExtensionCount=getGameExtensionCounts+1
   const gameToClone = await LmsGame.findByPk(id);
   if (!gameToClone)return res.status(400).json({ status: "Failure", message: "Game not Found" });

   const clonedGame = await LmsGame.create({
     ...gameToClone.toJSON(),
     gameId: null,
     gameExtensionId:gameToClone.gameExtensionId ?gameToClone.gameExtensionId: gameToClone.gameId,
     gameQuestNo :getGameExtensionCount
   });
    if(key === 'Entire')
    {
     
      if (!clonedGame) return res.status(400).json({ status: "Failure", message: "Game Not Duplicated." });

      if (clonedGame) {

        const blocksToClone = await LmsBlocks.findAll({
          where: {
            blockGameId: id ,// Replace 'yourValue' with the actual value you're searching for
            blockQuestNo:questNo
          }
  
        });
        if (blocksToClone) {
          for (const block of blocksToClone) {

              const parts = block.blockPrimarySequence.split(".");
              
            block.blockQuestNo=getGameExtensionCount;
              
              block.blockPrimarySequence = getGameExtensionCount + "." + parts[1];
            
         
              const dragParts = block.blockDragSequence.split(".");
        
              block.blockDragSequence = getGameExtensionCount + "." + dragParts[1];
            
            const clonedBlock = await LmsBlocks.create({
              ...block.get(),
              blockId:null,
              blockGameId: id,
            });
           
            await clonedBlock.save();
            
              const QuestionsOptionToClone = await lmsQuestionOptions.findAll({
                where: {
                  qpQuestionId: block.blockId,
                }
              });
            
              if (QuestionsOptionToClone) {
               
                for (const option of QuestionsOptionToClone) {

                  const clonedOption = await lmsQuestionOptions.create({
                    ...option.get(),
                    qpOptionId:null,
                    qpQuestionId: clonedBlock.blockId,
                    qpGameId:id,
                    qpSequence:clonedBlock.blockPrimarySequence
                  });

               
                  await clonedOption.save();
                 
                }
              }
            
  
          }

        } else {
          const result = await LmsGame.destroy({
            where: {
              gameId: clonedGame.gameId,
            },
          });
          res.status(400).json({ message: 'Stroy Not In the Game .', data: clonedGame.gameId });
  
        }

       
  
  
  
       return res.status(200).json({ status: 'Success', message: 'Game Duplicated successfully.', data: clonedGame });
      } else {
        return  res.status(400).json({ status: 'Failure', message: 'Game Not Duplicated .' });
  
      }

      // const question = await LmsBlocks.findAll({where:{blockGameId:id}});

      // if (!question) return res.status(400).json({ status: "Failure", message: "Block Not Found." });
      // const newquestion = question.map(obj => {
      //   // Extract the number after the dot in blockPrimarySequence
      //   const parts = obj.blockPrimarySequence.split(".");
      //   const fristpart = parts[0];
      
      //   // Increment the last part by 1
      //   const newFristPart = parseInt(fristpart, 10) + 1;
      
      //   // Replace the last part in blockPrimarySequence
      //   obj.blockPrimarySequence = newFristPart + "." + parts[1];
      
      //   // Repeat the process for blockDragSequence
      //   const dragParts = obj.blockDragSequence.split(".");
      //   const newDragLastPart = parseInt(dragParts[0], 10) + 1;
      //   obj.blockDragSequence = newDragLastPart + "." + dragParts[1];
      
      //   return obj; // Return the modified object
      // });

      
      // const duplicatedBlocks = question.map((newquestion) => ({
      //   ...newquestion.toJSON(),
      //   blockId: null,
      //   blockGameId:clonedGame.gameId,
      // }));
      
      // const createdBlocks = await LmsBlocks.bulkCreate(duplicatedBlocks);
      // const questionOption = await lmsquestionsoption.findAll({where:{qpGameId:id}});
      // const newquestionOptions = questionOption.map(obj => {
      //   // Extract the number after the dot in blockPrimarySequence
      //   const parts = obj.qpSequence.split(".");
      //   const fristpart = parts[0];
      
      //   // Increment the last part by 1
      //   const newFristPart = parseInt(fristpart, 10) + 1;
      
      //   // Replace the last part in blockPrimarySequence
      //   obj.qpSequence = newFristPart + "." + parts[1];
      
      //   // Repeat the process for blockDragSequence
       
      
      //   return obj; // Return the modified object
      // });
      // const duplicatedOptions = questionOption.map((newquestionOptions) => ({
      //   ...newquestionOptions.toJSON(),
      //   qpOptionId: null,
      //   qpGameId:clonedGame.gameId,
      // }));
      // const createdOption = await lmsquestionsoption.bulkCreate(duplicatedOptions);
     
      // if (!createdBlocks || createdBlocks.length === 0)
      // return res.status(400).json({ status: "Failure", message: "Block not Duplicated",data:question }); 
      // return res.status(200).json({status: "Success",message: "Game Duplicated successfully.",data: clonedGame});
   
    }
    
    

      
      if (!clonedGame)
      {
        return res.status(400).json({ status: "Failure", message: "Game Not Duplicated." });
      }else{
        return res.status(200).json({ status: "Success", message: "Game Duplicated successfully." , data: clonedGame });

      }
  
    } catch (error) {

      
        return res.status(500).json({ status: "Failure", message: "Internal Server Error", err: error.message });
      
    
    }
};
const getDefaultCat = async (req, res) => {
  try {

    const id = req?.params?.id;

    const alredycat = await LmsGame.findOne({
      where: { gameId: id }
    });
    
    let whereClause;
    
    if (alredycat && alredycat.gameCategoryId) {
      const catIdArray = alredycat.gameCategoryId.split(',').map(Number);
    
      whereClause = {
        catId: {
          [Op.in]: catIdArray,
        },
      };
    } else {
      whereClause = {
        catDefaultStatus: 'YES',
      };
    }
    
    const defaultCatgory = await Catgory.findAll({
      attributes: ['catId', 'catName', 'catDefaultStatus'],
      where: {
        catStatus: 'Active',
        catDeleteStatus: 'NO',
        ...whereClause, // Use the dynamically generated whereClause
      },
    });
    res.status(200).json({
      status: 'Success',
      message: 'Record Successfully Deleted',
      data: defaultCatgory,
    });
  }
  catch (error) {
    res.status(500).json({
      status: 'Failure',
      message: 'Internal Server Error',
      err: error.message,
    });
  }



};
const getDefaultSkill = async (req, res) => {

  try {
    const id = req?.params?.id;

    const alredycat = await LmsGame.findOne({
      where: { gameId: id }
    });
    
    let whereClause;
    let  defaultSkill=[];
    if (alredycat && alredycat.gameSkills) {
      const catIdArray = alredycat.gameSkills.split(',').map(Number);

      
      whereClause = {
        crSkillId: {
          [Op.in]: catIdArray,
        },
      };

      defaultSkill = await Skill.findAll({
        attributes: ['crSkillId','crSkillName','crDefaultStatus'],
        where: {
        
          
          
          ...whereClause, // Use the dynamically generated whereClause
        },
      });

    }
    //  else {
    //   whereClause = {
    //     crDefaultStatus: 'YES',
    //   };
    // }


      
    res.status(200).json({
      status: 'Success',
      message: 'Record Successfully Deleted',
      data: defaultSkill,
    });
  }
  catch (error) {
    res.status(500).json({
      status: 'Failure',
      message: 'Internal Server Error',
      err: error.message,
    });
  }
};
const getCreatorBlocks = async (req, res) => {
  try{
      const { id } = req.params;
      const ext = await LmsGame.findOne({where:{gameId:id}});
      if(!ext) return res.status(404).json({status: "Failure", error: "Questions Not Found" });
      
      let quest=[];
      if(ext.gameExtensionId){
       quest = await LmsGame.findAll({
        where:{
          gameExtensionId:ext.gameExtensionId
          },
        });
      }
      if(!quest) return res.status(404).json({ status: "Failure", error: "Questions Not Found" });

      const data = await LmsBlocks.findAll({where:{blockGameId:id}});
      if (!data) return res.status(404).json({ status: "Failure", error: "File not found" });
      return res.status(200).json({ status: "Success", message: "File not found", data: data,quest:quest});
    } 
  catch (error){
    return res.status(500).json({status: "Failure",message: "Internal Server Error",err: error.message});
  }}
const uploadBadge = async (req,res) =>{
  try{
        const file = req.file;
        if(!file) return res.status(404).json({ status: 'Failure', error: 'File not found' });
        const path = {};
        path.gasAssetImage = storageLocations.badges+file.filename;
        path.gasAssetType = 4;
        path.gasCreatedUserId = req.user.user.id;
        path.gasCreatedDate = Date.now();
        path.gasAssetName = req.body.gasAssertName;
        path.gasStatus = 'Active';
        path.gasDeleteStatus = 'NO';
        path.gasIpAddress = req.connection.remoteAddress;
        path.gasUserAgent = req.headers["user-agent"];
        path.gasDeviceType = req.device.type;
        const data = await LmsGameAssets.create(path);
        if(!data) return res.status(404).json({ status: 'Failure', error: 'File not found' });
        return res.status(200).json({ status: 'Success', message: 'File not found',data:data});
  }
  catch (error) {
    res.status(500).json({
      status: 'Failure',
      message: 'Internal Server Error',
      err: error.message,
    });
  }
}
const uploadIntroMusic = async (req,res) =>{
  try{
       
        const file = req.file;
        if(!file) return res.status(404).json({ status: 'Failure', error: 'File not found' });
        const path = {};
        path.gasAssetImage = storageLocations.badges+file.filename;
        path.gasAssetType = 7;
        path.gasCreatedUserId = req.user?.user?.id;
        path.gasCreatedDate = Date.now();
        path.gasAssetName = req.body.gasAssetName;
        path.gasStatus = 'Active';
        path.gasDeleteStatus = 'NO';
        path.gasIpAddress = req.connection.remoteAddress;
        path.gasUserAgent = req.headers["user-agent"];
        path.gasDeviceType = req.device.type;
        const data = await LmsGameAssets.create(path);
        if(!data) return res.status(404).json({ status: 'Failure', error: 'File not found' });
        return res.status(200).json({ status: 'Success', message: 'Audio not found',data:data});
  }
  catch (error) {
   return res.status(500).json({
      status: 'Failure',
      message: 'Internal Server Error',
      err: error.message,
    });
  }
}
const getBadge = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id)
      return res
        .status(404)
        .json({ status: "Failure", error: "File not found" });
    const data = await LmsGame.findOne({ where: { gameId: id } });
    if (!data)
      return res
        .status(404)
        .json({ status: "Failure", error: "File not found" });
    const badge = await LmsGameAssets.findOne({
      where: { gasId: data.gameBadge, gasAssetType: 4 },
    });
    if (!badge)
      return res
        .status(404)
        .json({ status: "Failure", error: "please upload Badge" });
    const url = `${req.protocol}://${req.get("host")}/${badge.gasAssetImage}`;
    if (!url)
      return res
        .status(404)
        .json({ status: "Failure", error: "File not found" });
    return res
      .status(200)
      .json({ status: "Success", message: "File not found", data: url });
  } catch (error) {
    res.status(500).json({
      status: "Failure",
      message: "Internal Server Error",
      err: error.message,
    });
  }
};

const getAudio = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id)
      return res
        .status(404)
        .json({ status: "Failure", error: "File not found1" });
    const data = await LmsGame.findOne({ where: { gameId: id } });
       if (!data)
      return res
        .status(404)
        .json({ status: "Failure", error: "File not found3" });
    const badge = await gameassest.findOne({
      where: { gasId: data.gameBadge, gasAssetType: 7 },
    });
    if (!badge)
      return res
        .status(404)
        .json({ status: "Failure", error: "please upload Audio4" });
    const url = `${req.protocol}://${req.get("host")}/${badge.gasAssetImage}`;
    if (!url)
      return res
        .status(404)
        .json({ status: "Failure", error: "File not found5" });
    return res
      .status(200)
      .json({ status: "Success", message: "Had a File ", data: url });
  } catch (error) {
    return res.status(500).json({ status: "Failure",message: "Internal Server Error6",err: error.message});
  }
};



const StroyInserting = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    
    const alp =data.alphabet;
    const inputFiled = data.input;
    const alpArray = Object.values(alp);
    let setArray = [];
    const items = data.items;
    const interactionBlock=data?.interactionBlock??null    

// Use map to get the 'input' property from each object in the array
const itemsNames = items.map((it) => it.input);

// Convert the array of tag names into a string

//main block tabel
const countNotIn = await LmsBlocks.count({
  where: {
    blockGameId: id,
    blockSecondaryId: {
      [Op.notIn]: itemsNames ,
    },
    blockQuestNo:items[0].questNo
  },
});

    if (countNotIn > 0) {


    await LmsBlocks.update(
      { blockDeleteStatus: 'YES' },
      {
        where: {
          blockGameId: id,
          blockSecondaryId:{ [Op.notIn]: itemsNames },
          blockQuestNo:items[0].questNo
        },
      }
    );
    }
    await LmsBlocks.update(
      { blockDeleteStatus: 'NO' },
      {
        where: {
          blockGameId: id,
          blockSecondaryId:{ [Op.in]: itemsNames },
          blockQuestNo:items[0].questNo
        },
      }
    );

    const countQuestionNotIn = await lmsQuestionOptions.count({
      where: {
        qpGameId: id,
        qpQuestionId: {
          [Op.notIn]: itemsNames ,
        },
      },
    });
    if (countQuestionNotIn > 0) {


      // await lmsQuestionOptions.update(
      //   { qpDeleteStatus: 'YES' },
      //   {
      //     where: {
      //       qpGameId: id,
      //       qpQuestionId:{ [Op.notIn]: itemsNames },
      //     },
      //   }
      // );
      }
     

    // return res.status(500).json({ status: 'Failures', error: alpvalues });
    for (const item of items) {
      const findtypeNumber = item.type + item.input;

      // Check if inputFiled is an object and has the key findtypeNumber
      if (typeof inputFiled === 'object' && inputFiled.hasOwnProperty(findtypeNumber)) {
         const foundItem = inputFiled[findtypeNumber];
        
         const Exitist = await LmsBlocks.findOne({
          where: { blockGameId: id, blockSecondaryId: item.input , blockQuestNo:item.questNo},
        });
 if(item.type=='Note'){

if(Exitist){

  const result = await LmsBlocks.update(
    {
      blockGameId: id,
      blockQuestNo:item.questNo,
      blockSecondaryId: item.input,
      blockPrimarySequence: item.id,
      blockDragSequence: foundItem.id,
      blockChoosen: item.type,
      blockText: foundItem.note,
      blockAssetId: null,
      blockSkillTag: null,
      blockTitleTag: null,
      blockRoll: 'Narrator',
      blockVoiceGender: null,
      blockVoiceEmotions: null,
      blockCreatedDatetime: Date.now(),
      blockVoiceAccents: null,
      blockCharacterposesId: null,
      blockAnimationId: null,
      blockDeleteStatus: 'NO',
      blockActiveStatus: 'Active',
      blockIpAddress: req.connection.remoteAddress,
      blockDeviceType: req.device.type,
      blockUserAgent: req.headers["user-agent"],
      blockLeadTo:foundItem?.Notenavigate??null,
       blockShowNavigate:foundItem?.NoteleadShow??null,
    },
    {
      where: {
        blockGameId: id,
        blockSecondaryId: item.input,
        blockQuestNo:item.questNo,
      },
    }
  );


  setArray.push(result);

}else{
  const result = await LmsBlocks.create({
    blockGameId:id ,
    blockQuestNo:item.questNo,
    blockSecondaryId:item.input,
    blockPrimarySequence:item.id,
    blockDragSequence:foundItem.id,
    blockChoosen:item.type ,
    blockText:foundItem.note ,
    blockAssetId:null ,
    blockSkillTag:null ,
    blockTitleTag:null ,
    blockRoll:'Narrator',
    blockVoiceGender:null ,
    blockVoiceEmotions:null ,
    blockCreatedDatetime: Date.now() ,
    blockVoiceAccents:null ,
    blockCharacterposesId:null ,
    blockAnimationId:null ,
    blockDeleteStatus:'NO' ,
    blockActiveStatus:'Active',
    blockIpAddress:req.connection.remoteAddress,
    blockDeviceType:req.device.type ,
    blockUserAgent:req.headers["user-agent"] ,
    blockLeadTo:foundItem?.Notenavigate??null,
       blockShowNavigate:foundItem?.NoteleadShow??null,
  });


  setArray.push(result);
}
  
}


 if(item.type=='Dialog'){
  if(Exitist){
    const result = await LmsBlocks.update(
      {
      blockGameId:id ,
      blockQuestNo:item.questNo,
      blockSecondaryId:item.input,
      blockPrimarySequence:item.id,
      blockDragSequence:foundItem.id,
      blockChoosen:item.type ,
      blockText:foundItem.dialog ,
      blockAssetId:null ,
      blockSkillTag:null ,
      blockTitleTag:null ,
      blockRoll:foundItem.character,
      blockVoiceGender:null ,
      blockVoiceEmotions:foundItem.voice,
      blockCreatedDatetime: Date.now() ,
      blockVoiceAccents:null ,
      blockCharacterposesId:foundItem.animation ,
      blockAnimationId:null ,
      blockDeleteStatus:'NO' ,
      blockActiveStatus:'Active',
      blockIpAddress:req.connection.remoteAddress,
      blockDeviceType:req.device.type ,
      blockUserAgent:req.headers["user-agent"] ,
      blockLeadTo:foundItem?.Dialognavigate??null,
       blockShowNavigate:foundItem?.DialogleadShow??null,
      },
      {
        where: {
          blockGameId: id,
          blockSecondaryId: item.input,
          blockQuestNo:item.questNo,
        },
      }
    ); 
  



  setArray.push(result);
  }else{

    const result = await LmsBlocks.create({
      blockGameId:id ,
      blockQuestNo:item.questNo,
      blockSecondaryId:item.input,
      blockPrimarySequence:item.id,
      blockDragSequence:foundItem.id,
      blockChoosen:item.type ,
      blockText:foundItem.dialog ,
      blockAssetId:null ,
      blockSkillTag:null ,
      blockTitleTag:null ,
      blockRoll:foundItem.character,
      blockVoiceGender:null ,
      blockVoiceEmotions:null  ,
      blockCreatedDatetime: Date.now() ,
      blockVoiceAccents:null ,
      blockCharacterposesId:foundItem.animation ,
      blockAnimationId:null ,
      blockDeleteStatus:'NO' ,
      blockActiveStatus:'Active',
      blockIpAddress:req.connection.remoteAddress,
      blockDeviceType:req.device.type ,
      blockUserAgent:req.headers["user-agent"] ,
      blockLeadTo:foundItem?.Dialognavigate??null,
      blockShowNavigate:foundItem?.DialogleadShow??null,
    });

    setArray.push(result);

  }
 }

 
 if(item.type=='Interaction'){
let result;
  if(Exitist){
    const results = await LmsBlocks.update(
      {
        blockGameId:id ,
        blockQuestNo:item.questNo,
        blockSecondaryId:item.input,
        blockPrimarySequence:item.id,
        blockDragSequence:foundItem.id,
        blockChoosen:item.type ,
        blockText:foundItem.interaction ,
        blockAssetId:null ,
        blockSkillTag:foundItem.SkillTag??null ,
        blockTitleTag:foundItem.quesionTitle ,
        blockRoll:foundItem.blockRoll,
        blockResponseRoll:foundItem.responseRoll,
        blockVoiceGender:null ,
        blockVoiceEmotions:foundItem.QuestionsVoice??null ,
        blockCreatedDatetime: Date.now() ,
        blockVoiceAccents:null ,
        blockCharacterposesId:foundItem.QuestionsEmotion ,
        blockAnimationId:null ,
        blockDeleteStatus:'NO' ,
        blockActiveStatus:'Active',
        blockIpAddress:req.connection.remoteAddress,
        blockDeviceType:req.device.type ,
        blockUserAgent:req.headers["user-agent"] ,
      },
      {
        where: {
          blockGameId: id,
          blockSecondaryId: item.input,
          blockQuestNo:item.questNo,
        },
        returning: true, // This option is used to get the updated rows
   
      }
    );
    if(results){
      //1998
      
      result=await LmsBlocks.findOne({
        where: {
          blockGameId: id,
          blockSecondaryId: item.input
        },
      });
    }
    // return res.status(500).json({ status: 'Failuress', error: result   });
if(results){
  setArray.push('result'+result.blockId);
  const objectsWithId1_1 = alpArray.filter(obj => obj.seqs === item.id);
 // sub question tabel
 const alpvalues = objectsWithId1_1.map((al) => al.secondaryId);
 
 const countaplNotIn = await lmsQuestionOptions.count({
  where: {
    qpQuestionId: result.blockId,
    qpSecondaryId: {
      [Op.notIn]: alpvalues ,
    },
  },
});

    if (countaplNotIn > 0) {
    await lmsQuestionOptions.update(
      { qpDeleteStatus: 'YES' },
      {
        where: {
          qpQuestionId: result.blockId,
          qpSecondaryId:{ [Op.notIn]: alpvalues },
        },
      }
    );
    }
    
//
  for (const object of objectsWithId1_1) {
 const beforeKey=object.option
 const  key = beforeKey.replace(/'/g, '');
 
 try {
 
 // ansObject
 
 // optionsObject
 // feedbackObject
 // responseObject
 // optionTitleObject
 // optionsemotionObject
 // optionsvoiceObject
 // responseemotionObject
 // scoreObject
 // navigateObjects
 if(interactionBlock){

        
 }





 const responseEmotion = foundItem?.responseemotionObject?.[key] ?? '';
 const NextOption = foundItem?.navigateObjects?.[key] ?? '';
 const NavigateShow = foundItem?.navigateshowObjects?.[key] ?? '';
 const Emotion = foundItem?.optionsemotionObject?.[key] ?? '';
 const Voice = foundItem?.optionsvoiceObject?.[key] ?? '';
 const TitleTag = foundItem?.optionTitleObject?.[key] ?? '';
 const Score = foundItem?.scoreObject?.[key] === '' || isNaN(foundItem?.scoreObject?.[key]) ? null : Number(foundItem?.scoreObject?.[key]);
 const Feedback =foundItem?.feedbackObject?.[key] ?? '';
 const Response =foundItem?.responseObject?.[key] ?? '';
 const OptionText=foundItem?.optionsObject?.[key] ?? '';
  
 setArray.push(object.secondaryId);
 
const OptionExitist = await lmsQuestionOptions.findOne({
  where: { qpQuestionId: result.blockId , qpBlockSecondaryId: item.input, qpSecondaryId: object.secondaryId },
});
console.log('Item Input:', item.input);
console.log('Object Secondary ID:', object.secondaryId);
console.log('Key:', key);
console.log('OptionExitist:', OptionExitist);

console.log('OptionExitist:', OptionExitist);

   
 let options='';
 if(OptionExitist){
  setArray.push('OptionExitist'+key);
    options = await lmsQuestionOptions.update({
      qpGameId:id,
     qpQuestionId: result.blockId ,
      qpSecondaryId: object.secondaryId,
     qpOptions: key,
     qpSequence: object.seqs,
     qpOptionText:OptionText,
     qpResponse: Response,
     qpTag: foundItem?.ansObject[key]==true||foundItem?.ansObject[key]=='true'? 'true' : 'false',
     qpFeedback: Feedback, // Corrected line
     qpSkillTag: null,
     qpScore: Score,
     qpTitleTag: TitleTag,
     qpEmotion: Emotion,
     qpVoice: Voice,
     qpResponseEmotion: responseEmotion,
     qpBlockSecondaryId:item.input,
     qpNextOption: NextOption,
     qpNavigateShow: NavigateShow,
     qpCreatedDatetime: Date.now(),
     qpEditedDatetime: Date.now(),
     qpDeleteStatus: 'NO',
     qpActiveStatus: 'Yes',
     qpIpAddress: req.connection.remoteAddress,
     qpUserAgent: req.headers["user-agent"],
     qpDeviceType: req.device.type,
     },
     {
       where: {
          qpQuestionId: result.blockId, qpSecondaryId: object.secondaryId
          
       },
     }
   );
 
 
   setArray.push(options)
 
 }else{
  setArray.push('OptionExitist not'+result.blockId+'---'+object.secondaryId);
  
    options = await lmsQuestionOptions.create({
      qpGameId:id,
     qpQuestionId: result.blockId,
     qpSecondaryId: object.secondaryId,
     qpOptions: key,
     qpSequence: object.seqs,
     qpOptionText:OptionText,
     qpResponse: Response,
     qpTag: foundItem?.ansObject[key]=='true'? 'true' : 'false',
     qpFeedback: Feedback, // Corrected line
     qpSkillTag: null,
     qpScore: Score,
     qpTitleTag: TitleTag,
     qpEmotion: Emotion,
     qpVoice: Voice,
     qpResponseEmotion: responseEmotion,
     qpBlockSecondaryId:item.input,
     qpNextOption: NextOption,
     qpNavigateShow: NavigateShow,
     qpCreatedDatetime: Date.now(),
     qpEditedDatetime: Date.now(),
     qpDeleteStatus: 'NO',
     qpActiveStatus: 'Yes',
     qpIpAddress: req.connection.remoteAddress,
     qpUserAgent: req.headers["user-agent"],
     qpDeviceType: req.device.type,
   });

  
   if(options){
    
   }else{
     return res.status(500).json({ status: 'Failure', error: error.message });
   
   }
 }
 
 if(options){
  
 }else{
   return res.status(500).json({ status: 'Failure', error: error.message });
 
 }
 } catch (error) {
   // Handle the error within the loop
   console.error('Error within loop:', error.message);
 
   // Return an appropriate response or handle the error as needed
   return res.status(500).json({ status: 'Failure', error: error.message });
 }

  }

}

    setArray.push(result);
  }else{
    

    const result = await LmsBlocks.create({
      blockGameId:id ,
      blockQuestNo:item.questNo,
      blockSecondaryId:item.input,
      blockPrimarySequence:item.id,
      blockDragSequence:foundItem.id,
      blockChoosen:item.type ,
      blockText:foundItem.interaction ,
      blockAssetId:null ,
      blockSkillTag:foundItem.SkillTag??null ,
      blockTitleTag:foundItem.quesionTitle ,
      blockRoll:foundItem.blockRoll,
      blockResponseRoll:foundItem.responseRoll,
      blockVoiceGender:null ,
      blockVoiceEmotions:foundItem.QuestionsVoice ??null ,
      blockCreatedDatetime: Date.now() ,
      blockVoiceAccents:null ,
      blockCharacterposesId:foundItem.QuestionsEmotion ,
      blockAnimationId:null ,
      blockDeleteStatus:'NO' ,
      blockActiveStatus:'Active',
      blockIpAddress:req.connection.remoteAddress,
      blockDeviceType:req.device.type ,
      blockUserAgent:req.headers["user-agent"] ,
    });
    if(result){
    
      const objectsWithId1_1 = alpArray.filter(obj => obj.seqs === item.id);
 // sub question tabel
 const alpvalues = objectsWithId1_1.map((al) => al.secondaryId);
 
 const countaplNotIn = await lmsQuestionOptions.count({
  where: {
    qpQuestionId: result.blockId,
    qpSecondaryId: {
      [Op.notIn]: alpvalues ,
    },
  },
});

    if (countaplNotIn > 0) {
    await lmsQuestionOptions.update(
      { qpDeleteStatus: 'YES' },
      {
        where: {
          qpQuestionId: result.blockId,
          qpSecondaryId:{ [Op.notIn]: alpvalues },
        },
      }
    );
    }
    
//
      for (const object of objectsWithId1_1) {
     const beforeKey=object.option
     const  key = beforeKey.replace(/'/g, '');
     try {
     setArray.push(key);
     // ansObject
     
     // optionsObject
     // feedbackObject
     // responseObject
     // optionTitleObject
     // optionsemotionObject
     // optionsvoiceObject
     // responseemotionObject
     // scoreObject
     // navigateObjects
     //navigateshowObjects
     const responseEmotion = foundItem?.responseemotionObject?.[key] ?? '';
     const NextOption = foundItem?.navigateObjects?.[key] ?? '';
     const NavigateShow = foundItem?.navigateshowObjects?.[key] ?? '';
     const Emotion = foundItem?.optionsemotionObject?.[key] ?? '';
     const Voice = foundItem?.optionsvoiceObject?.[key] ?? '';
     const TitleTag = foundItem?.optionTitleObject?.[key] ?? '';
     const Score = foundItem?.scoreObject?.[key] === '' || isNaN(foundItem?.scoreObject?.[key]) ? null : Number(foundItem?.scoreObject?.[key]);
     const Feedback =foundItem?.feedbackObject?.[key] ?? '';
     const Response =foundItem?.responseObject?.[key] ?? '';
     const OptionText=foundItem?.optionsObject?.[key] ?? '';
      
     const OptionExitist = await lmsQuestionOptions.findOne({
       where: { qpQuestionId: result.blockId ,qpBlockSecondaryId: item.input , qpSecondaryId: object.secondaryId },
     });

     let options='';
     if(OptionExitist){
      setArray.push('OptionExitist');
        options = await lmsQuestionOptions.update({
          qpGameId:id,
         qpQuestionId: result.blockId ,
         qpSecondaryId: object.secondaryId,
         qpOptions: key,
         qpSequence: object.seqs,
         qpOptionText:OptionText,
         qpResponse: Response,
         qpTag: foundItem?.ansObject[key]=='true'? 'true' : 'false',
         qpFeedback: Feedback, // Corrected line
         qpSkillTag: null,
         qpScore: Score,
         qpTitleTag: TitleTag,
         qpEmotion: Emotion,
         qpVoice: Voice,
         qpResponseEmotion: responseEmotion,
         qpBlockSecondaryId:item.input,
         qpNextOption: NextOption,
         qpNavigateShow: NavigateShow,
         qpCreatedDatetime: Date.now(),
         qpEditedDatetime: Date.now(),
         qpDeleteStatus: 'NO',
         qpActiveStatus: 'Yes',
         qpIpAddress: req.connection.remoteAddress,
         qpUserAgent: req.headers["user-agent"],
         qpDeviceType: req.device.type,
         },
         {
           where: {
             qpQuestionId: result.blockId, qpSecondaryId: object.secondaryId
           },
         }
       );
     }else{
      setArray.push('create');
        options = await lmsQuestionOptions.create({
          qpGameId:id,
         qpQuestionId: result.blockId ,
         qpSecondaryId: object.secondaryId,
         qpOptions: key,
         qpSequence: object.seqs,
         qpOptionText:OptionText,
         qpResponse: Response,
         qpTag: foundItem?.ansObject[key]==true||foundItem?.ansObject[key]=='true'? 'true' : 'false',
         qpFeedback: Feedback, // Corrected line
         qpSkillTag: null,
         qpScore: Score,
         qpTitleTag: TitleTag,
         qpEmotion: Emotion,
         qpVoice: Voice,
         qpResponseEmotion: responseEmotion,
         qpBlockSecondaryId:item.input,
         qpNextOption: NextOption,
         qpNavigateShow: NavigateShow,
         qpCreatedDatetime: Date.now(),
         qpEditedDatetime: Date.now(),
         qpDeleteStatus: 'NO',
         qpActiveStatus: 'Yes',
         qpIpAddress: req.connection.remoteAddress,
         qpUserAgent: req.headers["user-agent"],
         qpDeviceType: req.device.type,
       });
     }

     } catch (error) {
       // Handle the error within the loop
       console.error('Error within loop:', error.message);
     
       // Return an appropriate response or handle the error as needed
       return res.status(500).json({ status: 'Failure', error: error.message });
     }
     
      }

      setArray.push('result');

    }

  }
 }
      } 
      
      
      else {
      
        setArray.push(null);
      }

      
    }

    return res.status(200).json({ status: 'Success', setArray });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 'Failure', error: error.message });
  }
};
const GetStroy = async (req, res) => {
  try {
    let  id = req.params.id;
    let questNos =req.body.quest
    
  let  stroy = await LmsBlocks.findAndCountAll({
    where: { blockGameId: id ,
      blockDeleteStatus: 'NO',
      blockQuestNo:questNos},
     
    order: [['blockPrimarySequence', 'ASC']] // Use 'DESC' for descending order
  });
  let  resultObject = {};
  let  itemObject = {};
  let  alpabetObject = {};
  let optionsObject={};
     let ansObject={};
     let feedbackObject={};
     let responseObject={};
     let optionTitleObject={};
     let optionsemotionObject={};
     let optionsvoiceObject={};
     let responseemotionObject={};
     let scoreObject={};
     let navigateObjects={};
     let navigateshowObjects={};
     let interactionBlockObject={};
     let maxInput = -Infinity;
     const alpabetObjectsArray = [];
let lastItem;

const alpacount = await lmsQuestionOptions.findOne({
  attributes: ['qpSecondaryId'],
  where: { qpGameId: id },
  order: [['qpOptionId', 'DESC']],
  limit: 1,
});
let j=0;
let idCounter = 1;
let upNextCounter = 2;
for (let  [index, result] of stroy.rows.entries()) {
          
    // Assuming blockSecondaryId is the property you want to use as the key
    let  key = result.blockChoosen+result.blockSecondaryId;
    let currentVersion = result.blockPrimarySequence;

    let major = currentVersion.split('.');
    // Construct the value object with the desired properties
    if(result.blockChoosen==='Note'){
      let value = {
        id: result.blockDragSequence,
        // Add other properties as needed
        note: result.blockText,
        status: 'yes',
        Notenavigate: result.blockLeadTo,
        NoteleadShow:result.blockShowNavigate,
        // Add other properties as needed
      };
      resultObject[key] = value;
    }
   if(result.blockChoosen==='Dialog'){
    let value = {
      id: result.blockDragSequence,
      dialog: result.blockText,
      character: result.blockRoll,
      animation: result.blockCharacterposesId,
      voice: result.blockVoiceEmotions,
      DialogleadShow: result.blockShowNavigate,
      Dialognavigate: result.blockLeadTo,
    };
    
   
    
  
  resultObject[key] = value;
}

if (result.blockChoosen === 'Interaction') {
  
  try{
    const Question = await lmsQuestionOptions.findAll({
    where: { qpQuestionId: result.blockId,
      qpDeleteStatus: 'NO'},
    order: [['qpSecondaryId', 'ASC']]
  });
  //  return res.status(500).json({ status: 'Failure' ,error:Question ,er:result.blockId});
  console.log('Question',Question );
  // return res.status(500).json({ status: 'Failure' ,error:result.blockId });
  for (let  [i, rows] of Question.entries()) {
    // Use for...of loop or Promise.all to handle async/await correctly
    let value = {
      seqs: major[0]+'.'+idCounter,
      option: rows.qpOptions,
      secondaryId: rows.qpSecondaryId,
    };
  console.log('values',value)
    optionsObject[rows.qpOptions]=rows.qpOptionText ? rows.qpOptionText:'';
    ansObject[rows.qpOptions]=rows.qpTag ? rows.qpTag:'';

    feedbackObject[rows.qpOptions]=rows.qpFeedback ? rows.qpFeedback:'';

    responseObject[rows.qpOptions]=rows.qpResponse ? rows.qpResponse:'';

    optionTitleObject[rows.qpOptions]=rows.qpTitleTag ? rows.qpTitleTag:'';

    optionsemotionObject[rows.qpOptions]=rows.qpEmotion ? rows.qpEmotion:'';
    optionsvoiceObject[rows.qpOptions]=rows.qpVoice ? rows.qpVoice:'';
    responseemotionObject[rows.qpOptions]=rows.qpResponseEmotion ? rows.qpResponseEmotion:'';
    scoreObject[rows.qpOptions]=rows.qpScore ? rows.qpScore:'';
    navigateObjects[rows.qpOptions]=rows.qpNextOption ? rows.qpNextOption:'';
    navigateshowObjects[rows.qpOptions]=rows.qpNavigateShow ? rows.qpNavigateShow:'';
    
    alpabetObjectsArray.push(value);
    console.log('After push:', alpabetObjectsArray);
    if(rows.qpResponse){
      interactionBlockObject[`Resp${result.blockSecondaryId}`]=result.blockSecondaryId;
    }
    if(rows.qpFeedback){
      interactionBlockObject[`Feedbk${result.blockSecondaryId}`]=result.blockSecondaryId;
    }
    if(rows.qpTitleTag||result.blockTitleTag){
      interactionBlockObject[`Title${result.blockSecondaryId}`]=result.blockSecondaryId;
    }
  if(result.blockSkillTag){
    interactionBlockObject[`Skills${result.blockSecondaryId}`]=result.blockSecondaryId;
   
  }
  }
  console.log('Final array:', alpabetObjectsArray);
 

  let value = {
    QuestionsEmotion: result.blockCharacterposesId,
    QuestionsVoice:result.blockVoiceEmotions,
    ansObject:ansObject  ,
    blockRoll:result.blockRoll  ,
    feedbackObject:feedbackObject  ,
    interaction:result.blockText  ,
    navigateObjects:navigateObjects  ,
    navigateshowObjects:navigateshowObjects  ,
    optionTitleObject:optionTitleObject  ,
    optionsObject:optionsObject  ,
    optionsemotionObject: optionsemotionObject ,
    optionsvoiceObject: optionsvoiceObject ,
    quesionTitle:result.blockTitleTag  ,
    responseObject:responseObject  ,
    responseemotionObject:responseemotionObject  ,
    scoreObject:scoreObject  ,
    responseRoll:result.blockResponseRoll,
    SkillTag:result.blockSkillTag ,
    status:'yes',
  };
  resultObject[key] = value;
  }catch(error){
    return res.status(500).json({ status: 'Failure' ,error:error.message });
  }
 
}




let  items = {
  id: major[0]+'.'+idCounter,
  type: result.blockChoosen,
  upNext: major[0]+'.'+upNextCounter,
  input: result.blockSecondaryId,
  questNo:result.blockQuestNo
};
idCounter += 1;
upNextCounter += 1;

for (let i = 0; i < alpabetObjectsArray.length; i++) {
  // Get the current row from the array
  const rows = alpabetObjectsArray[i];
 
  // Create a new value object
  let value = {
    seqs: rows.seqs,
    option: rows.option,
    secondaryId: rows.secondaryId,
  };

  // Set the value in the alphabetObject using the current key
  alpabetObject[i] = value;

  // Update key for the next iteration if needed
  

  // You can also console.log the created object if needed
  // console.log(alphabetObject);
}

itemObject[index++] = items;
    // Assign the value object to the key in the resultObject
    lastItem = items.upNext;
    maxInput = Math.max(maxInput, items.input);
    
  }
  const versionCompare = (a, b) => {
    const versionA = a.split('.').map(Number);
    const versionB = b.split('.').map(Number);

    if (versionA[0] !== versionB[0]) {
        return versionA[0] - versionB[0];
    } else {
        return versionA[1] - versionB[1];
    }
};

// Sorting the object keys based on the version of "id"
const sortedKeys = Object.keys(itemObject).sort((a, b) => versionCompare(itemObject[a].id, itemObject[b].id));

// Creating a new object with sorted keys
const sortedItems = {};
sortedKeys.forEach(key => {
    sortedItems[key] = itemObject[key];
});

 


  
  // return res.status(500).json({ status: 'Failure' ,error:itemObject });
  if (lastItem) {
    let parts = lastItem.split('.');
    let  minorVersion = parts[1] ? parseInt(parts[1], 10) : 0;

    return res.status(200).json({
      status: 'Success',
      items: itemObject,
      input: resultObject,
      alp:alpabetObject,
      intra:interactionBlockObject,
      count: minorVersion,
      maxInput:maxInput,
      serias:parts[0],
      alpacount: alpacount?.qpSecondaryId??null,
      sortedItems:sortedItems
    });
  } else {

    
    return res.status(200).json({
      status: 'Success',
      items: itemObject,
      input: resultObject,
      alp:alpabetObject,
      intra:interactionBlockObject,
      count: 1,
      maxInput:maxInput,
      serias:questNos,
      alpacount: alpacount?.qpSecondaryId??null

     
    });
  }
} catch (error) {
  return res.status(500).json({ status: 'Failure' ,error:error.message });
}
};

const ListStroy = async (req, res) => {
  try {
    let  id = req.params.id;
    let BlockObject={};
    let gameList=[];
    let gameIn=[];
    const getGameExtensionId = await LmsGame.findOne({
      attributes: ['gameExtensionId'],
      where: { 
        gameId:id,
      gameDeleteStatus:'No'},
      order: [['gameId', 'ASC']]
    });

if(getGameExtensionId.gameExtensionId){

  gameList = await LmsGame.findAll({
    attributes: ['gameId','gameQuestNo','gameExtensionId'],
    where: { 
      gameExtensionId:getGameExtensionId.gameExtensionId,
    gameDeleteStatus:'No'},
    order: [['gameId', 'ASC']]
  });
 
gameIn = gameList.map((al) => al.gameId);
const getBlocks = await LmsBlocks.findAll({
where: {
 
  blockGameId: {
    [Op.in]: gameIn ,
  },
  blockDeleteStatus:'NO',
},
});

 if(getBlocks){

 
for (let  [i, rows] of getBlocks.entries()) {

let value = {
  id: rows.blockPrimarySequence,
  // Add other properties as needed
  type: rows.blockChoosen,
  input: rows.blockSecondaryId,
  gameId:rows.blockGameId,
  questNo:rows.blockQuestNo
  // Add other properties as needed
};
BlockObject[i]=value
}
}

}
     

return res.status(200).json({
  status: 'Success',
  BlockObject: BlockObject, 
  gameIn:gameList,
});

    
  } catch (error) {
    return res.status(500).json({ status: 'Failure' ,error:error.message });
  }
  };
  const viewHistroyMaintance = async (req, res) => {

    try {
      let  id = req.params.id;
      const LoginUserId = req.user.user.id;

      const checkviewer = await LmsGame.findOne({
        where: { 
          gameId: id,
          [Op.or]: [
            {
              gameCreatorUserId: LoginUserId
            },
            {
              gameAnotherCreatorId: LoginUserId
  
            },
  
          ],
        }
      });
      if(!checkviewer){
//         const repeatview = await gameHistory.findOne({
//           where: { 
//             gvgameId: id,
//             gvViewUserId:LoginUserId
//           }
//         });
// if(!repeatview){
  const result = await gameHistory.create({
    gvgameId:id ,
    gvViewUserId:LoginUserId,
    gvIpAddress:req.connection.remoteAddress,
    gvUserAgent:req.headers["user-agent"] ,
    gvDeviceType:req.device.type ,
    createdAt:Date.now() 
  });


// }


      }

      return res.status(200).json({
        status: 'Success',
      });

  
    }catch (error) {
      return res.status(500).json({ status: 'Failure' ,error:error.message });
    }

  
  }
  const exitTemplateOpen = async (req, res) => {

    try {

      const id = req?.params?.id;
      const integerValue = parseInt(1, 10);
  const getAllgame= await LmsGame.findAll({
    where:{
      gameExtensionId:id
    }
    ,
    order: [['gameId', 'ASC']],
  })
   
  
  let setExtenstion=[];
  const processedGames = await Promise.all(getAllgame.map(async (game, index) => {
    
    const gameToClone = await LmsGame.findByPk(game.gameId);
    let taketile= gameToClone?.gameTitle?.split('_');
    const currentDate = new Date();
  const formattedDate = `${currentDate.getDate()}-${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`;
  const formattedTime = `${currentDate.getHours()}.${currentDate.getMinutes()}.${currentDate.getSeconds()}`;
  
  // Create newTitle with current date and time
  let newTitle = `${taketile[0]}_copied(${formattedDate} ${formattedTime})`;
    const clonedGame = LmsGame.build({
      ...gameToClone.get(), // Using spread syntax to copy all fields
     gameId: null, // Set id to null to create a new record
        // Modify specific fields here
        gameLastTabArray:JSON.stringify([integerValue]),
        gameLastTab:2,
        gameGameStage: 'Creation',
        gameExtensionId:null,
        gameDuplicated:'NO',
        gameStageDate:Date.now(),
        gameCreatedDatetime:Date.now(),
        gameIpAddress: req.connection.remoteAddress,
        gameUserAgent: req.headers["user-agent"],
        gameCreatedUserId : req.user.user.id,
         gameCreatorUserId : req.user.user.id,
     
  
    });
    await clonedGame.save();
  
    if(clonedGame && index=== 0){
      
      
      setExtenstion.push(clonedGame.gameId);
    }
        //  return false;
     const gameup= await LmsGame.update(
        { gameExtensionId: setExtenstion[0] },
        {
          where: {
            gameId: clonedGame.gameId
          }
        }
      );
      console.log('setExtenstion',setExtenstion[0]);
  console.log('clonedGame.gameId',gameup,index);
    
    
    if (clonedGame) {
      const blocksToClone = await LmsBlocks.findAll({
        where: {
          blockGameId: id,
          blockQuestNo:clonedGame.gameQuestNo,// Replace 'yourValue' with the actual value you're searching for
        }
  
      });
     
      if (blocksToClone) {
        for (const block of blocksToClone) {
          // Perform your actions for each block here
          // For example, clone the block or perform any other operation
          const clonedBlock = await LmsBlocks.create({
            ...block.get(),
            blockId:null,
            blockGameId: setExtenstion[0],
           
          });
          await clonedBlock.save();
          if (clonedBlock) {
            const QuestionsOptionToClone = await lmsQuestionOptions.findAll({
              where: {
                qpQuestionId: block.blockId,
              }
            });
  
            if (QuestionsOptionToClone) {
              for (const option of QuestionsOptionToClone) {
                const clonedOption = await lmsQuestionOptions.create({
                  ...option.get(),
                  qpOptionId:null,
                  qpQuestionId: clonedBlock.blockId,
                  qpGameId:setExtenstion[0]
                });
                await clonedOption.save();
  
              }
            }
          }
  
        }
      } else {
        // const result = await LmsGame.destroy({
        //   where: {
        //     gameId: clonedGame.gameId,
        //   },
        // });
        // res.status(400).json({ message: 'Stroy Not In the Game .', data: clonedGame.gameId });
  
      }
      if(index===0){
        const relfectionToClone = await ReflectionQuestion.findAll({
          where: {
            refGameId: id // Replace 'yourValue' with the actual value you're searching for
          }
    
        });
        
        if (relfectionToClone) {
          for (const ref of relfectionToClone) {
    
            const clonedRelfection = await ReflectionQuestion.create({
              ...ref.get(),
              refId: null, // Set id to null to create a new record
              refGameId: setExtenstion[0]
            });
    
          }
        }
      }
     
  
  
  
     
    } else {
     
     return  res.status(400).json({ status: 'Failure', message: 'Game Not Duplicated .' });
    }
  
    
  }));
  
  if ( setExtenstion.length > 0) { // Check if setExtenstion is not empty
    const sendData = await LmsGame.findAll({
      where: {
        gameId: setExtenstion[0]
      }
    });
    return res.status(200).json({ status: 'Success', message: 'Game Duplicated successfully.', data: sendData });
  }
  return res.status(200).json({ status: 'Success', message: 'Game Duplicated successfully.', data: sendData });
  
    } catch(error) {
  
      res.status(500).json({ status: 'Failure', message: "Internal Server Error", err: error.message });
    }
  
  
  
  
  }

  const GetPreview = async (req, res) => {
    try {
      let id = req.params.id;
  
      let stroy = await LmsBlocks.findAndCountAll({
        where: { blockGameId: id, blockDeleteStatus: "NO" },
        order: [["blockPrimarySequence", "ASC"]], // Use 'DESC' for descending order
      });
      let resultObject = {};
      let itemObject = {};
      let alpabetObject = {};
      let optionsObject = {};
      let ansObject = {};
      let feedbackObject = {};
      let responseObject = {};
      let optionTitleObject = {};
      let optionsemotionObject = {};
      let optionsvoiceObject = {};
      let responseemotionObject = {};
      let scoreObject = {};
      let navigateObjects = {};
      let navigateshowObjects = {};
      let interactionBlockObject = {};
      let maxInput = -Infinity;
      const alpabetObjectsArray = [];
      let lastItem;
  
      const alpacount = await lmsQuestionOptions.findOne({
        attributes: ["qpSecondaryId"],
        where: { qpGameId: id },
        order: [["qpOptionId", "DESC"]],
        limit: 1,
      });
      let j = 0;
      let idCounter = 1;
      let upNextCounter = 2;
      for (let [index, result] of stroy.rows.entries()) {
       
        let key = result.blockChoosen + result.blockSecondaryId;
        let currentVersion = result.blockPrimarySequence;
  
        let major = currentVersion.split(".");
        // Construct the value object with the desired properties
        if (result.blockChoosen === "Note") {
          let value = {
            id: result.blockDragSequence,
            
            note: result.blockText,
            status: "yes",
            // Add other properties as needed
          };
          resultObject[key] = value;
        }
        if (result.blockChoosen === "Dialog") {
          let value = {
            id: result.blockDragSequence,
            dialog: result.blockText,
            character: result.blockRoll,
            animation: result.blockCharacterposesId,
            voice: result.blockVoiceEmotions,
            // Add other properties as needed
          };
          resultObject[key] = value;
        }
  
        if (result.blockChoosen === "Interaction") {
          try {
            const Question = await lmsQuestionOptions.findAll({
              where: { qpQuestionId: result.blockId, qpDeleteStatus: "NO" },
              order: [["qpSecondaryId", "ASC"]],
            });
            //  return res.status(500).json({ status: 'Failure' ,error:Question ,er:result.blockId});
            console.log("Question", Question);
            // return res.status(500).json({ status: 'Failure' ,error:result.blockId });
            for (let [i, rows] of Question.entries()) {
              // Use for...of loop or Promise.all to handle async/await correctly
              let value = {
                seqs: major[0] + "." + idCounter,
                option: rows.qpOptions,
                secondaryId: rows.qpSecondaryId,
              };
              optionsObject[rows.qpOptions] = rows.qpOptionText
                ? rows.qpOptionText
                : "";
              ansObject[rows.qpOptions] = rows.qpTag ? rows.qpTag : "";
              feedbackObject[rows.qpOptions] = rows.qpFeedback
                ? rows.qpFeedback
                : "";
              responseObject[rows.qpOptions] = rows.qpResponse
                ? rows.qpResponse
                : "";
              optionTitleObject[rows.qpOptions] = rows.qpTitleTag
                ? rows.qpTitleTag
                : "";
              optionsemotionObject[rows.qpOptions] = rows.qpEmotion
                ? rows.qpEmotion
                : "";
              optionsvoiceObject[rows.qpOptions] = rows.qpVoice
                ? rows.qpVoice
                : "";
              responseemotionObject[rows.qpOptions] = rows.qpResponseEmotion
                ? rows.qpResponseEmotion
                : "";
              scoreObject[rows.qpOptions] = rows.qpScore ? rows.qpScore : "";
              navigateObjects[rows.qpOptions] = rows.qpNextOption
                ? rows.qpNextOption
                : "";
              navigateshowObjects[rows.qpOptions] = rows.qpNavigateShow
                ? rows.qpNavigateShow
                : "";
  
              alpabetObjectsArray.push(value);
            }
            console.log("Final array:", alpabetObjectsArray);
            if (responseObject.length !== 0) {
              interactionBlockObject[`Resp${result.blockSecondaryId}`] =
                result.blockSecondaryId;
            }
            if (feedbackObject.length !== 0) {
              interactionBlockObject[`Feedbk${result.blockSecondaryId}`] =
                result.blockSecondaryId;
            }
            if (optionTitleObject.length !== 0) {
              interactionBlockObject[`Title${result.blockSecondaryId}`] =
                result.blockSecondaryId;
            }
            if (result.blockSkillTag) {
              interactionBlockObject[`Skills${result.blockSecondaryId}`] =
                result.blockSecondaryId;
            }
  
            let value = {
              QuestionsEmotion: result.blockCharacterposesId,
              QuestionsVoice: result.blockVoiceEmotions,
              ansObject: ansObject,
              blockRoll: result.blockRoll,
              feedbackObject: feedbackObject,
              interaction: result.blockText,
              navigateObjects: navigateObjects,
              navigateshowObjects: navigateshowObjects,
              optionTitleObject: optionTitleObject,
              optionsObject: optionsObject,
              optionsemotionObject: optionsemotionObject,
              optionsvoiceObject: optionsvoiceObject,
              quesionTitle: result.blockTitleTag,
              responseObject: responseObject,
              responseemotionObject: responseemotionObject,
              scoreObject: scoreObject,
              responseRoll: result.blockResponseRoll,
              SkillTag: result.blockSkillTag,
              status: "yes",
            };
            resultObject[key] = value;
          } catch (error) {
            return res
              .status(500)
              .json({ status: "Failure", error: error.message });
          }
        }
  
        let items = {
          id: major[0] + "." + idCounter,
          type: result.blockChoosen,
          upNext: major[0] + "." + upNextCounter,
          input: result.blockSecondaryId,
        };
        idCounter += 1;
        upNextCounter += 1;
  
        for (let i = 0; i < alpabetObjectsArray.length; i++) {
          // Get the current row from the array
          const rows = alpabetObjectsArray[i];
  
          // Create a new value object
          let value = {
            seqs: rows.seqs,
            option: rows.option,
            secondaryId: rows.secondaryId,
          };
  
          // Set the value in the alphabetObject using the current key
          alpabetObject[i] = value;
        }
  
        itemObject[index++] = items;
        // Assign the value object to the key in the resultObject
        lastItem = items.upNext;
        maxInput = Math.max(maxInput, items.input);
      }
      const versionCompare = (a, b) => {
        const versionA = a.split(".").map(Number);
        const versionB = b.split(".").map(Number);
  
        if (versionA[0] !== versionB[0]) {
          return versionA[0] - versionB[0];
        } else {
          return versionA[1] - versionB[1];
        }
      };
  
      // Sorting the object keys based on the version of "id"
      const sortedKeys = Object.keys(itemObject).sort((a, b) =>
        versionCompare(itemObject[a].id, itemObject[b].id)
      );
  
      // Creating a new object with sorted keys
      const sortedItems = {};
      sortedKeys.forEach((key) => {
        sortedItems[key] = itemObject[key];
      });
  
      // return res.status(500).json({ status: 'Failure' ,error:itemObject });
      if (lastItem) {
        let parts = lastItem.split(".");
        let minorVersion = parts[1] ? parseInt(parts[1], 10) : 0;
         const data = {
          items: itemObject,
          input: resultObject,
          alp: alpabetObject,
          intra: interactionBlockObject,
          count: minorVersion,
          maxInput: maxInput,
          serias: parts[0],
          alpacount: alpacount?.qpSecondaryId ?? null,
          sortedItems: sortedItems,
         };
        return res.status(200).json({
          status: "Success",
          message:'game stages found',
          data:data,
        });
      } else {
        const data ={
          items: itemObject,
          input: resultObject,
          alp: alpabetObject,
          intra: interactionBlockObject,
          count: 1,
          maxInput: maxInput,
          serias: 1,
          alpacount: alpacount?.qpSecondaryId ?? null,
        };
        return res.status(200).json({
          status: "Success",
          message:'game stages found',
          data:data,
        });
      }
    } catch (error) {
      return res.status(500).json({ status: "Failure", error: error.message });
    }
  }


  const sentFeedbackMail = async (req,res) =>{
    const Mails = req?.body?.data;
    try {
      if(!Mails || Mails.length < 0) return res.status(500).json({ status: "Failure", message:'mails not found',data:Mails }); 
      let errorMail = false;
      for(const mail of Mails)
      {
        const mailOptions ={
          from:'santhilamobiledev@gmail.com',
          to:mail,
          subject: 'Regarding For Your Work',
          text: 'Hi Indhu!',
          html: `<div><h1>Share a Review</h1><p>You can share a review for this game</p><a href='http://35.183.46.127:5555/admin/superadmin/game/creation/${req?.user?.user?.id}'/></div>`
        }
        transporter.sendMail(mailOptions, (error, info)=>{
          if (error) {
            errorMail = true;
           }                    
        });
      }
      if(errorMail)
      {
        return res
        .status(500)
        .json({ status: "Failure", error: "Internal Server Error", err: errorMail });
      }
      else{
        return res.status(200).json({
          status: "Success",
          message:'mail sent',
        });
      }
    } catch (error) {
      return res.status(500).json({ status: "Failure", error: error.message });
    }
  }
  const QuestDeletion = async (req,res) =>{


    try{
      const data = req?.body;
      console.log(data);
      const id = req?.params?.id;
  
      BlcokList = await LmsBlocks.findAll({
        attributes: ['blockId'],
        where: { 
          blockGameId:data.exid,
          blockQuestNo:data.quest},
        order: [['blockId', 'ASC']]
      });
     
    blockIn = BlcokList.map((al) => al.blockId);
  
  
  
  
    const DeleteGame = await LmsGame.update(
      {
        gameDeleteStatus: 'YES',
      },
      {
        where: {
          gameId: id
        },
      }
    );
  
  const DeleteBlock = await LmsBlocks.update(
      {
        blockDeleteStatus: 'YES',
      },
      {
        where: {
          blockGameId:data.exid,
          blockQuestNo:data.quest
        },
      }
    );
  
    const questiondat = await lmsQuestionOptions.update(
      {
        qpDeleteStatus: 'YES',
      },
      {
        where: {
          qpOptionId: {
            [Op.in]: blockIn,
          },
        },
      }
    );
 
    return res.status(200).json({
      status: "Success",
      message:'Quest Deleted',
    });

    }
    catch (error) {
      return res.status(500).json({ status: "Failure", error: error.message });
    }

  

  
  }
module.exports = {uploadIntroMusic,uploadBadge, getGame, GetPreview,addGame, updateGame, getGameById, getBlocks, countByStage, gameDuplicate, gameLaunch, gameAssign, gamePublic, gameDelete, gameLearnersList, textToSpeech,getDefaultCat,getDefaultSkill, getCreatorBlocks, getBadge, getAudio, gameQuestionDuplicateEntire,StroyInserting,GetStroy,ListStroy,getGameTemplate,viewHistroyMaintance,exitTemplateOpen,sentFeedbackMail,QuestDeletion};
