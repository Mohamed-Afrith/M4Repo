const { generateToken } = require("../../lib/authentication/auth");
const { Sequelize, Op, where } = require('sequelize');
const transporter = require("../../lib/mails/mailService");
const { adminRegisterSchema, adminLoginSchema } = require("../../lib/validation/admin.validation");
const Learnerprofile =require("../../models/learner")
const GameTable =require("../../models/game");
const BlockTable=require("../../models/blocks");
const QuestionTable=require("../../models/questionOptions");
const AssetTable=require("../../models/gameAsset");
const SkillTable =require('../../models/skills');
const ReflectionTable=require('../../models/reflectionQuestions');
const Learner =require('../../models/learner');
const bcrypt = require('bcrypt');

const sequelize = require("../../lib/config/database");




const getAssignedGames = async (req, res) => {
    try {
      const id = req?.params?.id;
      if(!id) return res.status(404).json({ status:'Failure', message: "Id Need" });
      
      // if (count === 0) {
      //   return res.status(404).json({ status:'Failure', message: "No records found" });
      // }
      const query = `
      SELECT lgs.gaId, lgs.gaLearnerId,lgs.gaGameId, lgs.gaNickName, lgs.gaCancelledReason, lgs.gaGameState, lgs.gaDeleteStatus, lg.gameId, lg.gameCategoryId, lg.gameBackgroundId, lg.gameNonPlayingCharacterId, lg.gameCharacterName, lg.gameTitle, lg.gameStoryline, lg.gameSkills, lg.gameAuthorName, lg.gameMinScore, lg.gameMaxScore, lg.gameTotalScore, lg.gameDeleteStatus, lc.ctId, lc.ctName, lgast.gasAssetImage FROM lmsgamesassigned as lgs INNER JOIN lmsgame as lg ON lgs.gaGameId = lg.gameId INNER JOIN  lmscreator lc ON lc.ctId = lgs.gaCreatedUserId INNER JOIN lmsgameassets lgast ON lgast.gasId = lg.gameBackgroundId WHERE lgs.gaLearnerId = ${id} AND lgs.gaDeleteStatus <> 'yes' OR lgs.gaDeleteStatus = NULL  AND lg.gameDeleteStatus <> 'yes' OR lg.gameDeleteStatus = NULL AND lc.ctDeleteStatus <> 'yes' OR lc.ctDeleteStatus = NULL;
  `;
      
      const allData = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });

      // console.log('allData',req)
      
      const count = allData.length;
      console.log('query', query);
      return res.status(200).json({
        status: 'Success',
        message: "All Data Retrieved Successfully",
        data: allData,
        count: count
      });
      
      
          
        
        } catch (error) {
          res.status(500).json({status:'Failure', message: "Internal Server Error", err: error.message });
        }
  
  }
  const getGamePlay = async (req, res) => {
    try {
      const id = req?.params?.id;
/*************************QuestList****************************************************** */
      const getQuestList = await GameTable.findAll({
        attributes: ['gameQuestNo'],
        where: {
          gameExtensionId: id,
          gameDeleteStatus:'No'
        },
          order: [['gameId', 'ASC']]
      });
      const questNumbersArray = getQuestList.map((game) => game.gameQuestNo);
/*****************************StartScreen*********************************************************** */
const getGameDetails = await GameTable.findOne({
  
  where: {
    gameExtensionId: id,
    gameDeleteStatus: 'No'
  },
  order: [['gameId', 'ASC']]
});

const startScreenObject = {
  gameTitle: getGameDetails.gameTitle ?  getGameDetails.gameTitle : null
};

/************************************Welcome Screen ********************************************************************* */
const SkillId = getGameDetails.gameSkills.split(',').map(Number);

SkillNames = await SkillTable.findAll({
  attributes: ['crSkillName'],
  where: {
    crSkillId: {
      [Op.in]: SkillId,
    },
  },
});
const SkillArray = SkillNames.map((skill) => skill.crSkillName);
const welcomeScreenObject = {
  gameSkills:SkillArray ??null,
  gameStoryLine:getGameDetails.gameStoryLine??null,
  gameLearningOutcome:getGameDetails.gameLearningOutcome??null,
  gameDuration:getGameDetails.gameDuration??null,
  gameAuthorName:getGameDetails.gameAuthorName??null,
  gameIsShowAdditionalWelcomeNote:getGameDetails.gameIsShowAdditionalWelcomeNote??null,
  gameAdditionalWelcomeNote:getGameDetails.gameAdditionalWelcomeNote??null,
};
/****************************************Screens****************************************************************** */

/********Leaderboard***************** */
const LeaderBoardObject = {
  
  gameIsShowLeaderboard:getGameDetails.gameIsShowLeaderboard??null,
  
};
/*************Reflection******************** */

ReflectionQuestion = await ReflectionTable.findAll({
  attributes: ['refQuestion'],
  where: {
    refGameId:id,
    refDeleteStatus:'NO'
  },
});
let ReflectionQuestionArray
if(ReflectionQuestion){
   ReflectionQuestionArray = ReflectionQuestion.map((ref) => ref.refQuestion);
 

}
const ReflectionObjet ={
  gameIsShowReflectionScreen:getGameDetails.gameIsShowReflectionScreen??null,
  gameReflectionQuestion:getGameDetails.gameReflectionQuestion??null,
  refQuestion:ReflectionQuestionArray??null,

}
/*************TakeWay******************** */
const TakeawaysObject ={
  gameIsShowTakeaway:getGameDetails.gameTakeawayScreenId??null,
  gameTakeawayContent:getGameDetails.gameTakeawayContent??null,
}
/*************ThankYou******************** */
const ThankYouObject ={
  gameThankYouMessage:getGameDetails.gameThankYouMessage??null,
  gameIsCollectLearnerFeedback:getGameDetails.gameIsCollectLearnerFeedback??null,
  gameContent:getGameDetails.gameContent ??null,
gameRelevance:getGameDetails.gameRelevance ??null,
gameRecommendation:getGameDetails.gameRecommendation ??null,
gameBehaviour:getGameDetails.gameBehaviour ??null,
gameOthers:getGameDetails.gameOthers ??null,
gameRecommendation:getGameDetails.gameRecommendation ??null,
gameFeedBack:getGameDetails.gameFeedBack ??null,
gameFeedBackLink:getGameDetails.gameFeedBackLink ??null,

}
/*************Total Screen******************** */
const ScreenObject={}
ScreenObject["1"] = LeaderBoardObject;
ScreenObject["2"] = ReflectionObjet;
ScreenObject["3"] = TakeawaysObject;
ScreenObject["4"] = ThankYouObject;

/*****************************************Game play******************** **********************/



let stroy = await BlockTable.findAndCountAll({
  where: { 
    blockGameId: id,
    blockDeleteStatus: 'NO',
  },
  order: [['blockPrimarySequence', 'ASC'], ['blockQuestNo', 'ASC']]
});

let  resultObject = {};
let  itemObject = {};
let  alpabetObject = {};
let interactionBlockObject={};
 let maxInput = -Infinity;
 const alpabetObjectsArray = [];
 const pushoption = [];
let lastItem;

const alpacount = await QuestionTable.findOne({
attributes: ['qpSecondaryId'],
where: { qpGameId: id },
order: [['qpOptionId', 'DESC']],
limit: 1,
});

let j=0;
let idCounter = 1;
let upNextCounter = 2;
for (let  [index, result] of stroy.rows.entries()) {
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


const Question = await QuestionTable.findAll({
where: { qpQuestionId: result.blockId,
  qpDeleteStatus: 'NO'},
order: [['qpSecondaryId', 'ASC']],

});

console.log('Question',Question );
// return res.status(500).json({ status: 'Failure' ,error:result.blockId });
for (let  [i, rows] of Question.entries()) {
// Use for...of loop or Promise.all to handle async/await correctly
let value = {
  seqs: major[0]+'.'+idCounter,
  option: rows.qpOptions,
  secondaryId: rows.qpSecondaryId,
};
/*******************
 * optionsObject :{ a: test1 ,b: ,c: }
 * optionsObject :{ a: test2 ,b: ,c: }
 * 
 * 
 * 
 */

console.log('rows',rows );
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
console.log('Final array:', optionsemotionObject);

pushoption.push(optionsObject)
// return res.status(500).json({ status: 'Failure' ,error:scoreObject });

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

console.log('values',value)
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



itemObject[index++] = items;
// Assign the value object to the key in the resultObject
lastItem = items.upNext;
maxInput = Math.max(maxInput, items.input);

}


// return res.status(400).json({ status: 'Success' ,error:pushoption });

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





  // status: 'Success',
  // items: itemObject,
  // input: resultObject,
  // alp:alpabetObject,
  // intra:interactionBlockObject,



const gameplayObject={
  items:itemObject,
  input:resultObject,
  alp:alpabetObject,
  intra:interactionBlockObject,
};


/***************************Completion screen *********************************** */
const completionScreen = {
  gameTotalScore:getGameDetails.gameTotalScore ??null,
  
  gameIsSetMinimumScore:getGameDetails.gameIsSetMinimumScore??null,

  gameMinScore:getGameDetails.gameMinScore??null,
  
  gameaboveMinimumScoreCongratsMessage:getGameDetails.gameaboveMinimumScoreCongratsMessage??null,
  
  gameMaxScore:getGameDetails.gameMaxScore??null,
  
  gameBadge:getGameDetails.gameBadge??null,
  
  gameBadgeName:getGameDetails.gameBadgeName??null,
  
  gameIsSetCriteriaForBadge:getGameDetails.gameIsSetCriteriaForBadge??null,
  
  gameAwardBadgeScore:getGameDetails.gameAwardBadgeScore??null,
 
  gameScreenTitle:getGameDetails.gameScreenTitle??null,
  gameIsSetCongratsSingleMessage:getGameDetails.gameIsSetCongratsSingleMessage??null,

  gameIsSetCongratsScoreWiseMessage:getGameDetails.gameIsSetCongratsScoreWiseMessage??null,

  gameCompletedCongratsMessage:getGameDetails.gameCompletedCongratsMessage??null,

  gameMinimumScoreCongratsMessage:getGameDetails.gameMinimumScoreCongratsMessage??null,

  gameLessthanDistinctionScoreCongratsMessage:getGameDetails.gameLessthanDistinctionScoreCongratsMessage??null,

  gameAboveDistinctionScoreCongratsMessage:getGameDetails.gameAboveDistinctionScoreCongratsMessage??null,

};

/***********Leaner Profile************************ */
const LoginUserId =req.user.user.id;
const  getlen =await Learner.findOne({
  where: { 
    lenId : LoginUserId},
 
  
  });

  const learnerProfile = {
    lenUserName:getlen.lenUserName??null,
    lenRegion:getlen.lenRegion??null,
    lenNickName:getlen.lenNickName??null,
    lenMail:getlen.lenMail??null,
    lenDepartment:getlen.lenDepartment??null,
    lenAge:getlen.lenAge??null,
    lenGender:getlen.lenGender??null,
    lenCountryId:getlen.lenCountryId??null,
    lenCompanyId:getlen.lenCompanyId??null,
  };


/*********************************************************************************************** */
      return res.status(200).json({
        status: 'Success',
        QuestList: questNumbersArray,
        StartScreen:startScreenObject,
        WelcomeScreen:welcomeScreenObject,
        gameplay:gameplayObject,
      	screens :ScreenObject,
        completionScreen:completionScreen,
        learnerProfile:learnerProfile,
      });


    }
    catch (error) {
      res.status(500).json({status:'Failure', message: "Internal Server Error", err: error.message });
    }
  }


module.exports = { getAssignedGames,getGamePlay}