const { DataTypes } = require("sequelize");
const sequelize = require("../lib/config/database");
const lmsquestion = require("./questionOptions");

const LmsBlocks = sequelize.define(
  "lmsblocks",
  {
    blockGameId: {
      type: DataTypes.INTEGER(100),
      allowNull: true,
    },
    blockQuestNo: {
      type: DataTypes.INTEGER(100),
      allowNull: true,
    }, 
    blockId: {
      type: DataTypes.INTEGER(100),
      allowNull: true,
      primaryKey: true,
      autoIncrement: true,
    },
    blockSecondaryId: {
      type: DataTypes.INTEGER(100),
      allowNull: true,
    },
    blockPrimarySequence: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    blockDragSequence: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    blockType: {
      type: DataTypes.ENUM("reflection", "normal"),
      allowNull: true,
    },
    blockRoll: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    blockResponseRoll: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    blockSkillTag: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    blockTitleTag: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    blockText: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    blockNoOfOptions: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
    },
    blockChoosen: {
      type: DataTypes.ENUM("Note", "Dialog", "Interaction"),
      allowNull: true,
    },
    blockVoiceGender: {
      type: DataTypes.ENUM("male", "female"),
      allowNull: true,
    },
    blockVoiceEmotions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    blockShowNavigate: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    blockLeadTo: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    blockVoiceAccents: {
      type: DataTypes.STRING(11),
      allowNull: true,
    },
    blockCharacterposesId: {
      type: DataTypes.TEXT,
      allowNull: true,
      // references: {
      //   model: 'AnimationCharactersPoses', // Assuming you have an AnimationCharactersPoses table
      //   key: 'characterposesId'
      // }
    },
    blockAssetId: {
      type: DataTypes.INTEGER(100),
      allowNull: true,
      // references: {
      //   model: 'GameAssets', // Assuming you have a GameAssets table
      //   key: 'assetId'
      // }
    },
    blockAnimationId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      // references: {
      //   model: 'animationType', // Assuming you have an animationType table
      //   key: 'animationId'
      // }
    },
    blockCreatedDatetime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    blockEditedDatetime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    blockDeleteStatus: {
      type: DataTypes.ENUM("Yes", "No"),
      allowNull: true,
    },
    blockActiveStatus: {
      type: DataTypes.ENUM("Active", "Inactive"),
      allowNull: true,
    },
    blockIpAddress: {
      type: DataTypes.STRING(16),
      allowNull: true,
    },
    blockUserAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    blockDeviceType: {
      type: DataTypes.STRING(16),
      allowNull: true,
    },
    blockAudioUrl: {
      type: DataTypes.STRING(250),
      allowNull: true,
    },
    blockAudioUrlFemale: {
      type: DataTypes.STRING(250),
      allowNull: true,
    },
    
  },
  {
    tableName: "lmsblocks",
    freezeTableName: true,
    timestamps: false,
    underscored: false,
  }
);
LmsBlocks.belongsTo(lmsquestion, {
  foreignKey: "blockId",
  targetKey: "qpQuestionId",
  as: "MaxScore",
});
lmsquestion.belongsTo(LmsBlocks, {
  foreignKey: "qpQuestionId",
  targetKey: "blockId",
  as: "lmsQuestionBlock",
  scope: {
    blockDeleteStatus: "No",
    blockActiveStatus: "Active",
  },
});
LmsBlocks.hasMany(lmsquestion, {
  foreignKey: "qpQuestionId",
  as: "lmsBlockQuestions",
  scope: {
    blockDeleteStatus: "No",
    blockActiveStatus: "Active",
  },
});
// sequelize
//   .sync()
//   .then(() => {
//     console.log("LmsBlocks table created successfully!");
//   })
//   .catch((error) => {
//     console.error("Unable to create table : ", error);
//   });

// Additional associations or methods can be defined here if needed

module.exports = LmsBlocks;
