const { DataTypes } = require("sequelize");
const sequelize = require("../lib/config/database");

const Question = sequelize.define('lmsquestion', {
  questionId: {
    type: DataTypes.INTEGER(100),
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  qusGameId: {
    type: DataTypes.INTEGER(100),
    allowNull: false,
    // references: {
    //   model: 'Games', // Assuming you have a Games table
    //   key: 'gameId'
    // }
  },
  qusType: {
    type: DataTypes.ENUM('reflection', 'normal'),
    allowNull: false,
  },
  questionText: {
    type: DataTypes.STRING(250),
    allowNull: false,
  },
  qusNoOfOptions: {
    type: DataTypes.INTEGER(11),
    allowNull: false,
  },
  qusVoiceId: {
    type: DataTypes.INTEGER(11),
    allowNull: false,
    // references: {
    //   model: 'VoiceTypes', // Assuming you have a VoiceTypes table
    //   key: 'voiceId'
    // }
  },
  qusCharacterId: {
    type: DataTypes.INTEGER(100),
    allowNull: false,
    // references: {
    //   model: 'AnimationCharacter', // Assuming you have an AnimationCharacter table
    //   key: 'characterId'
    // }
  },

  qusBlockOption: {
    type: DataTypes.ENUM('Note', 'Dialogue', 'Interactions'),
    allowNull: true,
  },

  qusAnimationId: {
    type: DataTypes.INTEGER(11),
    allowNull: false,
    // references: {
    //   model: 'AnimationType', // Assuming you have an AnimationType table
    //   key: 'animationId'
    // }
  },
  qusGameFlow:{
    type:DataTypes.INTEGER(20),
    allowNull:true,
  },
  qusCreatedDatetime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  qusEditedDatetime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  qusDeleteStatus: {
    type: DataTypes.ENUM('Yes', 'No'),
    allowNull: false,
  },
  qusActiveStatus: {
    type: DataTypes.ENUM('Yes', 'No'),
    allowNull: false,
  },
  qusIpAddress: {
    type: DataTypes.STRING(16),
    allowNull: false,
  },
  qusUserAgent: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  qusDeviceType: {
    type: DataTypes.STRING(16),
    allowNull: false,
  },
}, {
  tableName: 'lmsquestion',
  freezeTableName: true,
  timestamps: false,
  underscored: false,
});
//  down: async (queryInterface, sequelize) => {
//     await queryInterface.dropTable('lmsquestion');
//   },
// sequelize
//   .sync()
//   .then(() => {
//     console.log("LmsQuestion table created successfully!");
//   })
//   .catch((error) => {
//     console.error("Unable to create table : ", error);
//   });
// Additional associations or methods can be defined here if needed

module.exports = Question;
