// models/games.js
const { DataTypes } = require("sequelize");
const sequelize = require("../lib/config/database");
const gameAssest = require("./gameAsset");
const gameHistory=require("./gameviewhistory");
const LmsBlocks=require("./blocks");
const Questionoption=require("./questionOptions")
const lmsGameActivityLog=require("./gameActivityLog")

//gameLastTabArray
// gameCompletionScreenId: null,
// gameLeaderboardScreenId: null,
// gameReflectionPageId: null,
// gameReflectionScreenId: null,
// gameTakeawayScreenId: null,
// gameWelcomepageBackgroundScreenId: null,
// gameThankYouScreenId: null,
const LmsGame = sequelize.define(
  "lmsgame",
  {
    gameId: {
      type: DataTypes.INTEGER(200),
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    gameQuestNo: {
      type: DataTypes.INTEGER(200),

      allowNull: true,
    },

    gameNonPlayerName: {
      type: DataTypes.STRING(250),
      allowNull: true,
    },
    gameNonPlayerVoice: {
      type: DataTypes.STRING(250),
      allowNull: true,
    },
    gamePlayerMaleVoice: {
      type: DataTypes.STRING(250),
      allowNull: true,
    },
    gamePlayerFemaleVoice: {
      type: DataTypes.STRING(250),
      allowNull: true,
    },
    gameNarratorVoice: {
      type: DataTypes.STRING(250),
      allowNull: true,
    },

    gameCompletionScreenId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    gameLeaderboardScreenId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    gameReflectionScreenId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    gameTakeawayScreenId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    gameWelcomepageBackgroundScreenId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    gameThankYouScreenId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    gameCategoryId: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    gameBackgroundId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    gameNonPlayingCharacterId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    gameCharacterName: {
      type: DataTypes.STRING(250),
      allowNull: true,
    },
    gameTitle: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    gameStoryLine: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    gameSkills: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    gameLearningOutcome: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    gameDuration: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    gameAuthorName: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    gameIsShowLeaderboard: {
      type: DataTypes.ENUM("true", "false"),
      allowNull: true,
    },
    gameIsShowReflectionScreen: {
      type: DataTypes.ENUM("true", "false"),
      allowNull: true,
    },
    gameTakeawayContent: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gameAdditionalWelcomeNote: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gameThankYouMessage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gameIsCollectLearnerFeedback: {
      type: DataTypes.ENUM("true", "false"),
      allowNull: true,
    },
    gameIsFeedbackMandatory: {
      type: DataTypes.ENUM("true", "false"),
      allowNull: true,
    },
    gameIsLearnerMandatoryQuestion: {
      type: DataTypes.ENUM("true", "false"),
      allowNull: true,
    },
    gameIsAddanotherQuestions: {
      type: DataTypes.ENUM("true", "false"),
      allowNull: true,
    },
    gameIsSetMinPassScore: {
      type: DataTypes.ENUM("true", "false"),
      allowNull: true,
    },
    gameIsSetDistinctionScore: {
      type: DataTypes.ENUM("true", "false"),
      allowNull: true,
    },
    gameDistinctionScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    gameIsSetSkillWiseScore: {
      type: DataTypes.ENUM("true", "false"),
      allowNull: true,
    },
    gameIsSetBadge: {
      type: DataTypes.ENUM("true", "false"),
      allowNull: true,
    },
    gameBadge: {
      type: DataTypes.STRING(250),
      allowNull: true,
    },
    gameBadgeName: {
      type: DataTypes.STRING(250),
      allowNull: true,
    },
    gameIsSetCriteriaForBadge: {
      type: DataTypes.ENUM("true", "false"),
      allowNull: true,
    },
    gameAwardBadgeScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    gameScreenTitle: {
      type: DataTypes.STRING(250),
      allowNull: true,
    },
    gameIsSetCongratsSingleMessage: {
      type: DataTypes.ENUM("true", "false"),
      allowNull: true,
    },
    gameIsSetCongratsScoreWiseMessage: {
      type: DataTypes.ENUM("true", "false"),
      allowNull: true,
    },
    gameCompletedCongratsMessage: {
      type: DataTypes.STRING(250),
      allowNull: true,
    },
    gameMinimumScoreCongratsMessage: {
      type: DataTypes.STRING(250),
      allowNull: true,
    },
    gameaboveMinimumScoreCongratsMessage: {
      type: DataTypes.STRING(250),
      allowNull: true,
    },
    gameLessthanDistinctionScoreCongratsMessage: {
      type: DataTypes.STRING(250),
      allowNull: true,
    },
    gameAboveDistinctionScoreCongratsMessage: {
      type: DataTypes.STRING(250),
      allowNull: true,
    },
    gameIsShowTakeaway: {
      type: DataTypes.ENUM("true", "false"),
      allowNull: true,
    },
    gameIsShowSkill: {
      type: DataTypes.ENUM("true", "false"),
      allowNull: true,
    },
    gameIsShowStoryline: {
      type: DataTypes.ENUM("true", "false"),
      allowNull: true,
    },
    gameIsShowLearningOutcome: {
      type: DataTypes.ENUM("true", "false"),
      allowNull: true,
    },
    gameIsShowGameDuration: {
      type: DataTypes.ENUM("true", "false"),
      allowNull: true,
    },
    gameIsShowAuhorName: {
      type: DataTypes.ENUM("true", "false"),
      allowNull: true,
    },
    gameIsShowAdditionalWelcomeNote: {
      type: DataTypes.ENUM("true", "false"),
      allowNull: true,
    },
    gameMinScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    gameIsSetMinimumScore: {
      type: DataTypes.ENUM("true", "false"),
      allowNull: true,
    },
    gameMaxScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    gameTotalScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    gameCreatorUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    gameEditorUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    gameAnotherCreatorId: {
      type: DataTypes.STRING(250),
      allowNull: true,
    },
    gameReplayAllowed: {
      type: DataTypes.ENUM("true", "false"),
      allowNull: true,
    },
    gameReflectionpageAllowed: {
      type: DataTypes.ENUM("true", "false"),
      allowNull: true,
    },
    gameReflectionpageBackground: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    gameFeedbackQuestion: {
      type: DataTypes.ENUM("true", "false"),
      allowNull: true,
    },
    gameWelcomepageBackground: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    gameLeaderboardAllowed: {
      type: DataTypes.ENUM("true", "false"),
      allowNull: true,
    },
    gameReflectionpageid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    gameLanguageId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    gameSummaryScreen: {
      type: DataTypes.ENUM("true", "false"),
      allowNull: true,
    },
    gameIntroMusic: {
      type: DataTypes.STRING(250),
      allowNull: true,
    },
    gameIntroMusicName: {
      type: DataTypes.STRING(250),
      allowNull: true,
    },
    gameDefaultFeedbackForm: {
      type: DataTypes.ENUM("true", "false"),
      allowNull: true,
    },
    gameSummarizes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    gamWelcomePageText: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    gameThankYouPage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    gameReflectionQuestion: {
      type: DataTypes.INTEGER(10),
      allowNull: true,
    },
    gameQuestion1: {
      type: DataTypes.ENUM("true", "false"),
      allowNull: true,
    },
    gameQuestion2: {
      type: DataTypes.ENUM("true", "false"),
      allowNull: true,
    },
    gameQuestionValue1: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gameQuestionValue2: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gameQuestionValue3: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gameQuestionValue4: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gameGameStage: {
      type: DataTypes.ENUM("Creation", "Review", "Launched"),
      allowNull: true,
    },
    gameDuplicated: {
      type: DataTypes.ENUM("YES", "NO"),
      allowNull: true,
      defaultValue: "NO",
    },

    gameCourseType: {
      type: DataTypes.ENUM("Private", "Public"),
      allowNull: true,
    },
    gameLaunchedWithinPlatform: {
      type: DataTypes.ENUM("true", "false"),
      allowNull: true,
    },
    gameContent: {
      type: DataTypes.ENUM("true", "false"),
      allowNull: true,
    },

    gameRelevance: {
      type: DataTypes.ENUM("true", "false"),
      allowNull: true,
    },
    gameBehaviour: {
      type: DataTypes.ENUM("true", "false"),
      allowNull: true,
    },
    gameOthers: {
      type: DataTypes.ENUM("true", "false"),
      allowNull: true,
    },
    gameGamification: {
      type: DataTypes.ENUM("true", "false"),
      allowNull: true,
    },
    gameRecommendation: {
      type: DataTypes.ENUM("true", "false"),
      allowNull: true,
    },
    gameFeedBack: {
      type: DataTypes.ENUM("true", "false"),
      allowNull: true,
    },
    gameFeedBackLink: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    gameScormVersion: {
      type: DataTypes.STRING(250),
      allowNull: true,
    },
    gameIsShowInteractionFeedBack: {
      type: DataTypes.ENUM("Each", "Completion"),
      allowNull: true,
    },
    gameShuffle: {
      type: DataTypes.ENUM("true", "false"),
      allowNull: true,
    },
    gameDisableOptionalReplays: {
      type: DataTypes.ENUM("true", "false"),
      allowNull: true,
    },
    gameTrackQuestionWiseAnswers: {
      type: DataTypes.ENUM("true", "false"),
      allowNull: true,
    },
    gameDisableLearnerMailNotifications: {
      type: DataTypes.ENUM("true", "false"),
      allowNull: true,
    },
    gameLastTab: {
      type: DataTypes.INTEGER(100),
      allowNull: true,
    },
    gameLastTabArray: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    gameCreatedUserId: {
      type: DataTypes.INTEGER(100),
      allowNull: true,
    },
    gameCreatedDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    gameEditedUserId: {
      type: DataTypes.INTEGER(100),
      allowNull: true,
    },
    gameEditedDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    gameExtensionId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
 gameCohorts: {
                //type: DataTypes.ARRAY(DataTypes.INTEGER),
                type: DataTypes.JSON,
                allowNull: true,
              },
    gameDeleteStatus: {
      type: DataTypes.ENUM("YES", "NO"),
      allowNull: true,
    },
    gameActiveStatus: {
      type: DataTypes.ENUM("Active", "Inactive"),
      allowNull: true,
    },
    gameIpAddress: {
      type: DataTypes.STRING(16),
      allowNull: true,
    },
    gameUserAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    gameDeviceType: {
      type: DataTypes.STRING(16),
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      // defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    gameStageDate: {
      type: DataTypes.DATE,
      allowNull: true,
      // defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      // defaultValue: sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
    },
  },
  {
    tableName: "lmsgame", // Specify the table name if it differs from the model name
    freezeTableName: true,
  }
);
// LmsGame.belongsTo(ReflectionQuestion, { foreignKey: 'gameReflectionQuestion', targetKey: 'refId', as: 'reflectionQuestions' });
LmsGame.belongsTo(gameAssest, { foreignKey: "gameBackgroundId", as: "image" });
LmsGame.belongsTo(gameAssest, {
  foreignKey: "gameNonPlayingCharacterId",
  as: "npc",
});
LmsGame.belongsTo(gameHistory, { foreignKey: "gameId", as: "gameview" });
LmsGame.hasMany(LmsBlocks, { foreignKey: "blockGameId" });
LmsBlocks.belongsTo(LmsGame, { foreignKey: "blockGameId" });
LmsGame.hasMany(Questionoption, { foreignKey: "qpGameId" });

LmsBlocks.belongsTo(LmsGame, { foreignKey: 'blockGameId' });
Questionoption.belongsTo(LmsGame, { foreignKey: 'qpGameId' });


LmsGame.hasMany(lmsGameActivityLog, { foreignKey: 'galGameId' });
LmsGame.belongsTo(LmsGame, {
  as: "ExtensionGame", // Alias for the associated game
  foreignKey: "gameExtensionId", // Foreign key in the current LmsGame instance
  targetKey: "gameId", // Target key in the associated LmsGame instance
});

LmsGame.hasMany(LmsGame, {
  as: "gameQuest",
  foreignKey: "gameExtensionId",
  scope: {
    gameDeleteStatus: "No",
    gameActiveStatus: "Active",
  },
});

// sequelize
//   .sync({alter:true})
//   .then(() => {
//     console.log("LmsGame table created successfully!");
//   })
//   .catch((error) => {
//     console.error("Unable to create table : ", error.messsage);
//   });

module.exports = LmsGame;
