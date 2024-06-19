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
const cmpanyDetails = require('../../models/companies');
const AssignedGames = require('../../models/gameassinged');
const LearnerList = require('../../models/learner');
const GameActivityLog = require('../../models/gameActivityLog');
const Animation = require('../../models/animation')
const gameassest = require("../../models/gameAsset")
const bcrypt = require('bcrypt');

//Afrith-modified-starts-25/Mar/24-just import
const lmsGameChoosenLang = require("../../models/gamechoosenlang");
const LmsMultiLanguages = require("../../models/languages");
//Afrith-modified-ends-25/Mar/24-just import

const path = require('path');
const fs = require('fs');



const sequelize = require("../../lib/config/database");
const { gameAssign } = require("../../controllers/game/game.controller");

// Add By Lokie 
const lmsGameContentLang = require("../../models/gamecontentlang");

const FeedbackScreen = require("../../models/feedbackScreen");
const LmsGameAssets = require("../../models/gameAsset");
const LmsGame = require("../../models/game");




const getAssignedGames = async (req, res) => {
  try {
    const id = req?.params?.id;
    if (!id) return res.status(404).json({ status: 'Failure', message: "Id Need" });


    // const getgamelist await AssignedGames
    // if (count === 0) {
    //   return res.status(404).json({ status:'Failure', message: "No records found" });
    // }
    const LoginUserId = req.user.user.id;

    const getgamelist = await AssignedGames.findAll({
      attributes: ['gaGameId'],
      where: {
        gaLearnerId: LoginUserId,
        gaDeleteStatus: 'No'
      },
      order: [['gaGameId', 'ASC']]
    });
    leangames = getgamelist.map((al) => al.gaGameId);
    const gameData = await GameTable.findAll({
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
        gameId: {
          [Op.in]: leangames,
        },

      },
    });



    if (gameData) {

      return res.status(200).json({
        status: 'Success',
        message: "All Data Retrieved Successfully",
        data: gameData,

      });
    }
    else {
      return res.status(400).json({
        status: 'Failure',
        message: "No Games Assinged",


      });

    }




  } catch (error) {
    res.status(500).json({ status: 'Failure', message: "Internal Server Error", err: error.message });
  }

}


const getGamePlay = async (req, res) => {
  // return res.status(200).json({ data: req})
  const LoginUserId = req.user.user.id;
  // Add By Lokie


  try {
    const translationId = req?.params?.selectLanguageId;
    const id = req?.params?.id;

    console.log('idGP--',id)

    //Nivetha-Modified-Code - 18/04/24-starts
    // Check if a game is assigned to the user
    const getAssignedGames = await AssignedGames.findAll({
      attributes: ['gaGameId'],
      where: {
        gaLearnerId: LoginUserId,
        gaGameId: id // Assuming 'id' is the ID of the game you want to check
      }
    });
    //Nivetha-Modified-Code - 18/04/24-ends


    // If the specified game is assigned to the user
    //Nivetha-Modified-Code - 18/04/24-starts - if & else conditions
    if (getAssignedGames.length > 0) {

      console.log("The specified game is assigned to the user.");

      //Afrith-modified-starts-23/Apr/24-getting gameScreenTitle,gameCompletedCongratsMessage
      /*************************QuestList****************************************************** */
      const getQuestList = await GameTable.findAll({
        attributes: ['gameQuestNo', 'gameTotalScore', 'gameTitle', 'gameScreenTitle', 'gameCompletedCongratsMessage', 'gameBadge', 'gameBadgeName'],
        where: {
          gameExtensionId: id,
          gameDeleteStatus: 'No'
        },
        order: [['gameId', 'ASC']]
      });
      console.log('getQuestListkkkkk', getQuestList)
      const questNumbersArray = getQuestList.map((game) => game.gameQuestNo);




      // Lokie Work Here
      if (translationId != 1) {


        await Promise.all(
          getQuestList.map(async (game) => {
            const GetgameScreenTitle = await getOtherLanguage(id, translationId, game.gameQuestNo, 'gameScreenTitle');
            game.gameScreenTitle = GetgameScreenTitle;

            const GetgameCompletedCongratsMessage = await getOtherLanguage(id, translationId, game.gameQuestNo, 'gameCompletedCongratsMessage');
            game.gameCompletedCongratsMessage = GetgameCompletedCongratsMessage;

          })
        );
      }
      console.log('QuestNumArr--', questNumbersArray)
      //Afrith-modified-starts-23/Apr/24
      /****************************Activity Log*********************************************************************/
      const getplayStatus = await GameActivityLog.findAll({
        attributes: [
          'galGameId',
          'galQuestNo',


          [
            Sequelize.literal('(SELECT MAX(galId) FROM lmsgameactivitylog WHERE galGameId = ' + id + ' AND lmsgameactivitylog.galQuestNo = lmsgameactivitylog.galQuestNo)'),
            'lastValue'
          ],
          [
            Sequelize.literal('(SELECT galQuestionState FROM lmsgameactivitylog WHERE galGameId = ' + id + ' AND lmsgameactivitylog.galQuestNo = lmsgameactivitylog.galQuestNo and galId=lastValue)'),
            'galQuestionState'
          ],
          [
            Sequelize.literal('(SELECT galAverageScore FROM lmsgameactivitylog WHERE galGameId = ' + id + ' AND lmsgameactivitylog.galQuestNo = lmsgameactivitylog.galQuestNo and galId=lastValue)'),
            'galAverageScore'
          ],

          //Afrith-modified-starts-31/May/24-Fetching galHighestScore based on quest
          [
            Sequelize.literal(`(
              SELECT galHighestScore
              FROM lmsgameactivitylog AS log
              WHERE log.galId = MAX(lmsgameactivitylog.galId)
            )`),
            'galHighestScore'
          ]
          //Afrith-modified-starts-31/May/24-Fetching galHighestScore based on quest

        ],
        where: {
          galGameId: id
        },
        group: ['galQuestNo'],
        logging: console.log
      });




      /*****************************StartScreen*********************************************************** */
      const getGameDetails = await GameTable.findOne({

        where: {
          gameExtensionId: id,
          gameDeleteStatus: 'No'
        },
        order: [['gameId', 'ASC']]
      });

      const startScreenObject = {
        gameTitle: translationId != 1 ? await getOtherLanguage(id, translationId, id, 'gameNonPlayerName') : getGameDetails?.gameTitle
      };
      /*********************************Background vOICE************************************************************* */


      getImage = await AssetTable.findOne({
        attributes: [
          [Sequelize.literal(`CONCAT('${req.protocol}://${req.get('host')}/', gasAssetImage)`), 'gasAssetImage']
        ],
        where: {
          gasId: getGameDetails?.gameBackgroundId,
        },
      });


      getNpcImage = await gameassest.findOne({
        attributes: [
          [Sequelize.literal(`CONCAT('${req.protocol}://${req.get('host')}/', gasAssetImage)`), 'gasAssetImage']
        ],
        where: {
          gasId: getGameDetails.gameNonPlayingCharacterId,
        },
      });

      getMusic = await gameassest.findOne({
        attributes: [
          [Sequelize.literal(`CONCAT('${req.protocol}://${req.get('host')}/', gasAssetImage)`), 'gasAssetImage']
        ],
        where: {
          gasId: getGameDetails.gameIntroMusic,
        },
      });
      // console.log('Lokie bbb',getMusic);
      const BackgroundVoiceObject = {
        BackgroundImage: getImage.gasAssetImage ? getImage.gasAssetImage : null,
        NPCvoice: getGameDetails.gameNonPlayerVoice ? getGameDetails.gameNonPlayerVoice : null,
        NPCname: getGameDetails?.gameNonPlayerName ? getGameDetails?.gameNonPlayerName : null,

        // Lokie Work Here
        NPCname: translationId != 1 ? await getOtherLanguage(id, translationId, id, 'gameNonPlayerName') : getGameDetails.gameNonPlayerName,

        // NPCname: getGameDetails.gameNonPlayerName ? getGameDetails.gameNonPlayerVoice : null,
        PCMaleVoice: getGameDetails.gamePlayerMaleVoice ? getGameDetails.gamePlayerMaleVoice : null,
        PCFelmaeVoice: getGameDetails.gamePlayerFemaleVoice ? getGameDetails.gamePlayerFemaleVoice : null,
        Narrator: getGameDetails.gameNarratorVoice ? getGameDetails.gameNarratorVoice : null,
        NPC: getGameDetails.gameNonPlayingCharacterId ? getGameDetails.gameNonPlayingCharacterId : null,
        NPCImage: getNpcImage.gasAssetImage ? getNpcImage.gasAssetImage : null,

        // Lokie Work Here
        storyline: translationId != 1 ? await getOtherLanguage(id, translationId, id, 'gameStoryLine') : getGameDetails.gameStoryLine,
        // storyline:getGameDetails.gameStoryLine??null,
        test: getGameDetails.gameNonPlayingCharacterId,
        // IntroMusic:getMusic.gasAssetImage??null,
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
        gameSkills: SkillArray ?? null,
        gameStoryLine: translationId != 1 ? await getOtherLanguage(id, translationId, id, 'gameStoryLine') : getGameDetails.gameStoryLine,
        gameLearningOutcome: getGameDetails.gameLearningOutcome ?? null,
        gameDuration: getGameDetails.gameDuration ?? null,
        gameAuthorName: translationId != 1 ? await getOtherLanguage(id, translationId, id, 'gameAuthorName') : getGameDetails.gameAuthorName ?? null,
        gameIsShowAdditionalWelcomeNote: getGameDetails.gameIsShowAdditionalWelcomeNote ?? null,
        gameAdditionalWelcomeNote: translationId != 1 ? await getOtherLanguage(id, translationId, id, 'gameAdditionalWelcomeNote') : getGameDetails.gameAdditionalWelcomeNote ?? null,
      };
      /****************************************Screens****************************************************************** */

      /********Leaderboard***************** */
      const LeaderBoardObject = {

        gameIsShowLeaderboard: getGameDetails.gameIsShowLeaderboard ?? null,

      };
      /*************Reflection******************** */

      ReflectionQuestion = await ReflectionTable.findAll({
        attributes: ['refId', 'refQuestion'],
        where: {
          refGameId: id,
          refDeleteStatus: 'NO',
          translationId: translationId,
        },
      });
      let ReflectionQuestionArray
      if (ReflectionQuestion) {
        ReflectionQuestionArray = ReflectionQuestion.map((ref) => ref.refQuestion);


      }
      const ReflectionObjet = {
        gameIsShowReflectionScreen: getGameDetails.gameIsShowReflectionScreen ?? null,
        gameReflectionQuestion: getGameDetails.gameReflectionQuestion ?? null,
        // translationId!=1 ? await getOtherLanguage(id,translationId,id,'gameAdditionalWelcomeNote') :
        gameIsLearnerMandatoryQuestion: getGameDetails.gameIsLearnerMandatoryQuestion ?? null,
        refQuestion: ReflectionQuestion ?? null,

      }
      /*************TakeWay******************** */
      const TakeawaysObject = {
        //Afrith-modified-starts-29/Mar/24 - Correction -gameIsShowTakeaway
        // gameIsShowTakeaway: getGameDetails.gameTakeawayScreenId ?? null,
        gameIsShowTakeaway: getGameDetails.gameIsShowTakeaway ?? null,
        gameTakeawayContent: translationId != 1 ? await getOtherLanguage(id, translationId, id, 'gameTakeawayContent') : getGameDetails.gameTakeawayContent ?? null,
      }
      /*************ThankYou******************** */
      const ThankYouObject = {
        gameThankYouMessage: translationId != 1 ? await getOtherLanguage(id, translationId, id, 'gameThankYouMessage') : getGameDetails.gameThankYouMessage ?? null,
        gameIsCollectLearnerFeedback: getGameDetails.gameIsCollectLearnerFeedback ?? null,
        gameContent: getGameDetails.gameContent ?? null,
        gameRelevance: getGameDetails.gameRelevance ?? null,
        gameRecommendation: getGameDetails.gameRecommendation ?? null,
        gameBehaviour: getGameDetails.gameBehaviour ?? null,
        gameOthers: getGameDetails.gameOthers ?? null,
        gameRecommendation: getGameDetails.gameRecommendation ?? null,
        gameFeedBack: getGameDetails.gameFeedBack ?? null,
        gameFeedBackLink: getGameDetails.gameFeedBackLink ?? null,

      }
      /*************Total Screen******************** */
      const ScreenObject = {}
      ScreenObject["1"] = LeaderBoardObject;
      ScreenObject["2"] = ReflectionObjet;
      ScreenObject["3"] = TakeawaysObject;
      ScreenObject["4"] = ThankYouObject;

      /*****************************************Game play******************** **********************/




      let alpabetObject = {};
      let interactionBlockObject = {};
      let maxInput = -Infinity;
      const alpabetObjectsArray = [];
      const QuestObject = {};

      const interactionAllBlockObject = {};
      let itemObject = {};
      const pushoption = [];
      const testop = [];
      let lastItem;
      let sn = 0;
      getQuestList.map(async (game) => {
        let stroy = await BlockTable.findAndCountAll({
          where: {
            blockGameId: id,
            blockQuestNo: game.gameQuestNo,
            blockDeleteStatus: 'NO',
          },
          order: [['blockPrimarySequence', 'ASC'], ['blockQuestNo', 'ASC']],
          // logging: console.log // Log the generated SQL query
        });



        let resultObject = {};

        let j = 0;
        let idCounter = 1;
        let upNextCounter = 2;

        for (let [index, result] of stroy.rows.entries()) {
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

          // Assuming blockSecondaryId is the property you want to use as the key
          let key = result.blockChoosen + result.blockSecondaryId;
          let currentVersion = result.blockPrimarySequence;
          let major = currentVersion.split('.');

          console.log('resultZZ--',result)
          // Construct the value object with the desired properties
          if (result.blockChoosen === 'Note') {
            let value = {
              id: result.blockDragSequence,
              // Add other properties as needed
              note: translationId != 1 ? await getOtherLanguage(id, translationId, result.blockId, 'blockText') : result.blockText,
              status: 'yes',
              Notenavigate: result.blockLeadTo,
              NoteleadShow: result.blockShowNavigate,
              // Add other properties as needed
            };
            resultObject[key] = value;
            QuestObject[result.blockQuestNo] = resultObject
          }
          if (result.blockChoosen === 'Dialog') {
            let value = {
              id: result.blockDragSequence,
              dialog: translationId != 1 ? await getOtherLanguage(id, translationId, result.blockId, 'blockText') : result.blockText,
              character: result.blockRoll,
              animation: result.blockCharacterposesId,
              // voice: result.blockVoiceEmotions,
              voice: result.blockAudioUrl,
              DialogleadShow: result.blockShowNavigate,
              Dialognavigate: result.blockLeadTo,
            };




            resultObject[key] = value;
            QuestObject[result.blockQuestNo] = resultObject
          }


          if (result.blockChoosen === 'Interaction') {
            try {
              const Question = await QuestionTable.findAll({
                where: {
                  qpQuestionId: result.blockId,
                  qpDeleteStatus: 'NO',
                  qpQuestNo: game.gameQuestNo,
                },
                order: [['qpSecondaryId', 'ASC']],
              });

              console.log('Question', Question);

              const promises = [];
              const localInteractionBlockObject = {}; // Local scope for interactionBlockObject

              for (let [i, rows] of Question.entries()) {
                testop.push(rows.qpQuestNo);
                let value = {
                  seqs: major[0] + '.' + idCounter,
                  option: rows.qpOptions,
                  secondaryId: rows.qpSecondaryId,
                };
                alpabetObjectsArray.push(value);
                pushoption.push(alpabetObjectsArray);
                console.log('After push:', alpabetObjectsArray);

                promises.push((async (rows) => {
                  try {
                    console.log('Processing row:', rows);

                    if (rows.qpOptionText) {
                      getOtherLanguage(id, translationId, rows.qpOptionId, 'qpOptionText')
                      .then(qpOptionText => {
                        console.log('qpOptionText222:', typeof(qpOptionText));
                        console.log('ROWSqpOptionText222:', rows.qpOptionText);

                        // console.log('ID222:', id);
                        console.log('transalateID222:', typeof(translationId));
                        // console.log('qpOptID222:',  rows.qpOptionId);

                        optionsObject[rows.qpOptions] = translationId === '1' ? rows.qpOptionText : qpOptionText;
                        
                        // optionsObject[rows.qpOptions] = translationId !== 1 ? rows.qpOptionText : qpOptionText ;
                        // optionsObject[rows.qpOptions] = translationId !== 1 ? qpOptionText : rows.qpOptionText ?? '';

                        // Add any additional processing here
                    })
                    // optionsObject[rows.qpOptions] = rows.qpOptionText ? rows.qpOptionText : '';


                    } else {
                      optionsObject[rows.qpOptions] = '';

                    }

                    ansObject[rows.qpOptions] = rows.qpTag ? rows.qpTag : '';

                    if (rows.qpFeedback) {
                       getOtherLanguage(id, translationId, rows.qpOptionId, 'qpFeedback')
                       .then(qpFeedback => {
                        feedbackObject[rows.qpOptions] = translationId === '1' ? rows.qpFeedback : qpFeedback;
                        // feedbackObject[rows.qpOptions] = translationId !== 1 ? qpFeedback : rows.qpFeedback ?? '';
                        // Add any additional processing here
                    })

                    } else {
                      feedbackObject[rows.qpOptions] = '';
                    }

                    if (rows.qpResponse) {
                      getOtherLanguage(id, translationId, rows.qpOptionId, 'qpResponse')
                          .then(response => {
                              responseObject[rows.qpOptions] = translationId === '1' ? rows.qpResponse  : response;
                              // responseObject[rows.qpOptions] = translationId !== 1 ? response : rows.qpResponse ?? '';
                              // Add any additional processing here
                          })
                  } else {
                      responseObject[rows.qpOptions] = '';
                  }
                  


                    optionTitleObject[rows.qpOptions] = rows.qpTitleTag ? rows.qpTitleTag : '';
                    optionsemotionObject[rows.qpOptions] = rows.qpEmotion ? rows.qpEmotion : '';
                    optionsvoiceObject[rows.qpOptions] = rows.qpVoice ? rows.qpVoice : '';
                    responseemotionObject[rows.qpOptions] = rows.qpResponseEmotion ? rows.qpResponseEmotion : '';
                    scoreObject[rows.qpOptions] = rows.qpScore ? rows.qpScore : '';
                    navigateObjects[rows.qpOptions] = rows.qpNextOption ? rows.qpNextOption : '';
                    navigateshowObjects[rows.qpOptions] = rows.qpNavigateShow ? rows.qpNavigateShow : '';

                    if (rows.qpResponse) {
                      localInteractionBlockObject[`Resp${result.blockSecondaryId}`] = result.blockSecondaryId;
                    }
                    if (rows.qpFeedback) {
                      localInteractionBlockObject[`Feedbk${result.blockSecondaryId}`] = result.blockSecondaryId;
                    }
                    if (rows.qpTitleTag || result.blockTitleTag) {
                      localInteractionBlockObject[`Title${result.blockSecondaryId}`] = result.blockSecondaryId;
                    }
                    if (result.blockSkillTag) {
                      localInteractionBlockObject[`Skills${result.blockSecondaryId}`] = result.blockSecondaryId;
                    }
                    interactionAllBlockObject[result.blockQuestNo] = localInteractionBlockObject;

                  } catch (error) {
                    console.error('Error processing row:', error);
                  }
                })(rows));
              }
              testop.push(responseObject);
              await Promise.all(promises);
              console.log('All promises resolved');

              let value = {
                QuestionsEmotion: result.blockCharacterposesId,
                QuestionsVoice: result.blockVoiceEmotions,
                ansObject: ansObject,
                blockRoll: result.blockRoll,
                feedbackObject: feedbackObject,
                interaction: translationId != 1 ? await getOtherLanguage(id, translationId, result.blockId, 'blockText') : result.blockText,
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
                status: 'yes',
              };

              console.log('values', value)
              resultObject[key] = value;
              QuestObject[result.blockQuestNo] = resultObject;

            } catch (error) {
              return res.status(500).json({ status: 'Failure', error: error.message });
            }
          }


          let items = {
            id: major[0] + '.' + idCounter,
            type: result.blockChoosen,
            upNext: major[0] + '.' + upNextCounter,
            input: result.blockSecondaryId,
            questNo: result.blockQuestNo
          };
          itemObject[sn++] = items;

          idCounter += 1;
          upNextCounter += 1;




          console.log('itemObject', itemObject);


          // ItemAllObject[result.blockQuestNo]=itemObject;
          // Assign the value object to the key in the resultObject
          lastItem = items.upNext;
          maxInput = Math.max(maxInput, items.input);

        }

      });
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


      /*****************************************Blocks Details******************** **********************/

      const getBlocksDetails = await BlockTable.findOne({
        where: {
          blockId: id
        },
        order: [['blockId', 'ASC']]
      });

      console.log('@@@555', getBlocksDetails)

      const blocksObjects = {
        blocksDetails: getBlocksDetails ? getBlocksDetails : 'sorry no data'
      }



      // return res.status(500).json({ status: 'Failure' ,error:itemObject });





      // status: 'Success',
      // items: itemObject,
      // input: resultObject,
      // alp:alpabetObject,
      // intra:interactionBlockObject,



      const gameplayObject = {
        items: itemObject,
        input: QuestObject,
        alp: alpabetObjectsArray,
        intra: interactionAllBlockObject,
        
      };
      /***************************Completion screen *********************************** */
      //newly added start
      getbadgeImage = await AssetTable.findOne({
        attributes: [
          [Sequelize.literal(`CONCAT('${req.protocol}://${req.get('host')}/', gasAssetImage)`), 'gasAssetImage']
        ],
        where: {
          gasId: getGameDetails.gameBadge,
        },
      });
      //end

      /*Afrith-modified-starts-24/Apr/24-badgeImage based on Quest*/
      const badgeImages = await Promise.all(getQuestList.map(async (game) => {
        const getbadgeImage = await AssetTable.findOne({
          attributes: [
            [Sequelize.literal(`CONCAT('${req.protocol}://${req.get('host')}/', gasAssetImage)`), 'gasAssetImage']
          ],
          where: {
            gasId: game.gameBadge,
          },
        });
        return getbadgeImage;
      }));
      /*Afrith-modified-ends-24/Apr/24 -badgeImage based on Quest*/



      const completionScreen = {
        // gameTotalScore:getGameDetails.gameTotalScore ??null,

        // gameIsSetMinimumScore:getGameDetails.gameIsSetMinimumScore??null,

        // gameMinScore:getGameDetails.gameMinScore??null,

        // gameaboveMinimumScoreCongratsMessage:getGameDetails.gameaboveMinimumScoreCongratsMessage??null,

        // gameMaxScore:getGameDetails.gameMaxScore??null,

        // //Afrith-modified-starts-09/Apr/24
        // gameIsSetBadge:getGameDetails.gameIsSetBadge ??null,
        // //Afrith-modified-ends-09/Apr/24

        // gameBadge:getGameDetails.gameBadge??null,

        // gameBadgeName:getGameDetails.gameBadgeName??null,

        // gameIsSetCriteriaForBadge:getGameDetails.gameIsSetCriteriaForBadge??null,

        // gameAwardBadgeScore:getGameDetails.gameAwardBadgeScore??null,

        // gameScreenTitle:getGameDetails.gameScreenTitle??null,
        // gameIsSetCongratsSingleMessage:getGameDetails.gameIsSetCongratsSingleMessage??null,

        // gameIsSetCongratsScoreWiseMessage:getGameDetails.gameIsSetCongratsScoreWiseMessage??null,

        // gameCompletedCongratsMessage:getGameDetails.gameCompletedCongratsMessage??null,

        // gameMinimumScoreCongratsMessage:getGameDetails.gameMinimumScoreCongratsMessage??null,

        // gameLessthanDistinctionScoreCongratsMessage:getGameDetails.gameLessthanDistinctionScoreCongratsMessage??null,

        // gameAboveDistinctionScoreCongratsMessage:getGameDetails.gameAboveDistinctionScoreCongratsMessage??null,


        gameTotalScore: getGameDetails.gameTotalScore ?? null,

        gameIsSetMinimumScore: getGameDetails.gameIsSetMinimumScore ?? null,

        gameMinScore: getGameDetails.gameMinScore ?? null,

        gameaboveMinimumScoreCongratsMessage: getGameDetails.gameaboveMinimumScoreCongratsMessage ?? null,

        gameMaxScore: getGameDetails.gameMaxScore ?? null,

        gameBadge: getGameDetails.gameBadge ?? null,

        gameBadgeName: getGameDetails.gameBadgeName ?? null,
        // Newly Added start
        gameIsSetBadge: getGameDetails.gameIsSetBadge ?? null,
        // gameBadgeImg:getbadgeImage??null,

        gameBadgeImg: badgeImages, //Afrith-modified-24/Apr/24 - badgeImage based on Quest

        //end
        gameIsSetCriteriaForBadge: getGameDetails.gameIsSetCriteriaForBadge ?? null,

        gameAwardBadgeScore: getGameDetails.gameAwardBadgeScore ?? null,

        gameScreenTitle: translationId != 1 ? await getOtherLanguage(id, translationId, getGameDetails.gameQuestNo, 'gameScreenTitle') : getGameDetails.gameScreenTitle ?? null,
        gameIsSetCongratsSingleMessage: getGameDetails.gameIsSetCongratsSingleMessage ?? null,

        gameIsSetCongratsScoreWiseMessage: getGameDetails.gameIsSetCongratsScoreWiseMessage ?? null,

        gameCompletedCongratsMessage: translationId != 1 ? await getOtherLanguage(id, translationId, getGameDetails.gameQuestNo, 'gameCompletedCongratsMessage') : getGameDetails.gameCompletedCongratsMessage ?? null,

        gameMinimumScoreCongratsMessage: getGameDetails.gameMinimumScoreCongratsMessage ?? null,

        gameLessthanDistinctionScoreCongratsMessage: getGameDetails.gameLessthanDistinctionScoreCongratsMessage ?? null,

        gameAboveDistinctionScoreCongratsMessage: getGameDetails.gameAboveDistinctionScoreCongratsMessage ?? null,

      };




      /***********Leaner Profile************************ */
      const LoginUserId = req.user.user.id;
      const getlen = await Learnerprofile.findOne({
        where: {
          lenId: LoginUserId
        },


      });

      const getOrgansation = await cmpanyDetails.findOne({

        where: {
          cpId: getlen.lenCompanyId,

        },
      });

      const learnerProfiles = {
        lenUserName: getlen.lenUserName ?? null,
        lenRegion: getlen.lenRegion ?? null,
        lenEducation: getlen.lenEducation ?? null,
        lenNickName: getlen.lenNickName ?? null,
        lenMail: getlen.lenMail ?? null,
        lenDepartment: getlen.lenDepartment ?? null,
        lenAge: getlen.lenAge ?? null,
        lenGender: getlen.lenGender ?? null,
        lenCountryId: getlen.lenCountryId ?? null,
        lenCompanyId: getOrgansation.cpCompanyName ?? null,
      };

      /***********************************Preferences******************************************* */
      const preferencesObject = {
        gameShuffle: getGameDetails.gameShuffle,
        gameIsShowInteractionFeedBack: getGameDetails.gameIsShowInteractionFeedBack,
        gameDisableOptionalReplays: getGameDetails.gameDisableOptionalReplays,
        gameTrackQuestionWiseAnswers: getGameDetails.gameTrackQuestionWiseAnswers,
      };




      /******************
      * gameShuffle
      * gameIsShowInteractionFeedBack
      * gameDisableOptionalReplays
      * gameTrackQuestionWiseAnswers
      * 
      * 
      * ***************************************************************************** */


      /*********************************************************************************************** */
      return res.status(200).json({
        status: 'Success',
        QuestList: questNumbersArray,
        BackgroundVoice: BackgroundVoiceObject,
        StartScreen: startScreenObject,
        WelcomeScreen: welcomeScreenObject,
        gameplay: gameplayObject,
        screens: ScreenObject,
        blocks: blocksObjects,
        completionScreen: completionScreen,
        learnerProfile: learnerProfiles,
        Playstatus: getplayStatus,
        questScore: getQuestList,
        preferences: preferencesObject,


      });

    } else {
      // If the specified game is not assigned to the user
      return res.status(403).json({
        status: 'Failure',
        message: "The specified game is not assigned to the user."
      });
    }


  }
  catch (error) {
    res.status(500).json({ status: 'Failure', message: "Internal Server Error", err: error.message });
  }
}
// Added By Lokie 23/05/2024
async function getOtherLanguage(gameId, translationId, textId, fieldName) {
  try {

    const condition = {
      where: {
        gameId: gameId,
        translationId: translationId,
        textId: textId,
        fieldName: `${fieldName}`
      },
    };

    lngdata = await lmsGameContentLang.findOne(condition);

    if (lngdata) {
      return lngdata?.content;
    } else {
      return '';
    }



  } catch (error) {
    console.error("Translation Error:", error);
    return "Error";
  }
}
//Modified By Lokie
const learnerUpdation = async (req, res) => {
  try {

    let data = req?.body
    console.log('dataLU--', req.user.user.id)
    if (!data) {
      return res.status(400).json({ status: 'Failure', message: "Data Not Recived", err: error.message });
    }
    const LoginUserId = req.user.user.id;

    const updatedRows = await Learnerprofile.update({
      lenUserName: data.lenUserName,
      lenRegion: data.lenRegion,
      lenEducation: data.lenEducation,
      lenNickName: data.lenNickName,
      lenDepartment: data.lenDepartment,
      lenAge: data.lenAge,
      ///Afrith-modified-satrts-26/Feb/24///
      lenGender: data.lenGender,
      lenCountryId: data.lenCountryId
      ///Afrith-modified-ends-26/Feb/24////

      // lenGender: getlen.lenGender, // Uncomment if needed
      // lenCountryId: getlen.lenCountryId, // Uncomment if needed
    }, {
      where: {
        lenId: LoginUserId,
      },
    });
    //Modified By Lokie
    if (updatedRows.length > 0) {
      console.log(`Update successful. ${updatedRows.length} row(s) updated.`);
      console.log(updatedRows); // This will show the actual updated rows
      return res.status(200).json({ status: 'Success', message: `Update successful. ${updatedRows.length} row(s) updated.` });
    } else {
      console.log(`No rows were updated.`);
      return res.status(400).json({ status: 'Failure', message: `No rows weree updated.`, Count: updatedRows.length });

    }

    // return res.status(400).json({ status: 'Failure', message: updateprofile });
  }

  catch (error) {
    res.status(500).json({ status: 'Failure', message: "Internal Server Error", err: error.message });
  }

}
const getleaderBoard = async (req, res) => {
  try {
    const { id } = req.params;

    leanList = await AssignedGames.findAll({
      attributes: ['gaLearnerId'],
      where: {
        gaGameId: id,
        gaDeleteStatus: 'No'
      },
      order: [['gaLearnerId', 'ASC']]
    });

    leanIn = leanList.map((al) => al.gaLearnerId);

    const result = await GameActivityLog.findAll({
      attributes: [
        'galLearnerId',
        [sequelize.fn('SUM', sequelize.col('galAverageScore')), 'totalAverageScore'],
        // 'galDailyScore',
      ],
      where: {
        galGameId: id,
        galLearnerId: {
          [Op.in]: leanIn,
        },

      },
      group: ['galLearnerId'],
      order: [[sequelize.fn('SUM', sequelize.col('galAverageScore')), 'DESC']], // or 'ASC' for ascending order
    });

    const learnerScores = await Promise.all(result.map(async (item) => {
      const leanList = await LearnerList.findOne({
        attributes: ['lenUserName'],
        where: {
          lenId: item.galLearnerId,
        },
      });

      return {
        learnerId: leanList ? leanList.lenUserName : null,
        totalAverageScore: item.dataValues.totalAverageScore,
        // dailyScore: item.dataValues.galDailyScore,
      };
    }));

    console.log('lenScore---', learnerScores);
    if (learnerScores) {
      return res.status(200).json({ status: 'Success', data: learnerScores });
    }
    else {
      return res.status(200).json({ status: 'Failure', Message: 'LeaderBoard is Empty' });
    }

  }

  catch (error) {
    res.status(500).json({ status: 'Failure', message: "Internal Server Error", err: error.message });
  }

}
// const learnerDasboard = async (req, res) => {
//   try {
//     const LoginUserId =req.user.user.id;
//     const dasboardData = await GameActivityLog.findAll({

//         where: {
//           galLearnerId :LoginUserId ,
//         },
//       });
//       if(dasboardData){
//         return res.status(200).json({ status: 'Success', data: dasboardData });
//       }
//       else{
//         return res.status(200).json({ status: 'Failure', Message: 'LeaderBoard is Empty' });
//       }

//   }
//   catch (error) {
//     res.status(500).json({ status: 'Failure', message: "Internal Server Error", err: error.message });
//   }

// }
const learnerDasboard = async (req, res) => {
  try {
    const LoginUserId = req.user.user.id;

    const getGameCount = await AssignedGames.findAll({
      attributes: ['gaGameId'],
      where: {
        gaLearnerId: LoginUserId,
        gaDeleteStatus: 'NO'
      },
      // order: [['gameId', 'ASC']],
    })
    gameCount = getGameCount.map((item) => item.gaGameId).length;

    // Assigned Game Id's
    const assignedGameId = getGameCount.map((item) => item.gaGameId);

    const GameDetails = await GameTable.findAll({
      attributes: ['gameTitle'],
      where: {
        gameId: assignedGameId
      },
    });
    gameName = GameDetails.map((item) => item.gameTitle);


    const getNoOfQuest = await GameActivityLog.findAll({
      attributes: ['galQuestNo'],
      where: {
        galGameId: assignedGameId,
      },
    });
    questNo = getNoOfQuest.map((item) => item.galQuestNo);
    const uniqueQuestNo = [...new Set(questNo)];
    const totalQuest = uniqueQuestNo.reduce((accumulator, value) => accumulator + value)


    const getCompleStatus = await GameActivityLog.findAll({
      attributes: ['galGameId', 'galQuestNo', 'galQuestionState'],
      where: {
        galGameId: assignedGameId,
        galLearnerId: LoginUserId,
        // galQuestionState: {[Op.like] :'complete' , [Op.or] : {[Op.like] :'start'}}
      },
      group: ['galGameId', 'galQuestNo', 'galQuestionState'],
      order: [['galQuestionState', 'ASC']],
      logging: true
    });



    completedGame = getCompleStatus.filter((item) => item.galQuestionState == 'complete').length
    totalGameCompleStatus = getCompleStatus.length

    const getCompletedGame = completedGame
    const getInCompletedGame = Math.abs(completedGame - totalQuest);



    let datas = {
      gameCounts: gameCount,
      gameTitle: gameName,
      userDetails: req.user.user,
      totalQuest: totalQuest,
      completedGame: getCompletedGame,
      inCompletedGame: getInCompletedGame,
    }

    if (getGameCount) {
      return res.status(200).json({ status: 'Success', data: datas });
    }
    else {
      return res.status(200).json({ status: 'Failure', Message: 'LeaderBoard is Empty' });
    }

  }
  catch (error) {
    res.status(500).json({ status: 'Failure', message: "Internal Server Error", err: error.message });
  }

}

//Afrith-modified-starts-23/Mar/24
const getGameLanguages = async (req, res) => {
  const id = req.params.id;
  console.log('getLangid--', id);

  try {
    if (!id) {
      return res.status(404).json({ status: "Failure", message: "Bad request" });
    }

    const gameLang = await lmsGameChoosenLang.findAll({
      where: { gameId: id },
      include: [{
        model: LmsMultiLanguages,
        attributes: ['language_Id', 'language_name'],
        as: 'lmsMultiLanguageSupport',
        where: { language_Id: Sequelize.col('lmsGameChoosenLang.translationId') }
      }]
    });
    /**************** * commaned By Lokie * *****************************************
    
    // if (!gameLang || gameLang.length === 0) {
    //   return res.status(200).json({
    //     status: "Success",
    //     message: "No data found",
    //     data: []
    //   });
    // }
    *******************/

    // Separate array for English and other languages
    const englishLanguage = { value: 1, langName: 'English' };
    const otherLanguages = gameLang.map(item => ({
      value: item.lmsMultiLanguageSupport.language_Id,
      langName: item.lmsMultiLanguageSupport.language_name
    }));

    // Merge English and other languages arrays
    const languages = [englishLanguage, ...otherLanguages];
    return res.status(200).json({
      status: "Success",
      message: "Data fetched successfully",
      data: languages,
      count: languages.length ?? 0
    });
  } catch (e) {
    return res.status(500).json({
      status: "Failure",
      message: "Oops! something went wrong",
      err: e.message,
    });
  }
};

// const getGameLanguages = async (req,res) => {
//   const id = req.params.id;
//   console.log('getLangid--', id); // Log the id
//   return res.status(200).json({
//     status: "Success",
//     message: "Data fetched successfully",
//     data: [] // You can modify this to return actual data
//   });
// }

//Afrith-modified-ends-23/Mar/24

const getGameFeedback = async (req, res) => {
  try {
    const id = req.params.id;

    // Fetch the game feedback based on the gameId
    const gameFeedBack = await GameTable.findOne({
      attributes: ['gameQuestNo', 'gameContent', 'gameRelevance', 'gameBehaviour', 'gameOthers', 'gameGamification', 'gameRecommendation'],
      where: { gameId: id },
    });

    // Check if the feedback exists
    if (!gameFeedBack) {
      return res.status(404).json({
        status: "Failure",
        message: "No feedback found for the provided game ID",
      });
    }

    console.log('getGameFeedback Id--', gameFeedBack);

    return res.status(200).json({
      status: "Success",
      message: "Data fetched successfully",
      data: gameFeedBack,
    });
  } catch (error) {
    console.error('Error fetching game feedback:', error);

    return res.status(500).json({
      status: "Failure",
      message: "An error occurred while fetching the data",
    });
  }
};

const insertGameFedback = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body; // Use req.body directly for data retrieval

    // Check if data is present
    if (!data) {
      return res.status(400).json({ status: 'Failure', message: "Data Not Received" });
    }

    // Insert feedback data into the database
    const create = await FeedbackScreen.create({
      feedGameId: id,
      feedQuestNo: data.feedQuestNo ?? 0,
      feedContent: data.gameContent ?? '',
      feedRecommendation: data.gameRecommendation ?? '',
      feedRelevance: data.gameRelevance ?? '',
      feedGamification: data.gameGamification ?? '',
      feedBehaviour: data.gameBehaviour ?? '',
      feedOthers: data.gameOthers ?? '',
    });

    // Check if data was successfully created
    if (create) {
      console.log('ActivityCreate---', create);
      return res.status(200).json({ status: 'Success', message: "Feedback Created" });
    } else {
      return res.status(500).json({ status: 'Failure', message: "Internal Server Error" });
    }
  } catch (error) {
    // Handle any errors
    console.error('Error inserting feedback:', error);
    res.status(500).json({ status: 'Failure', message: "Internal Server Error" });
  }
}

// const getBadgeShadows = async (req, res) => {
//   try {
//     const id = req.params.id;
//     console.log('badgeShadowGameId--', id);

//     const findBadgeId = await LmsGame.findAll({
//       attributes: ['gameId', 'gameQuestNo', 'gameBadge', 'gameBadgeName', 'gameExtensionId'],
//       where: {gameExtensionId: id}
//     })

//     // Assuming you want to work with the first result
//     const gameBadge = findBadgeId.dataValues.gameBadge;

//     // Convert the gameBadge to a number
//     let badgeIdToNum = parseInt(gameBadge, 10);

//     console.log('findBadgeId--', findBadgeId);
//     console.log('badgeIdToNum--', badgeIdToNum);


//     const shadows = await LmsGameAssets.findAll({
//       attributes: ['gasId', 'gasAssetType', 'gasAssetName', 'gasAssetImage'],
//       where: { gasId: badgeIdToNum },
//     });

//     if (!shadows) {
//       return res.status(404).json({
//         status: "Failure",
//         message: "No shadows found for the provided game ID",
//       });
//     }

//     console.log('badgeShadow Id--', shadows);

//     const badgeShadows = shadows.map(shadow => {
//       const { gasAssetName, gasAssetImage } = shadow;

//       // Construct the shadow file path
//       const shadowImagePath = path.join('uploads/badges', `${path.basename(gasAssetImage, path.extname(gasAssetImage))}-shadow${path.extname(gasAssetImage)}`);

//       // Check if the shadow image file exists
//       const shadowImageExists = fs.existsSync(shadowImagePath);

//       console.log('shadowImgPath--',shadowImagePath)
//       return {
//         ...shadow.dataValues,
//         gasShadowImage: shadowImageExists ? shadowImagePath : null
//       };
//     });

//     return res.status(200).json({
//       status: "Success",
//       message: "Data fetched successfully",
//       data: badgeShadows,
//     });
//   } catch (error) {
//     console.error('Error fetching game badgeShadow:', error);

//     return res.status(500).json({
//       status: "Failure",
//       message: "An error occurred while fetching the data",
//     });
//   }
// };

const getBadgeShadows = async (req, res) => {
  try {
    const id = req.params.id;
    console.log('badgeShadowGameId--', id);

    const findBadgeIds = await LmsGame.findAll({
      attributes: ['gameId', 'gameQuestNo', 'gameBadge', 'gameBadgeName', 'gameExtensionId'],
      where: { gameExtensionId: id }
    });

    // Check if findBadgeIds is empty
    if (findBadgeIds.length === 0) {
      return res.status(404).json({
        status: "Failure",
        message: "No games found for the provided game extension ID",
      });
    }

    const badgeShadows = [];

    for (let badge of findBadgeIds) {
      // Convert the gameBadge to a number
      let badgeIdToNum = parseInt(badge.dataValues.gameBadge, 10);
      console.log('badgeIdToNum--', badgeIdToNum);

      const shadows = await LmsGameAssets.findAll({
        attributes: ['gasId', 'gasAssetType', 'gasAssetName', 'gasAssetImage'],
        where: { gasId: badgeIdToNum },
      });

      if (shadows.length === 0) {
        console.log(`No shadows found for gameBadge ID: ${badgeIdToNum}`);
        continue;
      }

      console.log('badgeShadow Id--', shadows);

      shadows.forEach(shadow => {
        const { gasAssetName, gasAssetImage } = shadow;

        // Construct the shadow file path
        const shadowImagePath = path.join('uploads/badges', `${path.basename(gasAssetImage, path.extname(gasAssetImage))}-shadow${path.extname(gasAssetImage)}`);

        // Check if the shadow image file exists
        const shadowImageExists = fs.existsSync(shadowImagePath);

        console.log('shadowImgPath--', shadowImagePath);
        badgeShadows.push({
          ...shadow.dataValues,
          gasShadowImage: shadowImageExists ? shadowImagePath : null
        });
      });
    }

    return res.status(200).json({
      status: "Success",
      message: "Data fetched successfully",
      data: badgeShadows,
    });
  } catch (error) {
    console.error('Error fetching game badgeShadow:', error);

    return res.status(500).json({
      status: "Failure",
      message: "An error occurred while fetching the data",
    });
  }
};


module.exports = { getAssignedGames, getGamePlay, learnerUpdation, getleaderBoard, learnerDasboard, getGameLanguages,getGameFeedback,insertGameFedback, getBadgeShadows }
