// models/games.js
const { DataTypes } = require('sequelize');
const sequelize = require("../lib/config/database");
const LmsGame = require('./game');

const ReflectionQuestion = sequelize.define('lmsreflectionquestion', {
  refId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  refGameId: {
    type: DataTypes.INTEGER(200),
    allowNull: true,
  },	
  refQuestion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  translationId: {                //Afrith-modified-04/May/24 - added translationId
    type: DataTypes.INTEGER(100),
    allowNull: true,
  },
  refKey:{
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  refCreatedUserId: {
    type: DataTypes.INTEGER(100),
    allowNull: true,
  },
  refEditedUserId: {
    type: DataTypes.INTEGER(100),
    allowNull: true,
  },
  refCreatedDatetime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  refEditedDatetime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  refDeleteStatus: {
    type: DataTypes.ENUM('Yes', 'No'),
    allowNull: true,
  },
  refActiveStatus: {
    type: DataTypes.ENUM('Yes', 'No'),
    allowNull: true,
  },
  refIpAddress: {
    type: DataTypes.STRING(16),
    allowNull: true,
  },
  refUserAgent: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  refDeviceType: {
    type: DataTypes.STRING(16),
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    // defaultValue: sequelize.literal('CURRENT_TIMESTAMP'), 
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    // defaultValue: sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
  },
}, {
  tableName: 'lmsreflectionquestion', // Specify the table name if it differs from the model name
  freezeTableName: true,
});
// sequelize
//   .sync()
//   .then(() => {
//     console.log("lmsreflectionquestion table created successfully!");
//   })
//   .catch((error) => {
//     console.error("Unable to create table : ", error);
//   });

module.exports = ReflectionQuestion;
