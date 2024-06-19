// Lokie Added
const LmsGame = require("../../models/game");
const LmsLanguages = require("../../models/languages");
// Lokie Added End
const { OpenAI } = require("openai");
const { Sequelize, Op } = require("sequelize");
const CompletionScreen = require("../../models/completionScreen");
const ReflectionQuestion = require("../../models/reflectionQuestions");
const gameassest = require("../../models/gameAsset");
const gameHistory = require("../../models/gameviewhistory");
const LmsBlocks = require("../../models/blocks");
const lmsQuestionOptions = require("../../models/questionOptions");
const learners = require("../../models/learner");
const gamessign = require("../../models/gameassinged");
const Catgory = require("../../models/category");
const Skill = require("../../models/skills");
const { storageLocations } = require("../../config/storageConfig");
const lmsquestionsoption = require("../../models/questionOptions");
const Creator = require("../../models/Creator");
const Reviewers = require("../../models/gameReviewers");
const Reviewes = require("../../models/gameReviews");
const ReviewersGame = require("../../models/reviewersGame");
const fs = require("fs");
const path = require("path");
const LmsGameAssets = require("../../models/gameAsset");
const transporter = require("../../lib/mails/mailService");
const lmsGameContentLang = require("../../models/gamecontentlang");
// const { gtts } = require('gtts');
const addGame = async (req, res) => {
  try {
    const LoginUserRole = req.user.user.role;
    const LoginUserId = req.user.user.id;
    if (!req.body) {
      return res
        .status(400)
        .json({ status: "Failure", message: "Bad request" });
    }
    const gameLasttabValue = req.body.gameLastTab;
    const integerValue = parseInt(gameLasttabValue, 10); // Using parseInt
    // OR
    // const integerValue = +gameLasttabValue; // Using the unary plus operator

    const newArray = [integerValue];
    const stringArray = [integerValue.toString()]; //Afrith-modified-30/Apr/24

    const cleanedBody = Object.fromEntries(
      Object.entries(req.body).filter(
        ([key, value]) => value !== null && value !== "" && req.body.refQuestion
      )
    );
    delete cleanedBody.refQuestion;
    // OR create a new object without refQuestion
    const { refQuestion, ...newCleanedBody } = cleanedBody;
    cleanedBody.gameCreatedDatetime = Date.now();
    cleanedBody.gameActiveStatus = "Active";
    cleanedBody.gameDeleteStatus = "NO";
    cleanedBody.gameCreatedUserId = req.user.user.id;
    cleanedBody.gameCreatorUserId = req.user.user.id;
    cleanedBody.gameIpAddress = req.connection.remoteAddress;
    cleanedBody.gameUserAgent = req.headers["user-agent"];
    cleanedBody.gameGameStage = "Creation";
    // cleanedBody.gameLastTabArray = JSON.stringify([integerValue]);
    cleanedBody.gameLastTabArray = JSON.stringify(stringArray); //Afrith-modfiied-30/Apr/24
    cleanedBody.gameStageDate = Date.now();
    cleanedBody.gameSkills = "";
    cleanedBody.gameQuestNo = 1;
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
          as: "image",
          attributes: [
            [
              Sequelize.literal(
                `CONCAT('${req.protocol}://${req.get("host")}/', gasAssetImage)`
              ),
              "gasAssetImage",
            ],
          ],
          required: false,
        },
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
          type !== "All" ? { gameGameStage: type } : {},
          data.gameCategoryId
            ? { gameCategoryId: { [Op.like]: `%${data.gameCategoryId}%` } }
            : {},
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
      // logging: console.log // Log the generated SQL query
    });

    const modifiedData = await Promise.all(
      allData.map(async (game) => {
        let skillNames = null;
        let catNames = null;

        if (game.gameSkills) {
          // const skillArray = game.gameSkills.split(",").map(Number);
          const skillArray = game.gameSkills.split(",").map((item) => {
            const number = parseInt(item, 10);
            return isNaN(number) ? null : number;
          }).filter(item => item !== null); // Filter out any null values

          const getSkills = await Skill.findAll({
            attributes: [["crSkillName", "skillName"]],
            where: {
              crSkillId: {
                [Op.in]: skillArray,
              },
            },
          });

          skillNames = getSkills.map((skill) => skill.dataValues.skillName);
        }

        if (game.gameCategoryId) {
          // <-- Check if gameCategoryId is defined on the game object
          const getCatgory = await Catgory.findAll({
            attributes: [["catName", "catgoryName"]],
            where: {
              catId: game.gameCategoryId, // <-- Access gameCategoryId from the game object
            },
          });

          catNames = getCatgory.map((cat) => cat.dataValues.catgoryName);
        }

        const modifiedGame = {
          ...game.toJSON(),
          gameSkills: game.gameSkills ? skillNames : null,
          gameCategoryId: game.gameCategoryId ? catNames : null,
          // Add other modifications as needed
        };

        return modifiedGame;
      })
    );

    if (count === 0) {
      return res
        .status(404)
        .json({ status: "Failure", message: "No records found" });
    }

    res.status(200).json({
      status: "Success",
      message: "All Data Retrieved Successfully",
      data: modifiedData, // Use modifiedData instead of allData
      count: count,
    });
  } catch (error) {
    res.status(500).json({
      status: "Failure",
      message: "Internal Server Error",
      err: error.message,
    });
  }
};
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
          as: "image",
          attributes: [
            [
              Sequelize.literal(
                `CONCAT('${req.protocol}://${req.get("host")}/', gasAssetImage)`
              ),
              "gasAssetImage",
            ],
          ],
          required: false,
        },
      ],
      attributes: [
        `gameId`,
        `gameNonPlayerName`,
        `gameNonPlayerVoice`,
        `gamePlayerMaleVoice`,
        `gamePlayerFemaleVoice`,
        `gameNarratorVoice`,
        `gameCategoryId`,
        `gameBackgroundId`,
        `gameNonPlayingCharacterId`,
        `gameCharacterName`,
        `gameTitle`,
        `gameStoryLine`,
        `gameSkills`,
        `gameLearningOutcome`,
        `gameDuration`,
        `gameAuthorName`,
        `gameIsShowLeaderboard`,
        `gameIsShowReflectionScreen`,
        `gameTakeawayContent`,
        `gameAdditionalWelcomeNote`,
        `gameThankYouMessage`,
        `gameIsCollectLearnerFeedback`,
        `gameIsFeedbackMandatory`,
        `gameIsLearnerMandatoryQuestion`,
        `gameIsAddanotherQuestions`,
        `gameIsSetMinPassScore`,
        `gameIsSetDistinctionScore`,
        `gameDistinctionScore`,
        `gameIsSetSkillWiseScore`,
        `gameIsSetBadge`,
        `gameBadge`,
        `gameBadgeName`,
        `gameIsSetCriteriaForBadge`,
        `gameAwardBadgeScore`,
        `gameScreenTitle`,
        `gameIsSetCongratsSingleMessage`,
        `gameIsSetCongratsScoreWiseMessage`,
        `gameCompletedCongratsMessage`,
        `gameMinimumScoreCongratsMessage`,
        `gameLessthanDistinctionScoreCongratsMessage`,
        `gameAboveDistinctionScoreCongratsMessage`,
        `gameIsShowTakeaway`,
        `gameIsShowSkill`,
        `gameIsShowStoryline`,
        `gameIsShowLearningOutcome`,
        `gameIsShowGameDuration`,
        `gameIsShowAuhorName`,
        `gameIsShowAdditionalWelcomeNote`,
        `gameMinScore`,
        `gameIsSetMinimumScore`,
        `gameMaxScore`,
        `gameTotalScore`,
        `gameCreatorUserId`,
        `gameEditorUserId`,
        `gameAnotherCreatorId`,
        `gameReplayAllowed`,
        `gameReflectionpageAllowed`,
        `gameReflectionpageBackground`,
        `gameFeedbackQuestion`,
        `gameWelcomepageBackground`,
        `gameLeaderboardAllowed`,
        `gameReflectionpageid`,
        `gameLanguageId`,
        `gameSummaryScreen`,
        `gameIntroMusic`,
        `gameDefaultFeedbackForm`,
        `gameSummarizes`,
        `gamWelcomePageText`,
        `gameThankYouPage`,
        `gameGameStage`,
        `gameDuplicated`,
        `gameCourseType`,
        `gameLaunchedWithinPlatform`,
        `gameDownloadedAsScorm`,
        `gameScormVersion`,
        `gameIsShowInteractionFeedBack`,
        `gameShuffle`,
        `gameDisableOptionalReplays`,
        `gameTrackQuestionWiseAnswers`,
        `gameDisableLearnerMailNotifications`,
        `gameLastTab`,
        `gameCreatedUserId`,
        `gameCreatedDate`,
        `gameEditedUserId`,
        `gameEditedDate`,
        `gameDeleteStatus`,
        `gameActiveStatus`,
        `gameIpAddress`,
        `gameUserAgent`,
        `gameDeviceType`,
        `createdAt`,
        `updatedAt`,
        `gameLastTabArray`,
        `gameCompletionScreenId`,
        `gameLeaderboardScreenId`,
        `gameReflectionScreenId`,
        `gameTakeawayScreenId`,
        `gameWelcomepageBackgroundScreenId`,
        `gameThankYouScreenId`,
        `gameExtensionId`,
        `gameQuestion1`,
        `gameQuestion2`,
        `gameQuestionValue1`,
        `gameQuestionValue2`,
        `gameQuestionValue3`,
        `gameQuestionValue4`,
        `gameStageDate`,
        [
          Sequelize.literal(
            "(SELECT COUNT(*) FROM lmsgameviewhistory WHERE gvgameId = lmsgame.gameId)"
          ),
          "gameview",
        ],
        `gameExtensionId`,
        // ... (other aggregated columns or necessary columns for grouping)
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
          { gameGameStage: "Launched" },
          // Assuming data is defined or replace it with the correct variable
          data && data.gameCategoryId
            ? { gameCategoryId: { [Op.like]: `%${data.gameCategoryId}%` } }
            : {},
        ],
      },
      group: ["gameExtensionId"], // Specify the column to group by
      order: [["gameId", "DESC"]],
    });

    const modifiedData = await Promise.all(
      allData.map(async (game) => {
        let skillNames = null;
        let catNames = null;

        if (game.gameSkills) {
          const skillArray = game.gameSkills.split(",").map(Number);

          const getSkills = await Skill.findAll({
            attributes: [["crSkillName", "skillName"]],
            where: {
              crSkillId: {
                [Op.in]: skillArray,
              },
            },
          });

          skillNames = getSkills.map((skill) => skill.dataValues.skillName);
        }

        if (game.gameCategoryId) {
          // <-- Check if gameCategoryId is defined on the game object
          const getCatgory = await Catgory.findAll({
            attributes: [["catName", "catgoryName"]],
            where: {
              catId: game.gameCategoryId, // <-- Access gameCategoryId from the game object
            },
          });

          catNames = getCatgory.map((cat) => cat.dataValues.catgoryName);
        }

        const modifiedGame = {
          ...game.toJSON(),
          gameSkills: game.gameSkills ? skillNames : null,
          gameCategoryId: game.gameCategoryId ? catNames : null,
          // Add other modifications as needed
        };

        return modifiedGame;
      })
    );

    if (count === 0) {
      return res
        .status(404)
        .json({ status: "Failure", message: "No records found" });
    }

    res.status(200).json({
      status: "Success",
      message: "All Data Retrieved Successfully",
      data: modifiedData,
      count: count,
    });
  } catch (error) {
    res.status(500).json({
      status: "Failure",
      message: "Internal Server Error",
      err: error.message,
    });
  }
};
const updateGame = async (req, res) => {
  try {
    const data = req?.body;
    // console.log(data);
    const id = req?.params?.id;
    const languageId = data.gameLanguageId;

    const updateResult = await LmsGame.update(
      { gameLanguageId: languageId },
       {
      where: {
        gameId: id,
      },
    });
    
    console.log('Lokie Upadta',data);
   
    if (data.gameLastTab) {
      data.gameLastTab = JSON.stringify(data.gameLastTab);
    }

    if (data.gameLastTab) {
      const findlasttab = await LmsGame.findOne({
        where: {
          gameId: id,
        },
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
            data.gameLastTabArray = findlasttab.gameLastTabArray;
          } else {
            data.gameLastTabArray = findlasttab.gameLastTabArray;
            // console.log(
            //   `Value ${data.gameLastTab} is already inside gameLastTabArray`
            // );
          }
        } catch (error) {
          // If parsing fails, handle it accordingly
          console.error("Error parsing gameLastTabArray:", error);
        }

        // Save the updated array back to the database

        // console.log(`Value ${data.gameLastTab} processed for gameLastTabArray`);
      } else {
        // console.log("gameLastTabArray not found or is null");
      }
      // Other logic...

      // data.gameLastTab = JSON.stringify(data.gameLastTab);
    }

    if (!id)
      return res
        .status(404)
        .json({ status: "Failure", message: "bad Request" });
    if (!req.body)
      return res
        .status(404)
        .json({ status: "Failure", message: "bad Request" });
    if (
      data.gameSkills &&
      Array.isArray(data.gameSkills) &&
      data.gameSkills.length > 0
    ) {
      const updatedSkills = await Promise.all(
        data.gameSkills.map(async (skill) => {
          // Check if a skill with the same name exists
          const existingSkill = await Skill.findOne({
            where: {
              crSkillName: {
                [Sequelize.Op.like]: `%${skill.crSkillName}%`,
              },
            },
          });

          if (existingSkill) {
            // If the skill already exists, use its ID
            return existingSkill.crSkillId;
          } else {
            // If the skill doesn't exist, insert it and use the new ID
            const newSkill = await Skill.create({
              crSkillName: skill.crSkillName,
              crSkillStatus: "Active",
              crDeleteStatus: "No",
              crCreatedDate: Date.now(),
              crUserAgent: req.headers["user-agent"],
              crIpAddress: req.connection.remoteAddress,
              crDeviceType: req.device.type,
            });
            return newSkill.crSkillId;
          }
        })
      );
      data.gameSkills = updatedSkills.join(",");

      // Update data.gameSkills with the new skill IDs
      // data.gameSkills = updatedSkills;

      // Now you can use data.gameSkills which contains skillId and skillName
      // ... rest of your code
    }
    const checkextentsion = await LmsGame.findOne({ where: { gameId: id } });
    // res.status(200).send(checkextentsion);

    if (checkextentsion.gameExtensionId) {
      data.gameExtensionId = checkextentsion.gameExtensionId;
    } else {
      data.gameExtensionId = id;
    }

    const {
      gameQuestNo,
      gameIsSetMinPassScore,
      gameMinScore,
      gameIsSetDistinctionScore,
      gameDistinctionScore,
      gameIsSetSkillWiseScore,
      gameIsSetBadge,
      gameBadgeName,
      gameBadge,
      gameIsSetCriteriaForBadge,
      gameAwardBadgeScore,
      gameScreenTitle,
      gameCompletedCongratsMessage,
      gameIsSetCongratsScoreWiseMessage,
      gameMinimumScoreCongratsMessage,
      gameaboveMinimumScoreCongratsMessage,
      gameLessthanDistinctionScoreCongratsMessage,
      gameAboveDistinctionScoreCongratsMessage,
      ...updateData
    } = data;
    const record = await LmsGame.update(updateData, {
      where: {
        gameId: id,
      },
    });

    let updateableData = {
      gameBackgroundId: data.gameBackgroundId,
      gameNonPlayingCharacterId: data.gameNonPlayingCharacterId,
      gameNonPlayerVoice: data.gameNonPlayerVoice,
      gamePlayerMaleVoice: data.gamePlayerMaleVoice,
      gamePlayerFemaleVoice: data.gamePlayerFemaleVoice,
      gameNarratorVoice: data.gameNarratorVoice,
      gameLearningOutcome: data.gameLearningOutcome,
      gameCategoryId: data.gameCategoryId,
      
      gameSkills: data.gameSkills,
    };
    if (languageId === 1) {
      updateableData.gameNonPlayerName = data.gameNonPlayerName;
      updateableData.gameTitle = data.gameTitle;
      updateableData.gameStoryLine = data.gameStoryLine;
      updateableData.gameAuthorName = data.gameAuthorName;
     
    }
    const saved = await LmsGame.update(updateableData, {
      where: { gameExtensionId: data.gameExtensionId },
    });
    if (data.gameGameStage === "Review") {
      const saved = await LmsGame.update(
        { gameGameStage: data.gameGameStage },
        { where: { gameExtensionId: data.gameExtensionId } }
      );
    }

    //Newly added code
    // data.gameExtensionId=id;
    // // return res.status(404).json({ status: 'Successsss', message: 'Game Updated Succesfully',data:data.gameSkills,datas : data.gameCategoryId})

    // const record = await LmsGame.update(data, {
    //   where: {
    //     gameId: id
    //   }
    // });
    if (!record)
      return res
        .status(404)
        .json({ status: "Failure", message: "bad Request" });
    return res.status(200).json({
      status: "Success",
      message: "Game Updated Succesfully",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      status: "Failure",
      message: "Internal Server Error",
      err: error.message,
    });
  }
};
const getGameById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ status: "Failure", message: "Bad Request" });
    }
    const updateLanguage = await LmsGame.update({
      gameLanguageId: 1
    }, {
      where: {
        gameExtensionId: id
      }
    });
    

    // Fetch data for the specific item based on the provided ID
    const specificData = await LmsGame.findByPk(id);

    if (!specificData) {
      return res.status(404).json({ error: "Record not found" });
    }

    res.status(200).json({
      status: "Success",
      message: "Data Retrieved Successfully",
      data: specificData,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error", err: error });
  }
};

const getBlocks = async (req, res) => {
  try {
    const id = req?.params?.id;
    if (!id)
      return res.status(404).json({ status: "Failure", message: "Id Need" });
    const { count, rows: allData } = await LmsBlocks.findAndCountAll({
      attributes: ["blockId", "blockTitleTag"],
      where: {
        blockGameId: {
          [Op.eq]: id,
        },
        blockChoosen: {
          [Op.eq]: "Interaction",
        },
      },
    });

    if (count === 0) {
      return res
        .status(404)
        .json({ status: "Failure", message: "No records found" });
    }
    return res.status(200).json({
      status: "Success",
      message: "All Data Retrieved Successfully",
      data: allData,
      count: count,
    });
  } catch (error) {
    res.status(500).json({
      status: "Failure",
      message: "Internal Server Error",
      err: error,
    });
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
              [Op.not]: "",
            },
          },
        ],
        gameDeleteStatus: "No",
        [Op.or]: [
          {
            gameCreatorUserId: LoginUserId,
          },
          {
            gameAnotherCreatorId: LoginUserId,
          },
        ],
      },
      group: ["gameExtensionId"], // Specify the column to group by
    });
    const creationCount = await LmsGame.findAll({
      where: {
        gameGameStage: "Creation",
        gameDeleteStatus: "No",
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
    });
    const reviewCount = await LmsGame.findAll({
      where: {
        gameGameStage: "Review",
        gameDeleteStatus: "No",
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
    });
    const PublicCount = await LmsGame.findAll({
      where: {
        gameGameStage: "Launched",
        gameDeleteStatus: "No",
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
    });

    return res.status(200).json({
      status: "Success",
      message: "All Data Retrieved Successfully",
      creationCount: creationCount.length,
      reviewCount: reviewCount.length,
      PublicCount: PublicCount.length,
      count: overallCount.length,
    });
  } catch (error) {
    res.status(500).json({
      status: "Failure",
      message: "Internal Server Error",
      err: error,
    });
  }
};
const gameDuplicate = async (req, res) => {
  try {
    const id = req?.params?.id;

    const getAllgame = await LmsGame.findAll({
      where: {
        gameExtensionId: id,
      },
      order: [["gameId", "ASC"]],
    });

    let setExtenstion = [];
    const processedGames = await Promise.all(
      getAllgame.map(async (game, index) => {
        const gameToClone = await LmsGame.findByPk(game.gameId);
        let taketile = gameToClone?.gameTitle?.split("_");
        const currentDate = new Date();
        const formattedDate = `${currentDate.getDate()}-${
          currentDate.getMonth() + 1
        }-${currentDate.getFullYear()}`;
        const formattedTime = `${currentDate.getHours()}.${currentDate.getMinutes()}.${currentDate.getSeconds()}`;

        // Create newTitle with current date and time
        let newTitle = `${taketile[0]}_copied(${formattedDate} ${formattedTime})`;
        const clonedGame = LmsGame.build({
          ...gameToClone.get(), // Using spread syntax to copy all fields
          gameId: null, // Set id to null to create a new record
          // Modify specific fields here
          gameTitle: newTitle, // Change 'someField' to the new value
          gameGameStage: "Creation",
          gameExtensionId: null,
          gameDuplicated: "YES",
          gameStageDate: Date.now(),
          gameCreatedDatetime: Date.now(),
          gameIpAddress: req.connection.remoteAddress,
          gameUserAgent: req.headers["user-agent"],
        });
        await clonedGame.save();

        if (clonedGame && index === 0) {
          setExtenstion.push(clonedGame.gameId);
        }
        //  return false;
        const gameup = await LmsGame.update(
          { gameExtensionId: setExtenstion[0] },
          {
            where: {
              gameId: clonedGame.gameId,
            },
          }
        );
        // console.log("setExtenstion", setExtenstion[0]);
        // console.log("clonedGame.gameId", gameup, index);

        if (clonedGame) {
          const blocksToClone = await LmsBlocks.findAll({
            where: {
              blockGameId: id,
              blockQuestNo: clonedGame.gameQuestNo, // Replace 'yourValue' with the actual value you're searching for
            },
          });

          if (blocksToClone) {
            for (const block of blocksToClone) {
              // Perform your actions for each block here
              // For example, clone the block or perform any other operation
              const clonedBlock = await LmsBlocks.create({
                ...block.get(),
                blockId: null,
                blockGameId: setExtenstion[0],
              });
              await clonedBlock.save();
              if (clonedBlock) {
                const QuestionsOptionToClone = await lmsQuestionOptions.findAll(
                  {
                    where: {
                      qpQuestionId: block.blockId,
                    },
                  }
                );

                if (QuestionsOptionToClone) {
                  for (const option of QuestionsOptionToClone) {
                    const clonedOption = await lmsQuestionOptions.create({
                      ...option.get(),
                      qpOptionId: null,
                      qpQuestionId: clonedBlock.blockId,
                      qpGameId: setExtenstion[0],
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
          if (index === 0) {
            const relfectionToClone = await ReflectionQuestion.findAll({
              where: {
                refGameId: id, // Replace 'yourValue' with the actual value you're searching for
              },
            });

            if (relfectionToClone) {
              for (const ref of relfectionToClone) {
                const clonedRelfection = await ReflectionQuestion.create({
                  ...ref.get(),
                  refId: null, // Set id to null to create a new record
                  refGameId: setExtenstion[0],
                });
              }
            }
          }
        } else {
          return res
            .status(400)
            .json({ status: "Failure", message: "Game Not Duplicated ." });
        }
      })
    );
    let sendData = [];
    if (setExtenstion.length > 0) {
      // Check if setExtenstion is not empty
      sendData = await LmsGame.findAll({
        where: {
          gameId: setExtenstion[0],
        },
      });
      return res.status(200).json({
        status: "Success",
        message: "Game Duplicated successfully.",
        data: sendData,
      });
    }
    return res.status(200).json({
      status: "Success",
      message: "Game Duplicated successfully.",
      data: sendData,
    });
  } catch (error) {
    res.status(500).json({
      status: "Failure",
      message: "Internal Server Error",
      err: error.message,
    });
  }
};

const gameLaunch = async (req, res) => {
  try {
    const id = req?.params?.id;
    const record = await LmsGame.findByPk(id);
    if (!record) {
      return res
        .status(404)
        .json({ status: "Failure", error: "Record not found" });
    }

    const intral = await LmsGame.update(
      {
        gameDuplicated: "NO",
        gameGameStage: "Review",
        gameStageDate: Date.now(),
      },
      {
        where: {
          gameExtensionId: id,
        },
      }
    );
    // await record.destroy();

    res
      .status(200)
      .json({ status: "Success", message: "Record Successfully Deleted" });
  } catch {
    res.status(500).json({
      status: "Failure",
      message: "Internal Server Error",
      err: error,
    });
  }
};
const gameAssign = async (req, res) => {
  try {
    const id = req?.params?.id;
    const data = req.body;
  } catch {}
};
const gamePublic = async (req, res) => {
  try {
    const id = req?.params?.id;

    const getAllgame = await LmsGame.findAll({
      where: {
        gameExtensionId: id,
      },
      order: [["gameId", "ASC"]],
    });

    let setExtenstion = [];
    const processedGames = await Promise.all(
      getAllgame.map(async (game, index) => {
        const gameToClone = await LmsGame.findByPk(game.gameId);
        let taketile = gameToClone?.gameTitle?.split("_");
        const currentDate = new Date();
        const formattedDate = `${currentDate.getDate()}-${
          currentDate.getMonth() + 1
        }-${currentDate.getFullYear()}`;
        const formattedTime = `${currentDate.getHours()}.${currentDate.getMinutes()}.${currentDate.getSeconds()}`;

        // Create newTitle with current date and time
        let newTitle = `${taketile[0]}_copied(${formattedDate} ${formattedTime})`;
        const clonedGame = LmsGame.build({
          ...gameToClone.get(), // Using spread syntax to copy all fields
          gameId: null, // Set id to null to create a new record
          gameGameStage: "Launched",
          gameExtensionId: null,
          gameDuplicated: "NO",
          gameStageDate: Date.now(),
          gameCreatedDatetime: Date.now(),
          gameIpAddress: req.connection.remoteAddress,
          gameUserAgent: req.headers["user-agent"],
        });
        await clonedGame.save();
        //  return res.status(200).json({ message: 'Game Duplicated successfully.', data: clonedGame });
        if (clonedGame && index === 0) {
          setExtenstion.push(clonedGame.gameId);
        }
        //  return false;
        const gameup = await LmsGame.update(
          { gameExtensionId: setExtenstion[0] },
          {
            where: {
              gameId: clonedGame.gameId,
            },
          }
        );
        // console.log("setExtenstion", setExtenstion[0]);
        // console.log("clonedGame.gameId", gameup, index);

        if (clonedGame) {
          const blocksToClone = await LmsBlocks.findAll({
            where: {
              blockGameId: id,
              blockQuestNo: clonedGame.gameQuestNo, // Replace 'yourValue' with the actual value you're searching for
            },
          });

          if (blocksToClone) {
            for (const block of blocksToClone) {
              // Perform your actions for each block here
              // For example, clone the block or perform any other operation
              const clonedBlock = await LmsBlocks.create({
                ...block.get(),
                blockId: null,
                blockGameId: setExtenstion[0],
              });
              await clonedBlock.save();
              if (clonedBlock) {
                const QuestionsOptionToClone = await lmsQuestionOptions.findAll(
                  {
                    where: {
                      qpQuestionId: block.blockId,
                    },
                  }
                );

                if (QuestionsOptionToClone) {
                  for (const option of QuestionsOptionToClone) {
                    const clonedOption = await lmsQuestionOptions.create({
                      ...option.get(),
                      qpOptionId: null,
                      qpQuestionId: clonedBlock.blockId,
                      qpGameId: setExtenstion[0],
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
          if (index === 0) {
            const relfectionToClone = await ReflectionQuestion.findAll({
              where: {
                refGameId: id, // Replace 'yourValue' with the actual value you're searching for
              },
            });

            if (relfectionToClone) {
              for (const ref of relfectionToClone) {
                const clonedRelfection = await ReflectionQuestion.create({
                  ...ref.get(),
                  refId: null, // Set id to null to create a new record
                  refGameId: setExtenstion[0],
                });
              }
            }
          }
        } else {
          return res
            .status(400)
            .json({ status: "Failure", message: "Game Not Duplicated ." });
        }
      })
    );
    let sendData = [];
    if (setExtenstion.length > 0) {
      // Check if setExtenstion is not empty
      sendData = await LmsGame.findAll({
        where: {
          gameId: setExtenstion[0],
        },
      });
      return res.status(200).json({
        status: "Success",
        message: "Game Duplicated successfully.",
        data: sendData,
      });
    } else {
    }
    return res.status(200).json({
      status: "Success",
      message: "Game Duplicated successfully.",
      data: sendData,
    });
  } catch (error) {
    res.status(500).json({
      status: "Failure",
      message: "Internal Server Error",
      err: error.message,
    });
  }
};
const gameDelete = async (req, res) => {
  try {
    const id = req?.params?.id;
    const record = await LmsGame.findByPk(id);
    if (!record) {
      return res
        .status(404)
        .json({ status: "Failure", error: "Record not found" });
    }

    // Corrected syntax for the update method
    const gamedelete = await LmsGame.update(
      { gameDeleteStatus: "YES" },
      {
        where: {
          gameExtensionId: id,
        },
      }
    );

    // await record.destroy();

    res
      .status(200)
      .json({ status: "Success", message: "Record Successfully Deleted" });
  } catch (error) {
    // Corrected variable name
    res.status(500).json({
      status: "Failure",
      message: "Internal Server Error",
      err: error,
    });
  }
};
const gameLearnersList = async (req, res) => {
  try {
    const LoginUserRole = req.user.user.role;
    const LoginUserId = req.user.user.id;
    const id = req?.params?.id;

    const getlearners = await learners.findAll({
      where: {
        lenCreatorId: LoginUserId,
        lenDeleteStatus: "NO",
        lenStatus: "Active",
      },
    });

    const getassignlist = await gamessign.findAll({
      attributes: ["gaLearnerId"],
      where: {
        gaGameId: id,
        gaDeleteStatus: "NO",
      },
    });

    // Extracting gaLearnerId values into an array
    const learnerIdsArray = getassignlist.map((item) => item.gaLearnerId);

    res.status(200).json({
      status: "Success",
      message: "Record Successfully Deleted",
      learner: getlearners,
      assign: learnerIdsArray,
    });
  } catch (error) {
    res.status(500).json({
      status: "Failure",
      message: "Internal Server Error",
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
    const { key, questNo } = req.body;

    const id = req?.params?.id;

    if (!key)
      return res
        .status(400)
        .json({ status: "Failure", message: "key not found" });

    const getGameExtensionId = await LmsGame.findOne({
      attributes: ["gameExtensionId"],
      where: {
        gameId: id,
        gameDeleteStatus: "No",
      },
      order: [["gameId", "ASC"]],
    });

    const getGameExtensionCounts = await LmsGame.count({
      where: {
        gameExtensionId: getGameExtensionId.gameExtensionId,
        gameDeleteStatus: "No",
      },
    });

    const getGameExtensionCount = getGameExtensionCounts + 1;

    const getgamequestid = await LmsGame.findAll({
      where: {
        gameExtensionId: id,
        gameQuestNo: questNo, // Replace 'yourValue' with the actual value you're searching for
      },
    });
    // console.log("getgamequestid", getgamequestid[0].dataValues.gameId);
    // console.log("getgamequestid1", getgamequestid);
    const gamequestid = getgamequestid
      ? getgamequestid[0].dataValues.gameId
      : id;

    const gameToClone = await LmsGame.findByPk(gamequestid);
    if (!gameToClone)
      return res
        .status(400)
        .json({ status: "Failure", message: "Game not Found" });

    const clonedGame = await LmsGame.create({
      ...gameToClone.toJSON(),
      gameId: null,
      gameExtensionId: gameToClone.gameExtensionId
        ? gameToClone.gameExtensionId
        : gameToClone.gameId,
      gameQuestNo: getGameExtensionCount,
    });
    if (key === "Entire") {
      if (!clonedGame)
        return res
          .status(400)
          .json({ status: "Failure", message: "Game Not Duplicated." });

      if (clonedGame) {
        const blocksToClone = await LmsBlocks.findAll({
          where: {
            blockGameId: id, // Replace 'yourValue' with the actual value you're searching for
            blockQuestNo: questNo,
          },
        });
        if (blocksToClone) {
          for (const block of blocksToClone) {
            const parts = block.blockPrimarySequence.split(".");

            block.blockQuestNo = getGameExtensionCount;

            block.blockPrimarySequence = getGameExtensionCount + "." + parts[1];

            const dragParts = block.blockDragSequence.split(".");

            block.blockDragSequence =
              getGameExtensionCount + "." + dragParts[1];

            const clonedBlock = await LmsBlocks.create({
              ...block.get(),
              blockId: null,
              blockGameId: id,
            });

            await clonedBlock.save();

            const QuestionsOptionToClone = await lmsQuestionOptions.findAll({
              where: {
                qpQuestionId: block.blockId,
              },
            });

            if (QuestionsOptionToClone) {
              for (const option of QuestionsOptionToClone) {
                const clonedOption = await lmsQuestionOptions.create({
                  ...option.get(),
                  qpOptionId: null,
                  qpQuestNo: getGameExtensionCount,
                  qpQuestionId: clonedBlock.blockId,
                  qpGameId: id,
                  qpSequence: clonedBlock.blockPrimarySequence,
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
          res.status(400).json({
            message: "Stroy Not In the Game .",
            data: clonedGame.gameId,
          });
        }

        return res.status(200).json({
          status: "Success",
          message: "Game Duplicated successfully.",
          data: clonedGame,
        });
      } else {
        return res
          .status(400)
          .json({ status: "Failure", message: "Game Not Duplicated ." });
      }
    }

    if (!clonedGame) {
      return res
        .status(400)
        .json({ status: "Failure", message: "Game Not Duplicated." });
    } else {
      return res.status(200).json({
        status: "Success",
        message: "Game Duplicated successfully.",
        data: clonedGame,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: "Failure",
      message: "Internal Server Error",
      err: error.message,
    });
  }
};
const getDefaultCat = async (req, res) => {
  try {
    const id = req?.params?.id;

    const alredycat = await LmsGame.findOne({
      where: { gameId: id },
    });

    let whereClause;

    if (alredycat && alredycat.gameCategoryId) {
      const catIdArray = alredycat.gameCategoryId.split(",").map(Number);

      whereClause = {
        catId: {
          [Op.in]: catIdArray,
        },
      };
    } else {
      whereClause = {
        catDefaultStatus: "YES",
      };
    }

    const defaultCatgory = await Catgory.findAll({
      attributes: ["catId", "catName", "catDefaultStatus"],
      where: {
        catStatus: "Active",
        catDeleteStatus: "NO",
        ...whereClause, // Use the dynamically generated whereClause
      },
    });
    res.status(200).json({
      status: "Success",
      message: "Record Successfully Deleted",
      data: defaultCatgory,
    });
  } catch (error) {
    res.status(500).json({
      status: "Failure",
      message: "Internal Server Error",
      err: error.message,
    });
  }
};
const getDefaultSkill = async (req, res) => {
  try {
    const id = req?.params?.id;

    const alredycat = await LmsGame.findOne({
      where: { gameId: id },
    });

    let whereClause;
    let defaultSkill = [];
    if (alredycat && alredycat.gameSkills) {
      const catIdArray = alredycat.gameSkills.split(",").map(Number);

      whereClause = {
        crSkillId: {
          [Op.in]: catIdArray,
        },
      };

      defaultSkill = await Skill.findAll({
        attributes: ["crSkillId", "crSkillName", "crDefaultStatus"],
        where: {
          ...whereClause, // Use the dynamically generated whereClause
        },
      });
    }

    res.status(200).json({
      status: "Success",
      message: "Record Successfully Deleted",
      data: defaultSkill,
    });
  } catch (error) {
    res.status(500).json({
      status: "Failure",
      message: "Internal Server Error",
      err: error.message,
    });
  }
};
const getCreatorBlocks = async (req, res) => {
  try {
    const { id } = req.params;
    const ext = await LmsGame.findOne({ where: { gameId: id } });
    if (!ext)
      return res
        .status(404)
        .json({ status: "Failure", error: "Questions Not Found" });

    let quest = [];
    if (ext.gameExtensionId) {
      quest = await LmsGame.findAll({
        where: {
          gameExtensionId: ext.gameExtensionId,
        },
      });
    }
    if (!quest)
      return res
        .status(404)
        .json({ status: "Failure", error: "Questions Not Found" });

    const data = await LmsBlocks.findAll({ where: { blockGameId: id } });
    if (!data)
      return res
        .status(404)
        .json({ status: "Failure", error: "File not found" });
    return res.status(200).json({
      status: "Success",
      message: "File not found",
      data: data,
      quest: quest,
    });
  } catch (error) {
    return res.status(500).json({
      status: "Failure",
      message: "Internal Server Error",
      err: error.message,
    });
  }
};
const uploadBadge = async (req, res) => {
  try {
    const file = req.file;
    if (!file)
      return res
        .status(404)
        .json({ status: "Failure", error: "File not found" });
    const path = {};
    path.gasAssetImage = storageLocations.badges + file.filename;
    path.gasAssetType = 4;
    path.gasCreatedUserId = req.user.user.id;
    path.gasCreatedDate = Date.now();
    path.gasAssetName = req.body.gasAssertName;
    path.gasStatus = "Active";
    path.gasDeleteStatus = "NO";
    path.gasIpAddress = req.connection.remoteAddress;
    path.gasUserAgent = req.headers["user-agent"];
    path.gasDeviceType = req.device.type;
    const data = await LmsGameAssets.create(path);
    if (!data)
      return res
        .status(404)
        .json({ status: "Failure", error: "File not found" });
    return res
      .status(200)
      .json({ status: "Success", message: "File not found", data: data });
  } catch (error) {
    res.status(500).json({
      status: "Failure",
      message: "Internal Server Error",
      err: error.message,
    });
  }
};
const uploadIntroMusic = async (req, res) => {
  try {
    const file = req.file;
    if (!file)
      return res
        .status(404)
        .json({ status: "Failure", error: "File not found" });
    const path = {};
    path.gasAssetImage = storageLocations.badges + file.filename;
    path.gasAssetType = 7;
    path.gasCreatedUserId = req.user?.user?.id;
    path.gasCreatedDate = Date.now();
    path.gasAssetName = req.body.gasAssetName;
    path.gasStatus = "Active";
    path.gasDeleteStatus = "NO";
    path.gasIpAddress = req.connection.remoteAddress;
    path.gasUserAgent = req.headers["user-agent"];
    path.gasDeviceType = req.device.type;
    const data = await LmsGameAssets.create(path);
    if (!data)
      return res
        .status(404)
        .json({ status: "Failure", error: "File not found" });
    return res
      .status(200)
      .json({ status: "Success", message: "Audio not found", data: data });
  } catch (error) {
    return res.status(500).json({
      status: "Failure",
      message: "Internal Server Error",
      err: error.message,
    });
  }
};
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
    return res.status(500).json({
      status: "Failure",
      message: "Internal Server Error6",
      err: error.message,
    });
  }
};

const old = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const alp = data.alphabet;
    const inputFiled = data.input;
    const alpArray = Object.values(alp);
    let setArray = [];
    const items = data.items;
    const interactionBlock = data?.interactionBlock ?? null;

    // Use map to get the 'input' property from each object in the array
    const itemsNames = items.map((it) => it.input);

    // Convert the array of tag names into a string

    //main block tabel
    const countNotIn = await LmsBlocks.count({
      where: {
        blockGameId: id,
        blockSecondaryId: {
          [Op.notIn]: itemsNames,
        },
        blockQuestNo: items[0].questNo,
      },
    });
    //not in data
    const notInData = await LmsBlocks.findAll({
      attributes: ["blockId"],
      where: {
        blockGameId: id,
        blockSecondaryId: {
          [Op.notIn]: itemsNames,
        },
        blockQuestNo: items[0].questNo,
      },
    });
    const InData = await LmsBlocks.findAll({
      attributes: ["blockId"],
      where: {
        blockGameId: id,
        blockSecondaryId: {
          [Op.in]: itemsNames,
        },
        blockQuestNo: items[0].questNo,
      },
    });
    blockIn = InData.map((IN) => IN.blockId);
    blockNotIn = notInData.map((NOT) => NOT.blockId);
    // return res.status(500).json({ status: "Failure",message: "Internal Server Error6",err: blockNotIn});
    if (countNotIn > 0) {
      await LmsBlocks.update(
        { blockDeleteStatus: "YES" },
        {
          where: {
            blockGameId: id,
            blockSecondaryId: { [Op.notIn]: itemsNames },
            blockQuestNo: items[0].questNo,
          },
        }
      );
      await lmsQuestionOptions.update(
        { qpDeleteStatus: "YES" },
        {
          where: {
            qpGameId: id,
            qpQuestionId: { [Op.in]: blockNotIn },
            qpQuestNo: items[0].questNo,
          },
        }
      );
    }
    await LmsBlocks.update(
      { blockDeleteStatus: "NO" },
      {
        where: {
          blockGameId: id,
          blockSecondaryId: { [Op.in]: itemsNames },
          blockQuestNo: items[0].questNo,
        },
      }
    );

    await lmsQuestionOptions.update(
      { qpDeleteStatus: "NO" },
      {
        where: {
          qpGameId: id,
          qpQuestionId: { [Op.in]: blockIn },
          qpQuestNo: items[0].questNo,
        },
      }
    );

    // return res.status(500).json({ status: 'Failures', error: alpvalues });
    for (const item of items) {
      const findtypeNumber = item.type + item.input;

      // Check if inputFiled is an object and has the key findtypeNumber
      if (
        typeof inputFiled === "object" &&
        inputFiled.hasOwnProperty(findtypeNumber)
      ) {
        const foundItem = inputFiled[findtypeNumber];

        const Exitist = await LmsBlocks.findOne({
          where: {
            blockGameId: id,
            blockSecondaryId: item.input,
            blockQuestNo: item.questNo,
          },
        });
        if (item.type == "Note") {
          if (Exitist) {
            const deleteOption = await lmsQuestionOptions.destroy({
              where: {
                qpQuestionId: Exitist.blockId,
              },
            });
            const result = await LmsBlocks.update(
              {
                blockGameId: id,
                blockQuestNo: item.questNo,
                blockSecondaryId: item.input,
                blockPrimarySequence: item.id,
                blockDragSequence: foundItem.id,
                blockChoosen: item.type,
                blockText: foundItem.note,
                blockAssetId: null,
                blockSkillTag: null,
                blockTitleTag: null,
                blockRoll: "Narrator",
                blockVoiceGender: null,
                blockVoiceEmotions: null,
                blockCreatedDatetime: Date.now(),
                blockVoiceAccents: null,
                blockCharacterposesId: null,
                blockAnimationId: null,
                blockDeleteStatus: "NO",
                blockActiveStatus: "Active",
                blockIpAddress: req.connection.remoteAddress,
                blockDeviceType: req.device.type,
                blockUserAgent: req.headers["user-agent"],
                blockLeadTo: foundItem?.Notenavigate ?? null,
                blockShowNavigate: foundItem?.NoteleadShow ?? null,
              },
              {
                where: {
                  blockGameId: id,
                  blockSecondaryId: item.input,
                  blockQuestNo: item.questNo,
                },
              }
            );

            setArray.push(result);
          } else {
            const result = await LmsBlocks.create({
              blockGameId: id,
              blockQuestNo: item.questNo,
              blockSecondaryId: item.input,
              blockPrimarySequence: item.id,
              blockDragSequence: foundItem.id,
              blockChoosen: item.type,
              blockText: foundItem.note,
              blockAssetId: null,
              blockSkillTag: null,
              blockTitleTag: null,
              blockRoll: "Narrator",
              blockVoiceGender: null,
              blockVoiceEmotions: null,
              blockCreatedDatetime: Date.now(),
              blockVoiceAccents: null,
              blockCharacterposesId: null,
              blockAnimationId: null,
              blockDeleteStatus: "NO",
              blockActiveStatus: "Active",
              blockIpAddress: req.connection.remoteAddress,
              blockDeviceType: req.device.type,
              blockUserAgent: req.headers["user-agent"],
              blockLeadTo: foundItem?.Notenavigate ?? null,
              blockShowNavigate: foundItem?.NoteleadShow ?? null,
            });

            setArray.push(result);
          }
        }

        if (item.type == "Dialog") {
          if (Exitist) {
            const deleteOption = await lmsQuestionOptions.destroy({
              where: {
                qpQuestionId: Exitist.blockId,
              },
            });

            const result = await LmsBlocks.update(
              {
                blockGameId: id,
                blockQuestNo: item.questNo,
                blockSecondaryId: item.input,
                blockPrimarySequence: item.id,
                blockDragSequence: foundItem.id,
                blockChoosen: item.type,
                blockText: foundItem.dialog,
                blockAssetId: null,
                blockSkillTag: null,
                blockTitleTag: null,
                blockRoll: foundItem.character,
                blockVoiceGender: null,
                blockVoiceEmotions: foundItem.voice,
                blockCreatedDatetime: Date.now(),
                blockVoiceAccents: null,
                blockCharacterposesId: foundItem.animation,
                blockAnimationId: null,
                blockDeleteStatus: "NO",
                blockActiveStatus: "Active",
                blockIpAddress: req.connection.remoteAddress,
                blockDeviceType: req.device.type,
                blockUserAgent: req.headers["user-agent"],
                blockLeadTo: foundItem?.Dialognavigate ?? null,
                blockShowNavigate: foundItem?.DialogleadShow ?? null,
              },
              {
                where: {
                  blockGameId: id,
                  blockSecondaryId: item.input,
                  blockQuestNo: item.questNo,
                },
              }
            );

            setArray.push(result);
          } else {
            const result = await LmsBlocks.create({
              blockGameId: id,
              blockQuestNo: item.questNo,
              blockSecondaryId: item.input,
              blockPrimarySequence: item.id,
              blockDragSequence: foundItem.id,
              blockChoosen: item.type,
              blockText: foundItem.dialog,
              blockAssetId: null,
              blockSkillTag: null,
              blockTitleTag: null,
              blockRoll: foundItem.character,
              blockVoiceGender: null,
              blockVoiceEmotions: null,
              blockCreatedDatetime: Date.now(),
              blockVoiceAccents: null,
              blockCharacterposesId: foundItem.animation,
              blockAnimationId: null,
              blockDeleteStatus: "NO",
              blockActiveStatus: "Active",
              blockIpAddress: req.connection.remoteAddress,
              blockDeviceType: req.device.type,
              blockUserAgent: req.headers["user-agent"],
              blockLeadTo: foundItem?.Dialognavigate ?? null,
              blockShowNavigate: foundItem?.DialogleadShow ?? null,
            });

            setArray.push(result);
          }
        }

        if (item.type == "Interaction") {
          let result;
          if (Exitist) {
            const results = await LmsBlocks.update(
              {
                blockGameId: id,
                blockQuestNo: item.questNo,
                blockSecondaryId: item.input,
                blockPrimarySequence: item.id,
                blockDragSequence: foundItem.id,
                blockChoosen: item.type,
                blockText: foundItem.interaction,
                blockAssetId: null,
                blockSkillTag: foundItem.SkillTag ?? null,
                blockTitleTag: foundItem.quesionTitle,
                blockRoll: foundItem.blockRoll,
                blockResponseRoll: foundItem.responseRoll,
                blockVoiceGender: null,
                blockVoiceEmotions: foundItem.QuestionsVoice ?? null,
                blockCreatedDatetime: Date.now(),
                blockVoiceAccents: null,
                blockCharacterposesId: foundItem.QuestionsEmotion,
                blockAnimationId: null,
                blockDeleteStatus: "NO",
                blockActiveStatus: "Active",
                blockIpAddress: req.connection.remoteAddress,
                blockDeviceType: req.device.type,
                blockUserAgent: req.headers["user-agent"],
              },
              {
                where: {
                  blockGameId: id,
                  blockSecondaryId: item.input,
                  blockQuestNo: item.questNo,
                },
                returning: true, // This option is used to get the updated rows
              }
            );
            if (results) {
              //1998

              result = await LmsBlocks.findOne({
                where: {
                  blockGameId: id,
                  blockSecondaryId: item.input,
                  blockQuestNo: item.questNo,
                },
              });
            }

            if (results) {
              setArray.push("result" + result.blockId);
              const objectsWithId1_1 = alpArray.filter(
                (obj) => obj.seqs === item.id
              );
              // sub question tabel
              const alpvalues = objectsWithId1_1.map((al) => al.secondaryId);

              const countaplNotIn = await lmsQuestionOptions.count({
                where: {
                  qpQuestionId: result.blockId,
                  qpSecondaryId: {
                    [Op.notIn]: alpvalues,
                  },
                },
              });

              if (countaplNotIn > 0) {
                await lmsQuestionOptions.update(
                  { qpDeleteStatus: "YES" },
                  {
                    where: {
                      qpQuestionId: result.blockId,
                      qpSecondaryId: { [Op.notIn]: alpvalues },
                    },
                  }
                );
              }

              //
              for (const object of objectsWithId1_1) {
                const beforeKey = object.option;
                const key = beforeKey.replace(/'/g, "");

                try {
                  if (interactionBlock) {
                  }

                  const responseEmotion =
                    foundItem?.responseemotionObject?.[key] ?? "";
                  const NextOption = foundItem?.navigateObjects?.[key] ?? "";
                  const NavigateShow =
                    foundItem?.navigateshowObjects?.[key] ?? "";
                  const Emotion = foundItem?.optionsemotionObject?.[key] ?? "";
                  const Voice = foundItem?.optionsvoiceObject?.[key] ?? "";
                  const TitleTag = foundItem?.optionTitleObject?.[key] ?? "";
                  const Score =
                    foundItem?.scoreObject?.[key] === "" ||
                    isNaN(foundItem?.scoreObject?.[key])
                      ? null
                      : Number(foundItem?.scoreObject?.[key]);
                  const Feedback = foundItem?.feedbackObject?.[key] ?? "";
                  const Response = foundItem?.responseObject?.[key] ?? "";
                  const OptionText = foundItem?.optionsObject?.[key] ?? "";

                  setArray.push(object.secondaryId);

                  const OptionExitist = await lmsQuestionOptions.findOne({
                    where: {
                      qpQuestionId: result.blockId,
                      qpSecondaryId: object.secondaryId,
                      qpQuestNo: result.blockQuestNo,
                      qpGameId: id,
                      qpDeleteStatus: "NO",
                    },
                  });

                  let options = "";
                  if (OptionExitist) {
                    setArray.push("OptionExitist" + key);
                    options = await lmsQuestionOptions.update(
                      {
                        qpGameId: id,

                        qpQuestionId: result.blockId,
                        qpQuestNo: result.blockQuestNo,
                        qpSecondaryId: object.secondaryId,
                        qpOptions: key,
                        qpSequence: object.seqs,
                        qpOptionText: OptionText,
                        qpResponse: Response,
                        qpTag:
                          foundItem?.ansObject[key] == true ||
                          foundItem?.ansObject[key] == "true"
                            ? "true"
                            : "false",
                        qpFeedback: Feedback, // Corrected line
                        qpSkillTag: null,
                        qpScore: Score,
                        qpTitleTag: TitleTag,
                        qpEmotion: Emotion,
                        qpVoice: Voice,
                        qpResponseEmotion: responseEmotion,
                        qpBlockSecondaryId: item.input,
                        qpNextOption: NextOption,
                        qpNavigateShow: NavigateShow,
                        qpCreatedDatetime: Date.now(),
                        qpEditedDatetime: Date.now(),
                        qpDeleteStatus: "NO",
                        qpActiveStatus: "Yes",
                        qpIpAddress: req.connection.remoteAddress,
                        qpUserAgent: req.headers["user-agent"],
                        qpDeviceType: req.device.type,
                      },
                      {
                        where: {
                          qpQuestionId: result.blockId,
                          qpSecondaryId: object.secondaryId,
                          qpQuestNo: result.blockQuestNo,
                          qpGameId: id,
                        },
                      }
                    );

                    setArray.push(options);
                  } else {
                    setArray.push(
                      "OptionExitist not" +
                        result.blockId +
                        "---" +
                        object.secondaryId
                    );

                    options = await lmsQuestionOptions.create({
                      qpGameId: id,
                      qpQuestionId: result.blockId,
                      qpQuestNo: result.blockQuestNo,
                      qpSecondaryId: object.secondaryId,
                      qpOptions: key,
                      qpSequence: object.seqs,
                      qpOptionText: OptionText,
                      qpResponse: Response,
                      qpTag:
                        foundItem?.ansObject[key] == "true" ? "true" : "false",
                      qpFeedback: Feedback, // Corrected line
                      qpSkillTag: null,
                      qpScore: Score,
                      qpTitleTag: TitleTag,
                      qpEmotion: Emotion,
                      qpVoice: Voice,
                      qpResponseEmotion: responseEmotion,
                      qpBlockSecondaryId: item.input,
                      qpNextOption: NextOption,
                      qpNavigateShow: NavigateShow,
                      qpCreatedDatetime: Date.now(),
                      qpEditedDatetime: Date.now(),
                      qpDeleteStatus: "NO",
                      qpActiveStatus: "Yes",
                      qpIpAddress: req.connection.remoteAddress,
                      qpUserAgent: req.headers["user-agent"],
                      qpDeviceType: req.device.type,
                    });

                    if (options) {
                    } else {
                      return res
                        .status(500)
                        .json({ status: "Failure", error: error.message });
                    }
                  }

                  if (options) {
                  } else {
                    return res
                      .status(500)
                      .json({ status: "Failure", error: error.message });
                  }
                } catch (error) {
                  // Handle the error within the loop
                  // console.error('Error within loop:', error.message);

                  // Return an appropriate response or handle the error as needed
                  return res
                    .status(500)
                    .json({ status: "Failure", error: error.message });
                }
              }
            }

            setArray.push(result);
          } else {
            const result = await LmsBlocks.create({
              blockGameId: id,
              blockQuestNo: item.questNo,
              blockSecondaryId: item.input,
              blockPrimarySequence: item.id,
              blockDragSequence: foundItem.id,
              blockChoosen: item.type,
              blockText: foundItem.interaction,
              blockAssetId: null,
              blockSkillTag: foundItem.SkillTag ?? null,
              blockTitleTag: foundItem.quesionTitle,
              blockRoll: foundItem.blockRoll,
              blockResponseRoll: foundItem.responseRoll,
              blockVoiceGender: null,
              blockVoiceEmotions: foundItem.QuestionsVoice ?? null,
              blockCreatedDatetime: Date.now(),
              blockVoiceAccents: null,
              blockCharacterposesId: foundItem.QuestionsEmotion,
              blockAnimationId: null,
              blockDeleteStatus: "NO",
              blockActiveStatus: "Active",
              blockIpAddress: req.connection.remoteAddress,
              blockDeviceType: req.device.type,
              blockUserAgent: req.headers["user-agent"],
            });
            if (result) {
              const objectsWithId1_1 = alpArray.filter(
                (obj) => obj.seqs === item.id
              );
              // sub question tabel
              const alpvalues = objectsWithId1_1.map((al) => al.secondaryId);

              const countaplNotIn = await lmsQuestionOptions.count({
                where: {
                  qpQuestionId: result.blockId,
                  qpSecondaryId: {
                    [Op.notIn]: alpvalues,
                  },
                },
              });

              if (countaplNotIn > 0) {
                await lmsQuestionOptions.update(
                  { qpDeleteStatus: "YES" },
                  {
                    where: {
                      qpQuestionId: result.blockId,
                      qpSecondaryId: { [Op.notIn]: alpvalues },
                    },
                  }
                );
              }

              //
              for (const object of objectsWithId1_1) {
                const beforeKey = object.option;
                const key = beforeKey.replace(/'/g, "");
                try {
                  setArray.push(key);

                  const responseEmotion =
                    foundItem?.responseemotionObject?.[key] ?? "";
                  const NextOption = foundItem?.navigateObjects?.[key] ?? "";
                  const NavigateShow =
                    foundItem?.navigateshowObjects?.[key] ?? "";
                  const Emotion = foundItem?.optionsemotionObject?.[key] ?? "";
                  const Voice = foundItem?.optionsvoiceObject?.[key] ?? "";
                  const TitleTag = foundItem?.optionTitleObject?.[key] ?? "";
                  const Score =
                    foundItem?.scoreObject?.[key] === "" ||
                    isNaN(foundItem?.scoreObject?.[key])
                      ? null
                      : Number(foundItem?.scoreObject?.[key]);
                  const Feedback = foundItem?.feedbackObject?.[key] ?? "";
                  const Response = foundItem?.responseObject?.[key] ?? "";
                  const OptionText = foundItem?.optionsObject?.[key] ?? "";

                  const OptionExitist = await lmsQuestionOptions.findOne({
                    where: {
                      qpQuestionId: result.blockId,
                      qpSecondaryId: object.secondaryId,
                      qpQuestNo: result.blockQuestNo,
                      qpGameId: id,
                      qpDeleteStatus: "NO",
                    },
                  });

                  let options = "";
                  if (OptionExitist) {
                    setArray.push("OptionExitist");
                    options = await lmsQuestionOptions.update(
                      {
                        qpGameId: id,
                        qpQuestionId: result.blockId,
                        qpQuestNo: result.blockQuestNo,
                        qpSecondaryId: object.secondaryId,
                        qpOptions: key,
                        qpSequence: object.seqs,
                        qpOptionText: OptionText,
                        qpResponse: Response,
                        qpTag:
                          foundItem?.ansObject[key] == "true"
                            ? "true"
                            : "false",
                        qpFeedback: Feedback, // Corrected line
                        qpSkillTag: null,
                        qpScore: Score,
                        qpTitleTag: TitleTag,
                        qpEmotion: Emotion,
                        qpVoice: Voice,
                        qpResponseEmotion: responseEmotion,
                        qpBlockSecondaryId: item.input,
                        qpNextOption: NextOption,
                        qpNavigateShow: NavigateShow,
                        qpCreatedDatetime: Date.now(),
                        qpEditedDatetime: Date.now(),
                        qpDeleteStatus: "NO",
                        qpActiveStatus: "Yes",
                        qpIpAddress: req.connection.remoteAddress,
                        qpUserAgent: req.headers["user-agent"],
                        qpDeviceType: req.device.type,
                      },
                      {
                        where: {
                          qpQuestionId: result.blockId,
                          qpSecondaryId: object.secondaryId,
                          qpQuestNo: result.blockQuestNo,
                          qpGameId: id,
                        },
                      }
                    );
                  } else {
                    setArray.push("create");
                    options = await lmsQuestionOptions.create({
                      qpGameId: id,
                      qpQuestionId: result.blockId,
                      qpQuestNo: result.blockQuestNo,
                      qpSecondaryId: object.secondaryId,
                      qpOptions: key,
                      qpSequence: object.seqs,
                      qpOptionText: OptionText,
                      qpResponse: Response,
                      qpTag:
                        foundItem?.ansObject[key] == true ||
                        foundItem?.ansObject[key] == "true"
                          ? "true"
                          : "false",
                      qpFeedback: Feedback, // Corrected line
                      qpSkillTag: null,
                      qpScore: Score,
                      qpTitleTag: TitleTag,
                      qpEmotion: Emotion,
                      qpVoice: Voice,
                      qpResponseEmotion: responseEmotion,
                      qpBlockSecondaryId: item.input,
                      qpNextOption: NextOption,
                      qpNavigateShow: NavigateShow,
                      qpCreatedDatetime: Date.now(),
                      qpEditedDatetime: Date.now(),
                      qpDeleteStatus: "NO",
                      qpActiveStatus: "Yes",
                      qpIpAddress: req.connection.remoteAddress,
                      qpUserAgent: req.headers["user-agent"],
                      qpDeviceType: req.device.type,
                    });
                  }
                } catch (error) {
                  // Handle the error within the loop
                  // console.error('Error within loop:', error.message);

                  // Return an appropriate response or handle the error as needed
                  return res
                    .status(500)
                    .json({ status: "Failure", error: error.message });
                }
              }

              setArray.push("result");
            }
          }
        }
      } else {
        setArray.push(null);
      }
    }

    return res.status(200).json({ status: "Success", setArray });
  } catch (error) {
    // console.error(error);
    return res.status(500).json({ status: "Failure", error: error.message });
  }
};
const StroyInserting = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const alp = data.alphabet;
    const inputFiled = data.input;
    const alpArray = Object.values(alp);
    let setArray = [];
    const items = data.items;
    const interactionBlock = data?.interactionBlock ?? null;
    const transulateId = parseInt(data.transulateId);
    
    // Use map to get the 'input' property from each object in the array
    const itemsNames = items.map((it) => it.input);

    // Convert the array of tag names into a string

    //main block tabel
    const countNotIn = await LmsBlocks.count({
      where: {
        blockGameId: id,
        blockSecondaryId: {
          [Op.notIn]: itemsNames,
        },
        blockQuestNo: items[0].questNo,
      },
    });
    //not in data
    const notInData = await LmsBlocks.findAll({
      attributes: ["blockId"],
      where: {
        blockGameId: id,
        blockSecondaryId: {
          [Op.notIn]: itemsNames,
        },
        blockQuestNo: items[0].questNo,
      },
    });
    const InData = await LmsBlocks.findAll({
      attributes: ["blockId"],
      where: {
        blockGameId: id,
        blockSecondaryId: {
          [Op.in]: itemsNames,
        },
        blockQuestNo: items[0].questNo,
      },
    });
    blockIn = InData.map((IN) => IN.blockId);
    blockNotIn = notInData.map((NOT) => NOT.blockId);
    // return res.status(500).json({ status: "Failure",message: "Internal Server Error6",err: blockNotIn});
    if (countNotIn > 0) {
      await LmsBlocks.update(
        { blockDeleteStatus: "YES" },
        {
          where: {
            blockGameId: id,
            blockSecondaryId: { [Op.notIn]: itemsNames },
            blockQuestNo: items[0].questNo,
          },
        }
      );
      await lmsQuestionOptions.update(
        { qpDeleteStatus: "YES" },
        {
          where: {
            qpGameId: id,
            qpQuestionId: { [Op.in]: blockNotIn },
            qpQuestNo: items[0].questNo,
          },
        }
      );
    }
    await LmsBlocks.update(
      { blockDeleteStatus: "NO" },
      {
        where: {
          blockGameId: id,
          blockSecondaryId: { [Op.in]: itemsNames },
          blockQuestNo: items[0].questNo,
        },
      }
    );

    await lmsQuestionOptions.update(
      { qpDeleteStatus: "NO" },
      {
        where: {
          qpGameId: id,
          qpQuestionId: { [Op.in]: blockIn },
          qpQuestNo: items[0].questNo,
        },
      }
    );

    // return res.status(500).json({ status: 'Failures', error: alpvalues });
    for (const item of items) {
      const findtypeNumber = item.type + item.input;

      // Check if inputFiled is an object and has the key findtypeNumber
      if (
        typeof inputFiled === "object" &&
        inputFiled.hasOwnProperty(findtypeNumber)
      ) {
        const foundItem = inputFiled[findtypeNumber];

        const Exitist = await LmsBlocks.findOne({
          where: {
            blockGameId: id,
            blockSecondaryId: item.input,
            blockQuestNo: item.questNo,
          },
        });
        if (item.type == "Note") {
          
          if (Exitist) {
            const deleteOption = await lmsQuestionOptions.destroy({
              where: {
                qpQuestionId: Exitist.blockId,
              },
            });
            const result = await LmsBlocks.update(
              {
                blockGameId: id,
                blockQuestNo: item.questNo,
                blockSecondaryId: item.input,
                blockPrimarySequence: item.id,
                blockDragSequence: foundItem.id,
                blockChoosen: item.type,
                ...(transulateId === 1
                  ? { blockText: foundItem.note}
                  : {}),

             
                // blockText: transulateId === 1 ? foundItem.note : await StoryUpdate(id, transulateId, foundItem.note),
                // blockText: foundItem.note,
                blockAssetId: null,
                blockSkillTag: null,
                blockTitleTag: null,
                blockRoll: "Narrator",
                blockVoiceGender: null,
                blockVoiceEmotions: null,
                blockCreatedDatetime: Date.now(),
                blockVoiceAccents: null,
                blockCharacterposesId: null,
                blockAnimationId: null,
                blockDeleteStatus: "NO",
                blockActiveStatus: "Active",
                blockIpAddress: req.connection.remoteAddress,
                blockDeviceType: req.device.type,
                blockUserAgent: req.headers["user-agent"],
                blockLeadTo: foundItem?.Notenavigate ?? null,
                blockShowNavigate: foundItem?.NoteleadShow ?? null,
              },
              {
                where: {
                  blockGameId: id,
                  blockSecondaryId: item.input,
                  blockQuestNo: item.questNo,
                },
              }
            );
          
            if(transulateId !== 1){

              await StoryUpdate(id, transulateId, Exitist.blockId, 'blockText',  foundItem.note, 'LmsBlocks')
             
            }
           
            setArray.push(result);
          } else {
          
            const result = await LmsBlocks.create({
              blockGameId: id,
              blockQuestNo: item.questNo,
              blockSecondaryId: item.input,
              blockPrimarySequence: item.id,
              blockDragSequence: foundItem.id,
              blockChoosen: item.type,
              blockText:transulateId === 1 ?  foundItem.note : /*await Englishcoversion(transulateId,foundItem.note)*/'This Content Cannot Be Translated Into English.',
            

              // blockText: foundItem.note,
              blockAssetId: null,
              blockSkillTag: null,
              blockTitleTag: null,
              blockRoll: "Narrator",
              blockVoiceGender: null,
              blockVoiceEmotions: null,
              blockCreatedDatetime: Date.now(),
              blockVoiceAccents: null,
              blockCharacterposesId: null,
              blockAnimationId: null,
              blockDeleteStatus: "NO",
              blockActiveStatus: "Active",
              blockIpAddress: req.connection.remoteAddress,
              blockDeviceType: req.device.type,
              blockUserAgent: req.headers["user-agent"],
              blockLeadTo: foundItem?.Notenavigate ?? null,
              blockShowNavigate: foundItem?.NoteleadShow ?? null,
            });
            if(transulateId !== 1){

              const TEST = await StoryUpdate(id, transulateId, result.blockId, 'blockText', foundItem.note, 'LmsBlocks')
             console.log('LOkie129',TEST);
            }
            setArray.push(result);
          }
        }

        if (item.type == "Dialog") {
          if (Exitist) {
            const deleteOption = await lmsQuestionOptions.destroy({
              where: {
                qpQuestionId: Exitist.blockId,
              },
            });

            const result = await LmsBlocks.update(
              {
                blockGameId: id,
                blockQuestNo: item.questNo,
                blockSecondaryId: item.input,
                blockPrimarySequence: item.id,
                blockDragSequence: foundItem.id,
                blockChoosen: item.type,
                
                ...(transulateId === 1
                  ? { blockText: foundItem.dialog}
                  : {}),
                // blockText: foundItem.dialog,
                blockAssetId: null,
                blockSkillTag: null,
                blockTitleTag: null,
                blockRoll: foundItem.character,
                blockVoiceGender: null,
                blockVoiceEmotions: foundItem.voice,
                blockCreatedDatetime: Date.now(),
                blockVoiceAccents: null,
                blockCharacterposesId: foundItem.animation,
                blockAnimationId: null,
                blockDeleteStatus: "NO",
                blockActiveStatus: "Active",
                blockIpAddress: req.connection.remoteAddress,
                blockDeviceType: req.device.type,
                blockUserAgent: req.headers["user-agent"],
                blockLeadTo: foundItem?.Dialognavigate ?? null,
                blockShowNavigate: foundItem?.DialogleadShow ?? null,
              },
              {
                where: {
                  blockGameId: id,
                  blockSecondaryId: item.input,
                  blockQuestNo: item.questNo,
                },
              }
            );
           
            if(transulateId !== 1){
              await StoryUpdate(id, transulateId, Exitist.blockId, 'blockText',  foundItem.dialog, 'LmsBlocks')
            
            }
            setArray.push(result);
          } else {
            const result = await LmsBlocks.create({
              blockGameId: id,
              blockQuestNo: item.questNo,
              blockSecondaryId: item.input,
              blockPrimarySequence: item.id,
              blockDragSequence: foundItem.id,
              blockChoosen: item.type,
              blockText:transulateId === 1 ? foundItem.dialog : /*await Englishcoversion(transulateId,foundItem.dialog) }*/'This Content Cannot Be Translated Into English.',
              // blockText: foundItem.dialog,
              blockAssetId: null,
              blockSkillTag: null,
              blockTitleTag: null,
              blockRoll: foundItem.character,
              blockVoiceGender: null,
              blockVoiceEmotions: null,
              blockCreatedDatetime: Date.now(),
              blockVoiceAccents: null,
              blockCharacterposesId: foundItem.animation,
              blockAnimationId: null,
              blockDeleteStatus: "NO",
              blockActiveStatus: "Active",
              blockIpAddress: req.connection.remoteAddress,
              blockDeviceType: req.device.type,
              blockUserAgent: req.headers["user-agent"],
              blockLeadTo: foundItem?.Dialognavigate ?? null,
              blockShowNavigate: foundItem?.DialogleadShow ?? null,
            });
            if(transulateId !== 1){

              await StoryUpdate(id, transulateId, result.blockId, 'blockText',  foundItem.dialog, 'LmsBlocks')
             
            }
            setArray.push(result);
          }
        }
      
        if (item.type == "Interaction") {
        
          let result;
          if (Exitist) {
            const results = await LmsBlocks.update(
              {
                blockGameId: id,
                blockQuestNo: item.questNo,
                blockSecondaryId: item.input,
                blockPrimarySequence: item.id,
                blockDragSequence: foundItem.id,
                blockChoosen: item.type,
               ...(transulateId === 1
                    ? { blockText: foundItem.interaction}
                    : {}),
                blockAssetId: null,
                blockSkillTag: foundItem.SkillTag ?? null,
                blockTitleTag: foundItem.quesionTitle,
                blockRoll: foundItem.blockRoll,
                blockResponseRoll: foundItem.responseRoll,
                blockVoiceGender: null,
                blockVoiceEmotions: foundItem.QuestionsVoice ?? null,
                blockCreatedDatetime: Date.now(),
                blockVoiceAccents: null,
                blockCharacterposesId: foundItem.QuestionsEmotion,
                blockAnimationId: null,
                blockDeleteStatus: "NO",
                blockActiveStatus: "Active",
                blockIpAddress: req.connection.remoteAddress,
                blockDeviceType: req.device.type,
                blockUserAgent: req.headers["user-agent"],
              },
              {
                where: {
                  blockGameId: id,
                  blockSecondaryId: item.input,
                  blockQuestNo: item.questNo,
                },
                returning: true, // This option is used to get the updated rows
              }
            );
           
            if (results) {
              //1998

              result = await LmsBlocks.findOne({
                where: {
                  blockGameId: id,
                  blockSecondaryId: item.input,
                  blockQuestNo: item.questNo,
                },
              });
            }

            if (results) {
             
              setArray.push("result" + result.blockId);
              const objectsWithId1_1 = alpArray.filter(
                (obj) => obj.seqs === item.id
              );
              // sub question tabel
              const alpvalues = objectsWithId1_1.map((al) => al.secondaryId);

              const countaplNotIn = await lmsQuestionOptions.count({
                where: {
                  qpQuestionId: result.blockId,
                  qpSecondaryId: {
                    [Op.notIn]: alpvalues,
                  },
                },
              });

              if (countaplNotIn > 0) {
                await lmsQuestionOptions.update(
                  { qpDeleteStatus: "YES" },
                  {
                    where: {
                      qpQuestionId: result.blockId,
                      qpSecondaryId: { [Op.notIn]: alpvalues },
                    },
                  }
                );
              }

              //
              for (const object of objectsWithId1_1) {
                const beforeKey = object.option;
                const key = beforeKey.replace(/'/g, "");

                try {
                  if (interactionBlock) {
                  }

                  const responseEmotion =
                    foundItem?.responseemotionObject?.[key] ?? "";
                  const NextOption = foundItem?.navigateObjects?.[key] ?? "";
                  const NavigateShow =
                    foundItem?.navigateshowObjects?.[key] ?? "";
                  const Emotion = foundItem?.optionsemotionObject?.[key] ?? "";
                  const Voice = foundItem?.optionsvoiceObject?.[key] ?? "";
                  const TitleTag = foundItem?.optionTitleObject?.[key] ?? "";
                  const Score =
                    foundItem?.scoreObject?.[key] === "" ||
                    isNaN(foundItem?.scoreObject?.[key])
                      ? null
                      : Number(foundItem?.scoreObject?.[key]);
                  const Feedback = foundItem?.feedbackObject?.[key] ?? "";
                  const Response = foundItem?.responseObject?.[key] ?? "";
                  const OptionText = foundItem?.optionsObject?.[key] ?? "";

                  setArray.push(object.secondaryId);

                  const OptionExitist = await lmsQuestionOptions.findOne({
                    where: {
                      qpQuestionId: result.blockId,
                      qpSecondaryId: object.secondaryId,
                      qpQuestNo: result.blockQuestNo,
                      qpGameId: id,
                      qpDeleteStatus: "NO",
                    
                    },
                  });

                  let options = "";
                  if (OptionExitist) {
                    setArray.push("OptionExitist" + key);
                    options = await lmsQuestionOptions.update(
                      {
                        qpGameId: id,

                        // qpQuestionId: result.blockId,
                        ...(transulateId === 1
                          ? { qpQuestionId: result.blockId}
                          : {}),
                        qpQuestNo: result.blockQuestNo,
                        qpSecondaryId: object.secondaryId,
                        qpOptions: key,
                        qpSequence: object.seqs,
                        // qpOptionText: OptionText,
                        ...(transulateId === 1
                          ? { qpOptionText: OptionText}
                          : {}),
                        // qpResponse: Response,
                        ...(transulateId === 1
                          ? { qpResponse: Response}
                          : {}),
                        qpTag:
                          foundItem?.ansObject[key] == true ||
                          foundItem?.ansObject[key] == "true"
                            ? "true"
                            : "false",
                        // qpFeedback: Feedback, // Corrected line
                        ...(transulateId === 1
                          ? { qpFeedback: Feedback}
                          : {}),

                        qpSkillTag: null,
                        qpScore: Score,
                        qpTitleTag: TitleTag,
                        qpEmotion: Emotion,
                        qpVoice: Voice,
                        qpResponseEmotion: responseEmotion,
                        qpBlockSecondaryId: item.input,
                        qpNextOption: NextOption,
                        qpNavigateShow: NavigateShow,
                        qpCreatedDatetime: Date.now(),
                        qpEditedDatetime: Date.now(),
                        qpDeleteStatus: "NO",
                        qpActiveStatus: "Yes",
                        qpIpAddress: req.connection.remoteAddress,
                        qpUserAgent: req.headers["user-agent"],
                        qpDeviceType: req.device.type,
                      },
                      {
                        where: {
                          qpQuestionId: result.blockId,
                          qpSecondaryId: object.secondaryId,
                          qpQuestNo: result.blockQuestNo,
                          qpGameId: id,
                        },
                      }
                    );
                    // pavi work 21-05-2024
                    if(transulateId !== 1){
                  
                      if(OptionText){
                        await StoryUpdate(id, transulateId, Exitist.blockId, 'qpOptions',OptionText, 'lmsQuestionOptions')

                      }
                      if(Response){
                        await StoryUpdate(id, transulateId, Exitist.blockId, 'qpResponse',Response, 'lmsQuestionOptions')
                      }
                      if(Feedback){
                        await StoryUpdate(id, transulateId, Exitist.blockId, 'qpFeedback',Feedback, 'lmsQuestionOptions')
                      }
                    }
                    setArray.push(options);
                  } else {
                    setArray.push(
                      "OptionExitist not" +
                        result.blockId +
                        "---" +
                        object.secondaryId
                    );

                    options = await lmsQuestionOptions.create({
                      qpGameId: id,
                      qpQuestionId: result.blockId,
                      qpQuestNo: result.blockQuestNo,
                      qpSecondaryId: object.secondaryId,
                      qpOptions: key,
                      qpSequence: object.seqs,
                     // qpOptionText: OptionText,
                     qpOptionText:transulateId === 1 ? OptionText: /*await Englishcoversion(transulateId,OptionText)*/'This Content Cannot Be Translated Into English.',
        
        
                    // qpResponse: Response,
                    qpResponse:transulateId === 1 ? Response : /*await Englishcoversion(transulateId,Response)*/'This Content Cannot Be Translated Into English.',
                      qpTag:
                        foundItem?.ansObject[key] == "true" ? "true" : "false",
                       // qpFeedback: Feedback, // Corrected line
                       qpFeedback:transulateId === 1 ?  Feedback :  /*await Englishcoversion(transulateId,Feedback)*/'This Content Cannot Be Translated Into English.',
                      qpSkillTag: null,
                      qpScore: Score,
                      qpTitleTag: TitleTag,
                      qpEmotion: Emotion,
                      qpVoice: Voice,
                      qpResponseEmotion: responseEmotion,
                      qpBlockSecondaryId: item.input,
                      qpNextOption: NextOption,
                      qpNavigateShow: NavigateShow,
                      qpCreatedDatetime: Date.now(),
                      qpEditedDatetime: Date.now(),
                      qpDeleteStatus: "NO",
                      qpActiveStatus: "Yes",
                      qpIpAddress: req.connection.remoteAddress,
                      qpUserAgent: req.headers["user-agent"],
                      qpDeviceType: req.device.type,
                    });

                    if (options) {
                    } else {
                      return res
                        .status(500)
                        .json({ status: "Failure", error: error.message });
                    }
                  }

                  if (options) {
                  } else {
                    return res
                      .status(500)
                      .json({ status: "Failure", error: error.message });
                  }
                } catch (error) {
                  // Handle the error within the loop
                  // console.error('Error within loop:', error.message);

                  // Return an appropriate response or handle the error as needed
                  return res
                    .status(500)
                    .json({ status: "Failure", error: error.message });
                }
              }
            }

            setArray.push(result);
          } else {
            const result = await LmsBlocks.create({
              blockGameId: id,
              blockQuestNo: item.questNo,
              blockSecondaryId: item.input,
              blockPrimarySequence: item.id,
              blockDragSequence: foundItem.id,
              blockChoosen: item.type,
              blockText:transulateId === 1 ?  foundItem.interaction :  /*await Englishcoversion(transulateId,foundItem.interaction)*/'This Content Cannot Be Translated Into English.',
              // blockText: foundItem.interaction,
              blockAssetId: null,
              blockSkillTag: foundItem.SkillTag ?? null,
              blockTitleTag: foundItem.quesionTitle,
              blockRoll: foundItem.blockRoll,
              blockResponseRoll: foundItem.responseRoll,
              blockVoiceGender: null,
              blockVoiceEmotions: foundItem.QuestionsVoice ?? null,
              blockCreatedDatetime: Date.now(),
              blockVoiceAccents: null,
              blockCharacterposesId: foundItem.QuestionsEmotion,
              blockAnimationId: null,
              blockDeleteStatus: "NO",
              blockActiveStatus: "Active",
              blockIpAddress: req.connection.remoteAddress,
              blockDeviceType: req.device.type,
              blockUserAgent: req.headers["user-agent"],
            });

            if(transulateId !== 1){

              await StoryUpdate(id, transulateId, result.blockId, 'blockText',  foundItem.interaction, 'LmsBlocks')
             
            }

            if (result) {
              const objectsWithId1_1 = alpArray.filter(
                (obj) => obj.seqs === item.id
              );
              // sub question tabel
              const alpvalues = objectsWithId1_1.map((al) => al.secondaryId);

              const countaplNotIn = await lmsQuestionOptions.count({
                where: {
                  qpQuestionId: result.blockId,
                  qpSecondaryId: {
                    [Op.notIn]: alpvalues,
                  },
                },
              });

              if (countaplNotIn > 0) {
                await lmsQuestionOptions.update(
                  { qpDeleteStatus: "YES" },
                  {
                    where: {
                      qpQuestionId: result.blockId,
                      qpSecondaryId: { [Op.notIn]: alpvalues },
                    },
                  }
                );
              }

              //
              for (const object of objectsWithId1_1) {
                const beforeKey = object.option;
                const key = beforeKey.replace(/'/g, "");
                try {
                  setArray.push(key);

                  const responseEmotion =
                    foundItem?.responseemotionObject?.[key] ?? "";
                  const NextOption = foundItem?.navigateObjects?.[key] ?? "";
                  const NavigateShow =
                    foundItem?.navigateshowObjects?.[key] ?? "";
                  const Emotion = foundItem?.optionsemotionObject?.[key] ?? "";
                  const Voice = foundItem?.optionsvoiceObject?.[key] ?? "";
                  const TitleTag = foundItem?.optionTitleObject?.[key] ?? "";
                  const Score =
                    foundItem?.scoreObject?.[key] === "" ||
                    isNaN(foundItem?.scoreObject?.[key])
                      ? null
                      : Number(foundItem?.scoreObject?.[key]);
                  const Feedback = foundItem?.feedbackObject?.[key] ?? "";
                  const Response = foundItem?.responseObject?.[key] ?? "";
                  const OptionText = foundItem?.optionsObject?.[key] ?? "";

                  const OptionExitist = await lmsQuestionOptions.findOne({
                    where: {
                      qpQuestionId: result.blockId,
                      qpSecondaryId: object.secondaryId,
                      qpQuestNo: result.blockQuestNo,
                      qpGameId: id,
                      qpDeleteStatus: "NO",
                      qpSequence:OptionText,
                      qpResponse: Response,
                    },
                  });

                  let options = "";
                  if (OptionExitist) {
                    setArray.push("OptionExitist");
                    options = await lmsQuestionOptions.update(
                      {
                        // qpGameId: id,
                        ...(transulateId === 1
                          ? { qpGameId: id}
                          : {}),
                        qpQuestionId: result.blockId,
                        qpQuestNo: result.blockQuestNo,
                        qpSecondaryId: object.secondaryId,
                        qpOptions: key,
                        qpSequence: object.seqs,
                        // qpOptionText: OptionText,
                        ...(transulateId === 1
                          ? { qpOptionText: OptionText}
                          : {}),

                        // qpResponse: Response,
                        ...(transulateId === 1
                          ? { qpResponse: Response}
                          : {}),
                        qpTag:
                          foundItem?.ansObject[key] == "true"
                            ? "true"
                            : "false",
                        // qpFeedback: Feedback, // Corrected line
                        ...(transulateId === 1
                          ? { qpFeedback: Feedback}
                          : {}),
                        qpSkillTag: null,
                        qpScore: Score,
                        qpTitleTag: TitleTag,
                        qpEmotion: Emotion,
                        qpVoice: Voice,
                        qpResponseEmotion: responseEmotion,
                        qpBlockSecondaryId: item.input,
                        qpNextOption: NextOption,
                        qpNavigateShow: NavigateShow,
                        qpCreatedDatetime: Date.now(),
                        qpEditedDatetime: Date.now(),
                        qpDeleteStatus: "NO",
                        qpActiveStatus: "Yes",
                        qpIpAddress: req.connection.remoteAddress,
                        qpUserAgent: req.headers["user-agent"],
                        qpDeviceType: req.device.type,
                      },
                      {
                        where: {
                          qpQuestionId: result.blockId,
                          qpSecondaryId: object.secondaryId,
                          qpQuestNo: result.blockQuestNo,
                          qpGameId: id,
                        },
                        
                      }
                      
                    );
                    if(transulateId !== 1){
                  
                      if(OptionText){
                        await StoryUpdate(id, transulateId, Exitist.blockId, 'qpOptions',OptionText, 'lmsQuestionOptions')

                      }
                      if(Response){
                        await StoryUpdate(id, transulateId, Exitist.blockId, 'qpResponse',Response, 'lmsQuestionOptions')
                      }
                      if(Feedback){
                        await StoryUpdate(id, transulateId, Exitist.blockId, 'qpFeedback',Feedback, 'lmsQuestionOptions')
                      }
                    }
                  } else {
                    setArray.push("create");
                    options = await lmsQuestionOptions.create({
                      qpGameId: id,
                      qpQuestionId: result.blockId,
                      qpQuestNo: result.blockQuestNo,
                      qpSecondaryId: object.secondaryId,
                      qpOptions: key,
                      qpSequence: object.seqs,
                      // qpOptionText: OptionText,
                      qpOptionText:transulateId === 1 ? OptionText :  /*await Englishcoversion(transulateId,OptionText)*/'This Content Cannot Be Translated Into English.',
                      // qpResponse: Response,
                      qpResponse:transulateId === 1 ? Response : /*await Englishcoversion(transulateId,Response)*/'This Content Cannot Be Translated Into English.',
                      qpTag:
                        foundItem?.ansObject[key] == true ||
                        foundItem?.ansObject[key] == "true"
                          ? "true"
                          : "false",
                      // qpFeedback: Feedback, // Corrected line
                      qpFeedback:transulateId === 1 ? Feedback : /*await Englishcoversion(transulateId,Feedback)*/'This Content Cannot Be Translated Into English.',
                      qpSkillTag: null,
                      qpScore: Score,
                      qpTitleTag: TitleTag,
                      qpEmotion: Emotion,
                      qpVoice: Voice,
                      qpResponseEmotion: responseEmotion,
                      qpBlockSecondaryId: item.input,
                      qpNextOption: NextOption,
                      qpNavigateShow: NavigateShow,
                      qpCreatedDatetime: Date.now(),
                      qpEditedDatetime: Date.now(),
                      qpDeleteStatus: "NO",
                      qpActiveStatus: "Yes",
                      qpIpAddress: req.connection.remoteAddress,
                      qpUserAgent: req.headers["user-agent"],
                      qpDeviceType: req.device.type,
                    });
                  }
                } catch (error) {
                  // Handle the error within the loop
                  // console.error('Error within loop:', error.message);

                  // Return an appropriate response or handle the error as needed
                  return res
                    .status(500)
                    .json({ status: "Failure", error: error.message });
                }
              }

              setArray.push("result");
            }
          }
        }
      } else {
        setArray.push(null);
      }
    }

    return res.status(200).json({ status: "Success", setArray });
  } catch (error) {
    // console.error(error);
    return res.status(500).json({ status: "Failure", error: error.message });
  }
};
const GetStroy = async (req, res) => {
  try {

   

    let data=req.body;
    let id = req.params.id;
    let questNos = req.body.quest;
    let transulateId=req.body.transulateId ;
    
    let stroy = await LmsBlocks.findAndCountAll({
      where: {
        blockGameId: id,
        blockDeleteStatus: "NO",
        blockQuestNo: questNos,
      },
      order: [
        [Sequelize.literal('CAST(SUBSTRING_INDEX(`blockPrimarySequence`, \'.\', 1) AS UNSIGNED)'), 'ASC'],
        [Sequelize.literal('CAST(SUBSTRING_INDEX(`blockPrimarySequence`, \'.\', -1) AS UNSIGNED)'), 'ASC']
    ],
    });

    let resultObject = {};
    let itemObject = {};
    let alpabetObject = {};
    let interactionBlockObject = {};
    let maxInput = -Infinity;
    const alpabetObjectsArray = [];
    const pushoption = [];
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
      let major = currentVersion.split(".");
      // Construct the value object with the desired properties
      if (result.blockChoosen === "Note") {
      
      
        let value = {
          id: result.blockDragSequence,
          // Add other properties as needed
          note: transulateId===1 ? result.blockText : await getotherlanguagecontent(id,transulateId,result.blockId,'blockText'),
          status: "yes",
          Notenavigate: result.blockLeadTo,
          NoteleadShow: result.blockShowNavigate,
          // Add other properties as needed
        };
        // 
        resultObject[key] = value;
      }
      if (result.blockChoosen === "Dialog") {
        let value = {
          id: result.blockDragSequence,
          dialog: transulateId===1 ? result.blockText : await  getotherlanguagecontent(id,transulateId,result.blockId,'blockText'),
          character: result.blockRoll,
          animation: result.blockCharacterposesId,
          voice: result.blockVoiceEmotions,
          DialogleadShow: result.blockShowNavigate,
          Dialognavigate: result.blockLeadTo,
        };

        resultObject[key] = value;
      }

      if (result.blockChoosen === "Interaction") {
        try {
          const Question = await lmsQuestionOptions.findAll({
            where: { qpQuestionId: result.blockId, qpDeleteStatus: "NO" },
            order: [["qpSecondaryId", "ASC"]],
          });

          // console.log("Question", Question);
          // return res.status(500).json({ status: 'Failure' ,error:result.blockId });
          for (let [i, rows] of Question.entries()) {
            // Use for...of loop or Promise.all to handle async/await correctly
            let value = {
              seqs: major[0] + "." + idCounter,
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

            // console.log("rows", rows);
            optionsObject[rows.qpOptions] = transulateId===1 ? (rows.qpOptionText ?  rows.qpOptionText :''): await  getotherlanguagecontent(id,transulateId,rows.qpOptionId,'qpOptionText') ;
            ansObject[rows.qpOptions] = rows.qpTag ? rows.qpTag : "";

            feedbackObject[rows.qpOptions] = transulateId===1 ? (rows.qpFeedback ?  rows.qpFeedback :''): await  getotherlanguagecontent(id,transulateId,rows.qpOptionId,'qpFeedback');
              
            responseObject[rows.qpOptions] = transulateId===1 ? (rows.qpResponse ?  rows.qpResponse :''): await  getotherlanguagecontent(id,transulateId,rows.qpOptionId,'qpResponse');
              
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
            // console.log("After push:", alpabetObjectsArray);
            if (rows.qpResponse) {
              interactionBlockObject[`Resp${result.blockSecondaryId}`] =
                result.blockSecondaryId;
            }
            if (rows.qpFeedback) {
              interactionBlockObject[`Feedbk${result.blockSecondaryId}`] =
                result.blockSecondaryId;
            }
            if (rows.qpTitleTag || result.blockTitleTag) {
              interactionBlockObject[`Title${result.blockSecondaryId}`] =
                result.blockSecondaryId;
            }
            if (result.blockSkillTag) {
              interactionBlockObject[`Skills${result.blockSecondaryId}`] =
                result.blockSecondaryId;
            }
          }
          // console.log("Final array:", optionsemotionObject);

          pushoption.push(optionsObject);
          // return res.status(500).json({ status: 'Failure' ,error:scoreObject });

          let value = {
            QuestionsEmotion: result.blockCharacterposesId,
            QuestionsVoice: result.blockVoiceEmotions,
            ansObject: ansObject,
            blockRoll: result.blockRoll,
            feedbackObject: feedbackObject,
            interaction: transulateId===1 ? result.blockText : await  getotherlanguagecontent(id,transulateId,result.blockId,'blockText'),
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

          // console.log("values", value);
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
        questNo: result.blockQuestNo,
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

      return res.status(200).json({
        status: "Success",
        items: itemObject,
        input: resultObject,
        alp: alpabetObject,
        intra: interactionBlockObject,
        count: minorVersion,
        maxInput: maxInput,
        serias: parts[0],
        alpacount: alpacount?.qpSecondaryId ?? null,
        sortedItems: sortedItems,
      });
    } else {
      return res.status(200).json({
        status: "Success",
        items: itemObject,
        input: resultObject,
        alp: alpabetObject,
        intra: interactionBlockObject,
        count: 1,
        maxInput: maxInput,
        serias: questNos,
        alpacount: alpacount?.qpSecondaryId ?? null,
      });
    }
  } catch (error) {
    return res.status(500).json({ status: "Failure", error: error.message });
  }
};

const ListStroy = async (req, res) => {
  try {
    let id = req.params.id;
    let BlockObject = {};
    let gameList = [];
    let gameIn = [];
    const getGameExtensionId = await LmsGame.findOne({
      attributes: ["gameExtensionId"],
      where: {
        gameId: id,
        gameDeleteStatus: "No",
      },
      order: [["gameId", "ASC"]],
    });

    if (getGameExtensionId.gameExtensionId) {
      gameList = await LmsGame.findAll({
        attributes: ["gameId", "gameQuestNo", "gameExtensionId"],
        where: {
          gameExtensionId: getGameExtensionId.gameExtensionId,
          gameDeleteStatus: "No",
        },
        order: [["gameId", "ASC"]],
      });
      gameIn = gameList.map((al) => al.gameId);
      const getBlocks = await LmsBlocks.findAll({
        where: {
          blockGameId: {
            [Op.in]: gameIn,
          },
          blockDeleteStatus: "NO",
        },
      });
      if (getBlocks) {
        for (let [i, rows] of getBlocks.entries()) {
          let value = {
            id: rows.blockPrimarySequence,
            // Add other properties as needed
            type: rows.blockChoosen,
            input: rows.blockSecondaryId,
            gameId: rows.blockGameId,
            questNo: rows.blockQuestNo,
            // Add other properties as needed
          };
          BlockObject[i] = value;
        }
      }
    }

    return res.status(200).json({
      status: "Success",
      BlockObject: BlockObject,
      gameIn: gameList,
    });
  } catch (error) {
    return res.status(500).json({ status: "Failure", error: error.message });
  }
};
const viewHistroyMaintance = async (req, res) => {
  try {
    let id = req.params.id;
    const LoginUserId = req.user.user.id;

    const checkviewer = await LmsGame.findOne({
      where: {
        gameId: id,
        [Op.or]: [
          {
            gameCreatorUserId: LoginUserId,
          },
          {
            gameAnotherCreatorId: LoginUserId,
          },
        ],
      },
    });
    if (!checkviewer) {
      //         const repeatview = await gameHistory.findOne({
      //           where: {
      //             gvgameId: id,
      //             gvViewUserId:LoginUserId
      //           }
      //         });
      // if(!repeatview){
      const result = await gameHistory.create({
        gvgameId: id,
        gvViewUserId: LoginUserId,
        gvIpAddress: req.connection.remoteAddress,
        gvUserAgent: req.headers["user-agent"],
        gvDeviceType: req.device.type,
        createdAt: Date.now(),
      });

      // }
    }

    return res.status(200).json({
      status: "Success",
    });
  } catch (error) {
    return res.status(500).json({ status: "Failure", error: error.message });
  }
};
const exitTemplateOpen = async (req, res) => {
  try {
    const id = req?.params?.id;
    const integerValue = parseInt(1, 10);
    const getAllgame = await LmsGame.findAll({
      where: {
        gameExtensionId: id,
      },
      order: [["gameId", "ASC"]],
    });

    let setExtenstion = [];
    const processedGames = await Promise.all(
      getAllgame.map(async (game, index) => {
        const gameToClone = await LmsGame.findByPk(game.gameId);
        let taketile = gameToClone?.gameTitle?.split("_");
        const currentDate = new Date();
        const formattedDate = `${currentDate.getDate()}-${
          currentDate.getMonth() + 1
        }-${currentDate.getFullYear()}`;
        const formattedTime = `${currentDate.getHours()}.${currentDate.getMinutes()}.${currentDate.getSeconds()}`;

        // Create newTitle with current date and time
        let newTitle = `${taketile[0]}_copied(${formattedDate} ${formattedTime})`;
        const clonedGame = LmsGame.build({
          ...gameToClone.get(), // Using spread syntax to copy all fields
          gameId: null, // Set id to null to create a new record
          // Modify specific fields here
          // gameLastTabArray:JSON.stringify([integerValue]),
          gameLastTab: 111,
          gameGameStage: "Creation",
          gameExtensionId: null,
          gameDuplicated: "NO",
          gameStageDate: Date.now(),
          gameCreatedDatetime: Date.now(),
          gameIpAddress: req.connection.remoteAddress,
          gameUserAgent: req.headers["user-agent"],
          gameCreatedUserId: req.user.user.id,
          gameCreatorUserId: req.user.user.id,
        });
        await clonedGame.save();

        if (clonedGame && index === 0) {
          setExtenstion.push(clonedGame.gameId);
        }
        //  return false;
        const gameup = await LmsGame.update(
          { gameExtensionId: setExtenstion[0] },
          {
            where: {
              gameId: clonedGame.gameId,
            },
          }
        );
        // console.log("setExtenstion", setExtenstion[0]);
        // console.log("clonedGame.gameId", gameup, index);

        if (clonedGame) {
          const blocksToClone = await LmsBlocks.findAll({
            where: {
              blockGameId: id,
              blockQuestNo: clonedGame.gameQuestNo, // Replace 'yourValue' with the actual value you're searching for
            },
          });

          if (blocksToClone) {
            for (const block of blocksToClone) {
              // Perform your actions for each block here
              // For example, clone the block or perform any other operation
              const clonedBlock = await LmsBlocks.create({
                ...block.get(),
                blockId: null,
                blockGameId: setExtenstion[0],
              });
              await clonedBlock.save();
              if (clonedBlock) {
                const QuestionsOptionToClone = await lmsQuestionOptions.findAll(
                  {
                    where: {
                      qpQuestionId: block.blockId,
                    },
                  }
                );

                if (QuestionsOptionToClone) {
                  for (const option of QuestionsOptionToClone) {
                    const clonedOption = await lmsQuestionOptions.create({
                      ...option.get(),
                      qpOptionId: null,
                      qpQuestionId: clonedBlock.blockId,
                      qpGameId: setExtenstion[0],
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
          if (index === 0) {
            const relfectionToClone = await ReflectionQuestion.findAll({
              where: {
                refGameId: id, // Replace 'yourValue' with the actual value you're searching for
              },
            });

            if (relfectionToClone) {
              for (const ref of relfectionToClone) {
                const clonedRelfection = await ReflectionQuestion.create({
                  ...ref.get(),
                  refId: null, // Set id to null to create a new record
                  refGameId: setExtenstion[0],
                });
              }
            }
          }
        } else {
          return res
            .status(400)
            .json({ status: "Failure", message: "Game Not Duplicated ." });
        }
      })
    );
    let sendData = [];
    if (setExtenstion.length > 0) {
      // Check if setExtenstion is not empty
      sendData = await LmsGame.findAll({
        where: {
          gameId: setExtenstion[0],
        },
      });
      return res.status(200).json({
        status: "Success",
        message: "Game Duplicated successfully.",
        data: sendData,
      });
    }
    return res.status(200).json({
      status: "Success",
      message: "Game Duplicated successfully.",
      data: sendData,
    });
  } catch (error) {
    res.status(500).json({
      status: "Failure",
      message: "Internal Server Error",
      err: error.message,
    });
  }
};

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
        // try {
        const Question = await lmsQuestionOptions.findAll({
          where: { qpQuestionId: result.blockId, qpDeleteStatus: "NO" },
          order: [["qpSecondaryId", "ASC"]],
        });
        for (let [i, rows] of Question.entries()) {
          // Use for...of loop or Promise.all to handle async/await correctly
          let value = {
            seqs: major[0] + "." + idCounter,
            option: rows.qpOptions,
            secondaryId: rows.qpSecondaryId,
          };
          // Ensure optionsObject[key] is initialized as an object
          if (!optionsObject[key]) {
            optionsObject[key] = {};
          }
          optionsObject[key][rows.qpOptions] = rows.qpOptionText
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
          optionsvoiceObject[rows.qpOptions] = rows.qpVoice ? rows.qpVoice : "";
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
          optionsObject: optionsObject[key],
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
        // } catch (error) {
        //   return res
        //     .status(500)
        //     .json({ status: "Failure", error: error.message });
        // }
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
        message: "game stages found",
        data: data,
      });
    } else {
      const data = {
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
        message: "game stages found",
        data: data,
      });
    }
  } catch (error) {
    return res.status(500).json({ status: "Failure", error: error.message });
  }
};
const sentFeedbackMail = async (req, res) => {
  const Mails = req?.body?.data;
  try {
    if (!Mails || Mails.length < 0)
      return res
        .status(500)
        .json({ status: "Failure", message: "mails not found", data: Mails });
    let errorMail = false;
    for (const mail of Mails) {
      const mailOptions = {
        from: "santhilamobiledev@gmail.com",
        to: mail,
        subject: "Regarding For Your Work",
        text: "Hi Indhu!",
        html: `<div><h1>Share a Review</h1><p>You can share a review for this game</p><a href='http://35.183.46.127:5555/admin/superadmin/game/creation/${req?.user?.user?.id}'/></div>`,
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          errorMail = true;
        }
      });
    }
    if (errorMail) {
      return res.status(500).json({
        status: "Failure",
        error: "Internal Server Error",
        err: errorMail,
      });
    } else {
      return res.status(200).json({
        status: "Success",
        message: "mail sent",
      });
    }
  } catch (error) {
    return res.status(500).json({ status: "Failure", error: error.message });
  }
};
const QuestDeletion = async (req, res) => {
  try {
    const data = req?.body;
    const id = req?.params?.id;
/******************Game Deletion*********************** */
const checkblocks = await LmsBlocks.count({
  where: {
    blockGameId : data.exid
  },
});
if(checkblocks===0){
  return res.status(500).json({ status: "Failure", message: "Game has No block" });
}

const checkExtenid = await LmsGame.findOne({
  where: {
    gameExtensionId: data.exid
  },
  order: [["gameId", "ASC"]] // Correcting the order syntax
});
const checkQuestCount = await LmsGame.count({
  where: {
    gameExtensionId: data.exid
  },
  
});
let testdata = [];
testdata.push(checkExtenid);
testdata.push(checkExtenid && parseInt(data.exid) === checkExtenid.gameId);

if (checkExtenid && parseInt(data.exid) === checkExtenid.gameId) {
  if(checkQuestCount>1){

    
  const getlastId = await LmsGame.findOne({
    order: [["gameId", "DESC"]]
  });

  const incLastId = getlastId ? getlastId.gameId + 1 : 1; // Handle the case when no records exist

  testdata.push(incLastId);

  // Update the record with the incremented gameId and reset gameExtensionId and gameQuest
  await LmsGame.update(
    { gameId: incLastId, gameExtensionId: 0, gameQuest:null },
    { where: { gameId: data.exid } }
  );

  // Delete the record with the incremented gameId



  

  // Get the record with the original gameExtensionId
  const getFristId = await LmsGame.findOne({
    where: { gameExtensionId: data.exid },
    order: [["gameId", "ASC"]]
  });

  if (getFristId) {
    testdata.push(getFristId.gameId);

    // Update the record with the original gameId
    await LmsGame.update(
      { gameId: data.exid },
      { where: { gameId: getFristId.gameId } }
    );
  
    await LmsBlocks.update(
      { blockGameId: data.exid },
      { where: { blockGameId: incLastId } }
    );
    await lmsQuestionOptions.update(
      { qpGameId: data.exid },
      { where: { qpGameId: incLastId } }
    );
    
    await LmsGame.destroy({
      where: { gameId: incLastId }
    });
  
  }

  }
  }

else {
  
  await LmsGame.destroy({
    where: {
      gameExtensionId: data.exid,
      gameQuestNo: data.quest
    }
  });
}

/****************************************************** */
   
 /******************Block Deletion*********************** */
 BlcokList = await LmsBlocks.destroy({
  where: {
    blockGameId: data.exid,
    blockQuestNo: data.quest,
  },
});
 /******************QuestionOption Deletion*********************** */

 const questiondat = await lmsQuestionOptions.destroy({
  where: {
    qpGameId: data.exid,
    qpQuestNo: data.quest,
  },
});
 



 
    await LmsGame.update(
      { gameQuestNo: Sequelize.literal('gameQuestNo - 1')===0? Sequelize.literal('gameQuestNo - 1') : 1 },
      {
        where: {
          gameExtensionId: data.exid,
         
        },
      }
    );

    await LmsBlocks.update(
      { blockQuestNo: Sequelize.literal('blockQuestNo - 1'),
      blockPrimarySequence: Sequelize.literal(`blockPrimarySequence - 1`),
      blockDragSequence:Sequelize.literal('blockDragSequence - 1')},
      {
        where: {
          blockGameId: data.exid,
          blockQuestNo: { [Op.gt]: data.quest },
        },
      }
    );

    await lmsQuestionOptions.update(
      { qpQuestNo: Sequelize.literal('qpQuestNo - 1'),
      qpSequence:Sequelize.literal('qpSequence - 1')
     },
      {
        where: {
          qpGameId: data.exid,
          qpQuestNo: { [Op.gt]: data.quest },
        },
      }
    );


     
    return res.status(200).json({
      status: "Success",
      message: "Quest Deleted",
      data:testdata
    });
  } catch (error) {
    return res.status(500).json({ status: "Failure", error: error.message });
  }
};

const getCompletionScreen = async (req, res) => {
  try {
    const data = req?.body;
    const id = req?.params?.id;
    const Languageid = data?.translationId;
    let completionScreenObject = {};
let ContentLang =[];
    const getCompletionscreens = await LmsGame.findAndCountAll({
      where: {
        gameExtensionId: id,
        gameDeleteStatus: "NO",
      },
      order: ["gameId"],
    });
    if (getCompletionscreens) {
      for (let [index, result] of getCompletionscreens.rows.entries()) {
        const maxScores = await lmsQuestionOptions.findAll({
          attributes: [
         
            [
              Sequelize.fn("MAX", Sequelize.col("qpScore")),
              "maxScore",
            ],
          ],
          where: {
            qpGameId: id,
            qpQuestNo: result.gameQuestNo,
            qpDeleteStatus: "No",
            qpTag: "true",
          },
          group: ["qpQuestionId"], // Add GROUP BY clause
        });
         
        // Now sum the maximum scores
        const TotalScore = maxScores.reduce((acc, item) => acc + parseInt(item.getDataValue("maxScore")), 0);
        
       
        // Corrected access to alias name
console.log('TotalScore111',TotalScore);
        // Loop through the getTotalscore result and extract maxScore values

        /**Lokie Work Here */
        if(Languageid!==1){
        const condition101 = {
          where: {
            gameId: id,
            translationId: Languageid,
            textId: result.gameQuestNo,
          },
          logging: console.log // Log the generated SQL query
        };
      
           ContentLang = await lmsGameContentLang.findAll(
            {attributes: [
            ["content", "value"],
            ["fieldName", "label"],
          ],
        
          ...condition101
         
        });
        
      }
        
      

        let value = {
          gameQuestNo: result.gameQuestNo,
          gameTotalScore: TotalScore ?? null,
          gameIsSetMinPassScore: result.gameIsSetMinPassScore ?? "false",
          gameMinScore: result.gameMinScore,
          gameIsSetDistinctionScore:
            result.gameIsSetDistinctionScore ?? "false",
          gameDistinctionScore: result.gameDistinctionScore,
          gameIsSetSkillWiseScore: result.gameIsSetSkillWiseScore ?? "false",
          gameIsSetBadge: result.gameIsSetBadge,
          gameBadge: result.gameBadge,
          gameBadgeName: result.gameBadgeName,
          gameIsSetCriteriaForBadge:
            result.gameIsSetCriteriaForBadge ?? "false",
          gameAwardBadgeScore: result.gameAwardBadgeScore,

          // gameScreenTitle: result.gameScreenTitle
          //   ? result.gameScreenTitle
          //   : "Quest Complete",

          gameScreenTitle: (ContentLang && ContentLang?.find(item => item.dataValues.label === 'gameScreenTitle')?.dataValues.value) ?? result.gameScreenTitle ?? "Quest Complete",
          // gameCompletedCongratsMessage: result.gameCompletedCongratsMessage
          //   ? result.gameCompletedCongratsMessage
          //   : "Congratulations! you have Completed....",
         
       
          gameCompletedCongratsMessage: (ContentLang && ContentLang?.find(item => item.dataValues.label === 'gameCompletedCongratsMessage')?.dataValues.value) ?? result.gameCompletedCongratsMessage ?? "Congratulations! you have Completed....",

          gameIsSetCongratsScoreWiseMessage:
            result.gameIsSetCongratsScoreWiseMessage ?? "false",
          gameMinimumScoreCongratsMessage:
            result.gameMinimumScoreCongratsMessage,
          gameaboveMinimumScoreCongratsMessage:
            result.gameaboveMinimumScoreCongratsMessage ?? "",
          gameLessthanDistinctionScoreCongratsMessage:
            result.gameLessthanDistinctionScoreCongratsMessage,
          gameAboveDistinctionScoreCongratsMessage:
            result.gameAboveDistinctionScoreCongratsMessage ?? "",
            trasulationId:Languageid,
        };

        completionScreenObject[index] = value;
      }
    } else {
      return res.status(400).json({ status: "Failure", error: "Game Null" });
    }
    return res
      .status(200)
      .json({ status: "Success", data: completionScreenObject });
  } catch (error) {
    return res.status(500).json({ status: "Failure", error: error.message });
  }
};
const getStoryValidtion = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ status: "Failure", message: "Bad Request" });
    }

    const blockCounts = await LmsBlocks.findAll({
      attributes: ['blockQuestNo', [Sequelize.fn('COUNT', Sequelize.col('*')), 'count']],
      where: {
          blockGameId: id,
          blockDeleteStatus: 'No' // Assuming 'No' is the desired value for blockDeleteStatus
      },
      group: ['blockQuestNo']
  });
  
    const gameData = await LmsGame.findOne({
      where: { gameId: id },
      include: [
        {
          model: LmsBlocks,
          attributes: [
            "blockGameId",
            "blockId",
            "blockText",
            "blockDragSequence",
            "blockCharacterposesId",
            "blockQuestNo",
            "blockChoosen",
            "blockPrimarySequence",
            "blockLeadTo",
            "blockRoll",
          ],
          where: {
            blockDeleteStatus: "NO",
          },
        },
        {
          model: lmsQuestionOptions,
          attributes: [
            "qpGameId",
            "qpQuestionId",
            "qpOptionId",
            "qpOptionText",
            "qpTag",
            "qpScore",
            "qpEmotion",
            "qpQuestNo",
            "qpSequence",
            "qpOptions",
            "qpNextOption",
          ],
          where: {
            qpDeleteStatus: "NO",
          },
        },
      ],
    });

    if (!gameData) {
      return res.status(404).json({ error: "Record not found" });
    }

    if (gameData.lmsblocks && gameData.lmsblocks.length > 0) {
      const blockFields = ["blockText"];
      const AnimateFields = ["blockCharacterposesId"]; 
      const Navigatar = ["blockLeadTo"];
    
      
      for (const block of gameData.lmsblocks) {
                
        for (const field of blockFields) {
          const blockDragSequence_1 = block.blockDragSequence;
          const QuestNo = block.blockQuestNo;
          const BlockChoose = block.blockChoosen;
          if (!block[field]) {
            return res.status(400).json({
              status: "Failure",
            
              // message: `Quest No ${QuestNo} ${BlockChoose} Sequence ${blockDragSequence_1} is empty.`, pavi
              message: `Quest No ${QuestNo} Sequence ${blockDragSequence_1} ${BlockChoose} is Empty.`,
            });
          }
        }
    
        for (const field of AnimateFields) {
          const blockDragSequence = block.blockPrimarySequence;
          const QuestNo = block.blockQuestNo;
          const BlockChoose = block.blockChoosen;
          const ids = block.blockId;
          const blockRoll =block.blockRoll;
          
          // console.log('LokieblockRoll',blockRoll);
          if ((blockRoll===99999||blockRoll==='Narrator') && !block[field] && BlockChoose!=='Note') {
              if (!block[field] && BlockChoose!='Note') {
            return res.status(400).json({
              status: "Failure",
              // pavi
              message: `Quest No ${QuestNo} Animate Sequence ${blockDragSequence} is Empty`,
            });
          }
          }
        
        }

        for (const field of Navigatar) {
          const blockDragSequence = block.blockPrimarySequence;
          const QuestNo = block.blockQuestNo;
          const BlockChoose = block.blockChoosen;
          const ids = block.blockId;
          
          if (!block[field] && BlockChoose!='Interaction') {
            return res.status(400).json({
              status: "Failure",
          
              // message: `Quest No ${QuestNo} Navigate Sequence ${blockDragSequence} is empty..`, pavi
              message: `Quest No ${QuestNo} Sequence ${blockDragSequence} Navigate  is Empty`,
            });
          }
        }
      }
    } else {
      return res.status(400).json({
        status: "Failure",
        message: "Please Fill the Empty Fields",
      });
    }
    
    

    const uniqueQuestionIds = [
      ...new Set(
        gameData.lmsquestionsoptions.map((option) => option.qpQuestionId)
      ),
    ];

    for (const questionIdToCheck of uniqueQuestionIds) {
      const optionsForQuestionId = gameData.lmsquestionsoptions.filter(
        (option) => option.qpQuestionId === questionIdToCheck
      );

      for (const option of optionsForQuestionId) {

        if (!option.qpOptionText) {
          return res.status(400).json({
            status: "Failure",
            // message: `Quest No ${option.qpQuestNo} Option ${option.qpOptions} Sequence ${option.qpSequence} is Empty`,  
              // pavi
            message: `Quest Nos ${option.qpQuestNo}  Sequence ${option.qpSequence} Option ${option.qpOptionText} is Empty`,
          });
        }
        if (!option.qpEmotion) {
          return res.status(400).json({
            status: "Failure",
          // pavi
            // message: `Quest No ${option.qpQuestNo} Option ${option.qpOptions} Animate Sequence ${option.qpSequence} is Empty`,

           message: `Quest No ${option.qpQuestNo} Sequence ${option.qpSequence}  Select the Animate  ${option.qpOptions} is Empty`,
          });
        }

        if (!option.qpNextOption) {
          return res.status(400).json({
            status: "Failure",
            message: `Quest No ${option.qpQuestNo} Option ${option.qpOptions} Navigate Sequence ${option.qpSequence} is Empty`,
          });
        }
      }

      const hasTrueTag = optionsForQuestionId.some(
        (option) => option.qpTag === "true"
      );

      if (!hasTrueTag) {
        return res.status(400).json({
          status: "Failure",
          // pavi
          // message: `At least one option must be checked on this sequence of Quest ${optionsForQuestionId[0].qpQuestNo} Sequence ${optionsForQuestionId[0].qpSequence}`,
          message: `Quest ${optionsForQuestionId[0].qpQuestNo} At least one option must be checked on this sequence ${optionsForQuestionId[0].qpSequence}`,
        });
      }

      for (const option of optionsForQuestionId) {
        if (option.qpTag === "true" && option.qpScore === "") {
          return res.status(400).json({
            status: "Failure",
            message: `Score is required for Selected Option of Quest ${option.qpQuestNo} Sequence ${option.qpSequence}`,
          });
        }
      }
      for (const block of gameData.lmsblocks) {
        const blockQuestNo = block.blockQuestNo;
        const rows = gameData.lmsblocks.filter(b => b.blockQuestNo === blockQuestNo);
        
            let success = false;
            for (let i = 1; i <= blockCounts.length; i++) {
            
                if (rows.some(row => row.blockChoosen === 'Interaction')) {
                    success = true;
                    break; 
                }
            }
    
            if (!success) {
                return res.status(400).json({
                    status: "Failure",
                    message: `No Interaction for Quest No ${blockQuestNo}`,
                });
            }
    }
    }
      
    res.status(200).json({
      status: "Success",
      message: "Data Retrieved Successfully",
      data: gameData,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message:
        "An error occurred while processing the request. Check the server logs for more details.",
      err: error,
    });
  }
};
const getTotalMinofWords = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ status: "Failure", message: "Bad Request" });
    }

    const gameData = await LmsGame.findOne({
      where: { gameId: id },
      include: [
        {
          model: LmsBlocks,
          attributes: [
            "blockGameId",
            "blockId",
            "blockText",
            "blockDragSequence",
            "blockCharacterposesId",
          ],
        },
        {
          model: lmsQuestionOptions,
          attributes: [
            "qpGameId",
            "qpQuestionId",
            "qpOptionId",
            "qpOptionText",
            "qpTag",
            "qpScore",
            "qpEmotion",
            "qpFeedback",
            "qpResponse",
          ],
        },
      ],
    });

    if (!gameData) {
      return res.status(404).json({ error: "Record not found" });
    }

    // Calculate total word count for lmsblocks
    const blockWordCount = gameData.lmsblocks.reduce((sum, block) => {
      return sum + (block.blockText.split(" ").length || 0);
    }, 0);

    // Calculate total word count for question options' text, feedback, and response
    const optionWordCount = gameData.lmsquestionsoptions.reduce(
      (sum, option) => {
        const optionTextWordCount = option.qpOptionText.split(" ").length || 0;
        const feedbackWordCount = option.qpFeedback.split(" ").length || 0;
        const responseWordCount = option.qpResponse.split(" ").length || 0;
        return (
          sum + optionTextWordCount + feedbackWordCount + responseWordCount
        );
      },
      0
    );
    const averageReadingSpeed = 100;
    const totalWordCount = blockWordCount + optionWordCount;
    //  const totalWordCount: blockWordCount + optionWordCount;
    const totalMinutes = Math.max(
      1,
      Math.ceil(totalWordCount / averageReadingSpeed)
    );

    // const totalMinutes = totalWordCount / averageReadingSpeed;
    res.status(200).json({
      status: "Success",
      message: "Data Retrieved Successfully",
      blockWordCount,
      optionWordCount,
      totalWordCount: blockWordCount + optionWordCount,
      totalMinutes,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message:
        "An error occurred while processing the request. Check the server logs for more details.",
      err: error,
    });
  }
};

const ComplitionUpdate = async (req, res) => {
  // console.log('requestCompli--',req?.body)
  try {
    const data = req?.body;
    const id = req?.params?.id;

    // Check if data is provided
    if (!data || Object.keys(data).length === 0) {
      return res
        .status(400)
        .json({ status: "Failure", message: "No data provided for update." });
    }

    // Iterate over keys and update the lmsGame table
    const trans_id = data.trasulationId;
    console.log('LokieTres',trans_id);
    for (const key in data) {
      console.log('Lokie3452',data);
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const value = data[key];
        let updateContentLanguages;
        let updateContentLanguage;
        if (value.trasulationId !== 1) {
          // lmsGameContentLang
          const updateContentLanguage = await lmsGameContentLang.update({content:value.gameScreenTitle}, 
            {
            where: {
              gameId: id,
              translationId:value.trasulationId,
              fieldName:'gameScreenTitle',
              textId: value.gameQuestNo,
            },
          });
           updateContentLanguages = await lmsGameContentLang.update({content:value.gameCompletedCongratsMessage}, 
            {
            where: {
              gameId: id,
              translationId:value.trasulationId,
              fieldName:'gameCompletedCongratsMessage',
              textId: value.gameQuestNo,
            },
          });
      }
        if (value.trasulationId !== 1) {
          delete value.gameScreenTitle;
          delete value.gameCompletedCongratsMessage;
      }
        // value.gameTotalScore = value.gameTotalScore.maxScore;
        // console.log('values33333###',value.gameTotalScore.maxScore);
        const { gameQuestNo, ...updateValues } = value;
        const updateResult = await LmsGame.update(updateValues, {
          where: {
            gameExtensionId: id,
            gameQuestNo: value.gameQuestNo,
          },
        });
       
        // if (!updateResult || updateResult[0] === 0 || updateContentLanguages) {
        //   return res.status(404).json({
        //     status: "Failure",
        //     message: `Failed to update ${key} with value ${value}.`,
        //     err: req?.body,
        //   });
          

          
        // }
        
       
        
      }
    }

    // Send success response
    res
      .status(200)
      .json({ status: "Success", message: "Data updated successfully." });
  } catch (error) {
    // Handle any errors that may occur during the update
    console.error("Error during update:", error);
    res.status(500).json({
      status: "Failure",
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

/**getGameCollections for review the game */
const getGameCollections = async (req, res) => {
  const reqUuid = req.params?.uuid;
  try {
    const reviewerGame = await ReviewersGame.findOne({
      where: { gameUuid: { [Op.eq]: reqUuid } },
      include: [
        {
          model: Reviewers,
          as: "lmsgamereviewer",
          attributes: [
            "gameReviewerId",
            "creatorId",
            "emailId",
            "activeStatus",
          ],
          include: [
            {
              model: Reviewes,
              as: "reviews",
              attributes: [
                "reviewId",
                "gameReviewerId",
                "reviewGameId",
                "tabId",
                "tabAttribute",
                "tabAttributeValue",
                "review",
                "createdAt",
                "updatedAt",
              ],
              where: {
                gameId: Sequelize.col("lmsreviewersgames.gameId"),
                reviewerId: Sequelize.col("lmsreviewersgames.reviewerId"),
              },
            },
            {
              model: Creator,
              attributes: [
                "ctId",
                "ctName",
                "ctMail",
                "ctGender",
                "ctStatus",
                "ctDeleteStatus",
              ],
              as: "ReviewingCreator",
              required: false, // This ensures that only records with a matching creatorId are included
            },
          ],
        },
        {
          model: LmsGame,
          as: "lmsgame",
          attributes: {
            exclude: [
              "gameIpAddress",
              "gameUserAgent",
              "gameDeviceType",
              "createdAt",
              "updatedAt",
              "deletedAt",
            ],
          },
          include: [
            {
              model: gameassest,
              as: "image",
              attributes: [
                "gasId",
                "gasAssetType",
                "gasAssetName",
                "gasStatus",
                "gasDeleteStatus",
                [
                  Sequelize.literal(
                    `CONCAT('${req.protocol}://${req.get(
                      "host"
                    )}/',gasAssetImage)`
                  ),
                  "gasAssetImage",
                ],
              ],
            },
            {
              model: gameHistory,
              as: "gameview",
              attributes: [
                "gvId",
                "gvgameId",
                "gvViewUserId",
                "createdAt",
                "updatedAt",
              ],
            },
            {
              model: LmsBlocks,
              as: "lmsblocks",
              attributes: {
                exclude: [
                  "blockIpAddress",
                  "blockUserAgent",
                  "blockDeviceType",
                ],
              },
              where: {
                blockDeleteStatus: { [Op.eq]: "No" },
                blockActiveStatus: { [Op.eq]: "Active" },
              },
            },
            {
              model: lmsQuestionOptions,
              as: "lmsquestionsoptions",
              attributes: {
                exclude: ["qpIpAddress", "qpUserAgent", "qpDeviceType"],
              },
              where: { qpDeleteStatus: "No", qpActiveStatus: "Yes" },
            },
            {
              model: LmsGame,
              as: "gameQuest",
            },
          ],
        },
      ],
    });
    if (!reviewerGame) {
      return res.status(404).json({ error: "No data found" });
    }
    /** returns game background music */
    const gameIntro = await reviewerGame?.lmsgame?.gameIntroMusic;
    let bgMusic = null;
    if (gameIntro) {
      bgMusic = await LmsGameAssets.findByPk(gameIntro, {
        attributes: ["gasAssetImage"],
      });
    }
    /** returns game Non playing characters url */
    const gameNPC = await reviewerGame?.lmsgame?.gameNonPlayingCharacterId;
    let npcUrl = null;
    if (gameNPC) {
      npcUrl = await LmsGameAssets.findByPk(gameNPC, {
        attributes: ["gasAssetImage"],
      });
    }

    reviewerGame.lmsgame = {
      reflectionQuestions: [],
      ...reviewerGame?.lmsgame,
    };
    let credential = {
      id: reqUuid,
      name: reviewerGame?.reviewerId,
      mail: reviewerGame?.lmsgamereviewer?.emailId,
      role: "Reviewer",
    };

    const gameQuest = await reviewerGame?.lmsgame?.gameQuest;
    const gameQuestBadgesUrls = await Promise.all(
      gameQuest?.map(async (item) => {
        const assets = await LmsGameAssets.findOne({
          attribute: ["gasAssetImage"],
          where: { gasId: item.gameBadge },
        });
        const key = "Quest_" + item.gameQuestNo;
        return { [key]: await assets?.gasAssetImage };
      })
    );

    let gameReflectionQuest = [];
    if (reviewerGame) {
      gameReflectionQuest = await ReflectionQuestion.findAll({
        where: {
          refGameId: { [Op.eq]: await reviewerGame.gameId },
          refDeleteStatus: "No",
          refActiveStatus: "Yes",
        },
      });
    }

    let completionScreenObject = {};

    const getCompletionscreens = await LmsGame.findAndCountAll({
      where: {
        gameExtensionId: await reviewerGame.gameId,
        gameDeleteStatus: "NO",
      },
      order: ["gameId"],
    });
    if (getCompletionscreens) {
      for (let [index, result] of getCompletionscreens.rows.entries()) {
        const getTotalscore = await lmsQuestionOptions.findAll({
          attributes: [
            [
              Sequelize.fn(
                "SUM",
                Sequelize.literal("lmsquestionsoption.qpScore")
              ),
              "maxScore",
            ],
          ],
          where: {
            qpGameId: await reviewerGame.gameId,
            qpQuestNo: result.gameQuestNo,
            qpDeleteStatus: "No",
            qpTag: "true",
          },
          group: ["qpQuestNo"], // Add GROUP BY clause
        });

        let TotalScore = getTotalscore; // Corrected access to alias name

        // Loop through the getTotalscore result and extract maxScore values

        let value = {
          gameId: result.gameId,
          gameQuestNo: result.gameQuestNo,
          gameTotalScore: TotalScore ?? null,
          gameIsSetMinPassScore: result.gameIsSetMinPassScore ?? "false",
          gameMinScore: result.gameMinScore,
          gameIsSetDistinctionScore:
            result.gameIsSetDistinctionScore ?? "false",
          gameDistinctionScore: result.gameDistinctionScore,
          gameIsSetSkillWiseScore: result.gameIsSetSkillWiseScore ?? "false",
          gameIsSetBadge: result.gameIsSetBadge,
          gameBadge: result.gameBadge,
          gameBadgeName: result.gameBadgeName,
          gameIsSetCriteriaForBadge:
            result.gameIsSetCriteriaForBadge ?? "false",
          gameAwardBadgeScore: result.gameAwardBadgeScore,
          gameScreenTitle: result.gameScreenTitle
            ? result.gameScreenTitle
            : "Quest Complete",
          gameCompletedCongratsMessage: result.gameCompletedCongratsMessage
            ? result.gameCompletedCongratsMessage
            : "Congratulations! you have Completed....",
          gameIsSetCongratsScoreWiseMessage:
            result.gameIsSetCongratsScoreWiseMessage ?? "false",
          gameMinimumScoreCongratsMessage:
            result.gameMinimumScoreCongratsMessage,
          gameaboveMinimumScoreCongratsMessage:
            result.gameaboveMinimumScoreCongratsMessage ?? "",
          gameLessthanDistinctionScoreCongratsMessage:
            result.gameLessthanDistinctionScoreCongratsMessage,
          gameAboveDistinctionScoreCongratsMessage:
            result.gameAboveDistinctionScoreCongratsMessage ?? "",
        };

        completionScreenObject[index] = value;
      }
    }
    


    /**returns Player characters */
    const directoryPath = path.join(process.cwd(), "uploads", "player");
    const files = await getFilesInDirectory(directoryPath);
    const filesWithPath = files?.map((file) => {
      return "uploads/player/" + file;
    });

    return res.status(200).json({
      result: reviewerGame,
      resultReflection: gameReflectionQuest,
      assets: {
        playerCharectorsUrl: filesWithPath ?? "",
        bgMusicUrl: bgMusic?.gasAssetImage ?? "",
        npcUrl: npcUrl?.gasAssetImage ?? "",
        badges: gameQuestBadgesUrls,
      },
      data : completionScreenObject,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const getFilesInDirectory = (directoryPath) => {
  return new Promise((resolve, reject) => {
    fs.readdir(directoryPath, (err, files) => {
      if (err) {
        return err;
      } else {
        const filteredFiles = files.filter((file) => {
          const extension = path.extname(file).toLowerCase();
          return (
            extension === ".png" ||
            extension === ".jpeg" ||
            extension === ".jpg" ||
            extension === ".glb"
          );
        });
        resolve(filteredFiles);
      }
    });
  });
};

/**getGamePreviewCollection for Preview of the game for Creators */
const getGamePreviewCollection = async (req, res) => {
  const gamepkId = req.params?.id;
  try {
    const GameRecords = await LmsGame.findOne({
      attributes: {
        exclude: [
          "gameIpAddress",
          "gameUserAgent",
          "gameDeviceType",
          "createdAt",
          "updatedAt",
          "deletedAt",
        ],
      },
      where: { gameId: { [Op.eq]: gamepkId } },
      include: [
        {
          model: gameassest,
          as: "image",
          attributes: [
            "gasId",
            "gasAssetType",
            "gasAssetName",
            "gasStatus",
            "gasDeleteStatus",
            [
              Sequelize.literal(
                `CONCAT('${req.protocol}://${req.get("host")}/',gasAssetImage)`
              ),
              "gasAssetImage",
            ],
          ],
        },
        {
          model: gameHistory,
          as: "gameview",
          attributes: [
            "gvId",
            "gvgameId",
            "gvViewUserId",
            "createdAt",
            "updatedAt",
          ],
        },
        {
          model: LmsBlocks,
          as: "lmsblocks",
          attributes: {
            exclude: ["blockIpAddress", "blockUserAgent", "blockDeviceType"],
          },
          where: { blockDeleteStatus: "No", blockActiveStatus: "Active" },
        },
        {
          model: lmsQuestionOptions,
          as: "lmsquestionsoptions",
          required: false, // Makes the join optional
          attributes: {
            exclude: ["qpIpAddress", "qpUserAgent", "qpDeviceType"],
          },
          where: {
            qpDeleteStatus: { [Op.eq]: "No" },
            qpActiveStatus: "Yes",
          },
        },
        {
          model: LmsGame,
          as: "gameQuest",
        },
      ],
      // logging: true,
    });
    let completionScreenObject = {};

    const getCompletionscreens = await LmsGame.findAndCountAll({
      where: {
        gameExtensionId: gamepkId,
        gameDeleteStatus: "NO",
      },
      order: ["gameId"],
    });
    if (getCompletionscreens) {
      for (let [index, result] of getCompletionscreens.rows.entries()) {
        const getTotalscore = await lmsQuestionOptions.findAll({
          attributes: [
            [
              Sequelize.fn(
                "SUM",
                Sequelize.literal("lmsquestionsoption.qpScore")
              ),
              "maxScore",
            ],
          ],
          where: {
            qpGameId: gamepkId,
            qpQuestNo: result.gameQuestNo,
            qpDeleteStatus: "No",
            qpTag: "true",
          },
          group: ["qpQuestNo"], // Add GROUP BY clause
        });

        let TotalScore = getTotalscore; // Corrected access to alias name

        // Loop through the getTotalscore result and extract maxScore values

        let value = {
          gameId: result.gameId,
          gameQuestNo: result.gameQuestNo,
          gameTotalScore: TotalScore ?? null,
          gameIsSetMinPassScore: result.gameIsSetMinPassScore ?? "false",
          gameMinScore: result.gameMinScore,
          gameIsSetDistinctionScore:
            result.gameIsSetDistinctionScore ?? "false",
          gameDistinctionScore: result.gameDistinctionScore,
          gameIsSetSkillWiseScore: result.gameIsSetSkillWiseScore ?? "false",
          gameIsSetBadge: result.gameIsSetBadge,
          gameBadge: result.gameBadge,
          gameBadgeName: result.gameBadgeName,
          gameIsSetCriteriaForBadge:
            result.gameIsSetCriteriaForBadge ?? "false",
          gameAwardBadgeScore: result.gameAwardBadgeScore,
          gameScreenTitle: result.gameScreenTitle
            ? result.gameScreenTitle
            : "Quest Complete",
          gameCompletedCongratsMessage: result.gameCompletedCongratsMessage
            ? result.gameCompletedCongratsMessage
            : "Congratulations! you have Completed....",
          gameIsSetCongratsScoreWiseMessage:
            result.gameIsSetCongratsScoreWiseMessage ?? "false",
          gameMinimumScoreCongratsMessage:
            result.gameMinimumScoreCongratsMessage,
          gameaboveMinimumScoreCongratsMessage:
            result.gameaboveMinimumScoreCongratsMessage ?? "",
          gameLessthanDistinctionScoreCongratsMessage:
            result.gameLessthanDistinctionScoreCongratsMessage,
          gameAboveDistinctionScoreCongratsMessage:
            result.gameAboveDistinctionScoreCongratsMessage ?? "",
        };

        completionScreenObject[index] = value;
      }
    }
    
    if (!GameRecords) {
    return res.status(404).json({ error: "No data found" ,data:GameRecords});
    }

    /** returns game background music */
    const gameIntro = await GameRecords?.gameIntroMusic;
    let bgMusic = null;
    if (gameIntro) {
      bgMusic = await LmsGameAssets.findByPk(gameIntro, {
        attributes: ["gasAssetImage"],
      });
    }
    /** returns game Non playing characters url */
    const gameNPC = await GameRecords?.gameNonPlayingCharacterId;
    let npcUrl = null;
    if (gameNPC) {
      npcUrl = await LmsGameAssets.findByPk(gameNPC, {
        attributes: ["gasAssetImage"],
      });
    }

    const gameQuest = await GameRecords.gameQuest;
    const gameQuestBadgesUrls = await Promise.all(
      gameQuest.map(async (item) => {
        const assets = await LmsGameAssets.findOne({
          attribute: ["gasAssetImage"],
          where: { gasId: item.gameBadge },
        });
        const key = "Quest_" + item.gameQuestNo;
        return { [key]: await assets?.gasAssetImage };
      })
    );

    let gameReflectionQuest = [];

    if (GameRecords) {
      gameReflectionQuest = await ReflectionQuestion.findAll({
        where: {
          refGameId: { [Op.eq]: await GameRecords.gameId },
          refDeleteStatus: "No",
          refActiveStatus: "Yes",
        },
      });
    }
    /**returns Player characters */
    const directoryPath = path.join(process.cwd(), "uploads", "player");
    const files = await getFilesInDirectory(directoryPath);
    const filesWithPath = files?.map((file) => {
      return "uploads/player/" + file;
    });

    return res.status(200).json({
      result: GameRecords,
      resultReflection: gameReflectionQuest,
      data: completionScreenObject,
      assets: {
        playerCharectorsUrl: filesWithPath ?? "",
        bgMusicUrl: bgMusic?.gasAssetImage ?? "",
        npcUrl: npcUrl?.gasAssetImage ?? "",
        badges: gameQuestBadgesUrls,
      },
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
const getMaxBlockQuestNo = async (req, res) => {
  try {
    const gameId = req.params.id;
    const blockDeleteStatus = "No";

    const count = await LmsBlocks.count({
      where: {
        blockGameId: gameId,
        blockDeleteStatus: blockDeleteStatus,
      },
      group: ["blockQuestNo"],
    });

    const maxBlockQuestNo = count.length || 0;
    res.status(200).json({
      status: "Success",
      message: "Data Retrieved Successfully",
      data: { maxBlockQuestNo },
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message:
        "An error occurred while processing the request. Check the server logs for more details.",
      err: error,
    });
  }
};

async function getotherlanguagecontent(gameId,transulatedId,textId,fieldName){
     
    //  id,transulateId,result.blockId,'blockText'
  const getContent= await lmsGameContentLang.findOne({
   attributes: ["content"],
   where: {
     gameId:gameId,
     translationId:transulatedId,
     textId:textId,
     fieldName:`${fieldName}`,
 
      
   },
 
   raw: true,
 })
  if(getContent){ 
   return getContent.content;
   //  
  }else{
   return '';
  }
 }
 async function StoryUpdate(gameId, transulatedId, textId, fieldName, content ,tblname) {
  // id, transulateId, result.blockId, 'blockText',  result.blockText
  try {
  
    const checkStory = await lmsGameContentLang.findOne({
      where: {
        gameId: gameId,
        textId: textId,
        fieldName: fieldName,
        translationId: transulatedId,
      
      },
    });

    if (checkStory) {
      await lmsGameContentLang.update(
        { content: content },
        {
          where: {
            gameId: gameId,
            textId: textId,
            fieldName: fieldName,
            translationId: transulatedId,
          
          },
        }
      );
    } else {


      
      await lmsGameContentLang.create({
        gameId: gameId,
        textId: textId,
        fieldName: fieldName,
        translationId: transulatedId,
        tblName:tblname,
        content: content?content:'',
        createdAt: new Date(), 
      });
console.log('Lokie lmsContent Check:1229');

    }

    return { status: "Success" };
  } catch (error) {
    return { status: "Failure", error: error.message };
  }
}
// async function Englishcoversion(transulateId, content) {
//   try {

//     const condition3 = {
//       where: {
//         language_Id:transulateId,
//       },
//     };

//     lngdata = await LmsLanguages.findOne(condition3);

//     const openai = new OpenAI({
//       apiKey: process.env.OPENAI_API_KEY,
//     });
//     const response = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo",
//       messages: [
//         {
//           role: "system",
//           content: `You are a translation assistant. Please translate the following text from ${lngdata.language_name} to English.`,
//         },
//         {
//           role: "user",
//           content: content,
//         },
//       ],
//       temperature: 0.7,
//       max_tokens: 64,
//       top_p: 1,
//     });

//      const translatedText = response.choices[0].message.content;

//     // Check if the translation was successful
//     if (translatedText && translatedText !== content) {
//       return translatedText;
//     } else {
//       return content;
//     }
    
//   } catch (error) {
//     console.error("Translation Error:", error);
//     return "Error";
//   }
// }
async function Englishcoversion(transulateId, content) {
  try {
    // Query the database to get language information
    const condition3 = {
      where: {
        language_Id: transulateId,
      },
    };
    const lngdata = await LmsLanguages.findOne(condition3);

    // Initialize OpenAI API client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Construct prompt for translation
    const prompt = `You are a translation assistant. Please translate the following text from ${lngdata.language_name} to English.\n\n${content}`;

    // Send request for translation
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: prompt, // Use the constructed prompt
        },
      ],
      temperature: 0.7,
      max_tokens: 64,
      top_p: 1,
    });

    // Extract translated text from the response
    const translatedText = response.choices[0].message.content;

    // Check if translation was successful
    if (translatedText && translatedText !== content) {
      return translatedText;
    } else {
      return content; // Return original content if translation failed
    }
  } catch (error) {
    console.error("Translation Error:", error);
    return "Error"; // Return error message
  }
}

module.exports = {
  getMaxBlockQuestNo,
  uploadIntroMusic,
  uploadBadge,
  getGame,
  GetPreview,
  addGame,
  updateGame,
  getGameById,
  getBlocks,
  countByStage,
  gameDuplicate,
  gameLaunch,
  gameAssign,
  gamePublic,
  gameDelete,
  gameLearnersList,
  textToSpeech,
  getDefaultCat,
  getDefaultSkill,
  getCreatorBlocks,
  getBadge,
  getAudio,
  gameQuestionDuplicateEntire,
  StroyInserting,
  GetStroy,
  ListStroy,
  getGameTemplate,
  viewHistroyMaintance,
  exitTemplateOpen,
  sentFeedbackMail,
  QuestDeletion,
  getCompletionScreen,
  getTotalMinofWords,
  ComplitionUpdate,
  getStoryValidtion,
  getGameCollections,
  getGamePreviewCollection,
};
