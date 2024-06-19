 const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../lib/config/database");
const lmsGame=require('./game')
const lmsGameActivityLog = sequelize.define("lmsgameactivitylog", {
  galId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  galGameId: {
    type: DataTypes.INTEGER(100),
    allowNull: true,
    
  },
  galQuestNo:{
    type:DataTypes.INTEGER(100),
    allowNull: true,
  },
  galLearnerId: {
    type: DataTypes.INTEGER(100),
    allowNull: true,
  },
  galGameState: {
    type: DataTypes.STRING(11),
    allowNull: true,
  },
  galBlockId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  galQuestionState: {
    type: DataTypes.ENUM("start", "replayed",'complete'),
    allowNull: false,
    defaultValue: "start",
    allowNull: true,
  },
  galTimeSpent: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  galgameflow:{
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  galAverageScore: {
    type: DataTypes.INTEGER(11),
    allowNull: true,
  },
  galStartDateTime: {
    type: DataTypes.DATE,
    defaultValue: null,
    allowNull: true,
  },
  galEndDateTime: {
    type: DataTypes.DATE,
    defaultValue: null,
    allowNull: true,
  },
  galCreatedDate: {
    type: DataTypes.DATE,
    defaultValue: null,
    allowNull: true,
  },
  galIpAddress: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  galUserAgent: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  galDeviceType: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
},{
    timestamps: false,
    freezeTableName: true, 
  });

  // sequelize
  // .sync()
  // .then(() => {
  //   console.log("LmsGame table created successfully!");
  // })
  // .catch((error) => {
  //   console.error("Unable to create table: ", error.message); // Fix the typo here
  // });
 
module.exports = lmsGameActivityLog;
