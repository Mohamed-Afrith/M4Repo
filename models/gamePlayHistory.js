const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../lib/config/database");
const lmsGameActivityLog = require('./gameActivityLog');

const lmsGamePlayHistory = sequelize.define("lmsgameplayhistory", {
  histId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  histActivityId: {
    type: DataTypes.INTEGER(200),
    defaultValue: null,
    allowNull: true,
  },
  histLearnerId:{
    type:DataTypes.INTEGER(200),
    defaultValue: null,
    allowNull: true,
  },
  histGameId: {
    type: DataTypes.INTEGER(200),
    defaultValue: null,
    allowNull: true,
  },
  histQuestNo: {
    type: DataTypes.INTEGER(100),
    defaultValue: null,
    allowNull: true,
  },
  histBlockId: {
    type: DataTypes.INTEGER(200),
    defaultValue: null,
    allowNull: true,
  },
  histType: {
    type: DataTypes.STRING(200),
    defaultValue: null,
    allowNull: true,
  },
  histNavigateTo:{
    type: DataTypes.STRING(100),
    defaultValue: null,
    allowNull: true,
  },
  histOption: {
    type: DataTypes.STRING(100),
    defaultValue: null,
    allowNull: true,
  },
  histScore: {
    type: DataTypes.STRING(200),
    defaultValue: null,
    allowNull: true,
  },
  histStartDateTime: {
    type: DataTypes.DATE,
    defaultValue: null,
    allowNull: true,
  },
  histEndDateTime: {
    type: DataTypes.DATE,
    defaultValue: null,
    allowNull: true,
  },
  histCreatedDate: {
    type: DataTypes.DATE,
    defaultValue: null,
    allowNull: true,
  },
  histIp: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  histUserAgent: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  histDeviceType: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
},{
    timestamps: false,
    freezeTableName: true, 
  });

//   lmsGamePlayHistory.belongsTo(lmsGameActivityLog, {
//         foreignKey: 'histActivityId',
//         targetKey: 'galId',
//   });


  // sequelize
  // .sync()
  // .then(() => {
  //   console.log("LmsGame table created successfully!");
  // })
  // .catch((error) => {
  //   console.error("Unable to create table: ", error.message); // Fix the typo here
  // });

module.exports = lmsGamePlayHistory;
