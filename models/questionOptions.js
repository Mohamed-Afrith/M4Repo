const { DataTypes } = require("sequelize");
const sequelize = require("../lib/config/database");

const lmsquestionsoption= sequelize.define('lmsquestionsoption', {
  qpOptionId: {
    type: DataTypes.INTEGER(100),
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  qpGameId: {
    type: DataTypes.INTEGER(100),
    allowNull: true,
    // references: {
    //   model: 'Questions', // Assuming you have a Questions table
    //   key: 'questionId'
    // }
  },
  qpQuestionId: {
    type: DataTypes.INTEGER(100),
    allowNull: true,
    // references: {
    //   model: 'Questions', // Assuming you have a Questions table
    //   key: 'questionId'
    // }
  },
  qpSecondaryId:{ 
    type: DataTypes.INTEGER(100),
    allowNull: true,

  },
  qpQuestNo:{
    type: DataTypes.INTEGER(100),
    allowNull: true,

  },
  
  qpOptions :{
    type: DataTypes.STRING(250),
    allowNull: true,
  },
  qpSequence:{
    type: DataTypes.STRING(250),
    allowNull: true,
  },
  qpOptionText: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  qpResponse: {
    type: DataTypes.STRING(250),
    allowNull: true,
  },
  qpResponseEmotion: {
    type: DataTypes.STRING(250),
    allowNull: true,
  },
  qpBlockSecondaryId :{
    type: DataTypes.STRING(250),
    allowNull: true,
  },
  qpNavigateShow: {
    type: DataTypes.STRING(250),
    allowNull: true,
  },
  qpTag: {
    type: DataTypes.ENUM('true', 'false'),
    allowNull: true,
  },
  qpFeedback: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  qpSkillTag: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  qpScore: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  qpTitleTag: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  qpEmotion: {
    type: DataTypes.STRING(100),
    allowNull: true,
    // references: {
    //   model: 'AnimationType', // Assuming you have an AnimationType table
    //   key: 'animationId'
    // }
  },
  qpVoice: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  qpNextOption: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  qbAudioUrl :{
    type: DataTypes.STRING(250),
    allowNull: true,
  },
  qbAudioUrlFemale :{
    type: DataTypes.STRING(250),
    allowNull: true,
  },
  qbResponseAudioUrl :{
    type: DataTypes.STRING(250),
    allowNull: true,
  },
  qbfeedbackAudioUrl :{
    type: DataTypes.STRING(250),
    allowNull: true,
  },
  qpCreatedDatetime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  qpEditedDatetime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  qpDeleteStatus: {
    type: DataTypes.ENUM('Yes', 'No'),
    allowNull: true,
  },
  qpActiveStatus: {
    type: DataTypes.ENUM('Yes', 'No'),
    allowNull: true,
  },
  qpIpAddress: {
    type: DataTypes.STRING(16),
    allowNull: true,
  },
  qpUserAgent: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  qpDeviceType: {
    type: DataTypes.STRING(16),
    allowNull: true,
  },
}, {
  tableName: 'lmsquestionsoption',
  freezeTableName: true,
  timestamps: false,
  underscored: false,
});
// down: async (queryInterface, sequelize) => {
//     await queryInterface.dropTable('lmsQuestionsOption');
//   },
// sequelize 
//   .sync()
//   .then(() => {
//     console.log("LmsQuestionOption table created successfully!");
//   })
//   .catch((error) => {
//     console.error("Unable to create table : ", error);
//   });
// Additional associations or methods can be defined here if needed

module.exports = lmsquestionsoption;
 