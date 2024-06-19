const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../lib/config/database");

const lmsCollectFeedback = sequelize.define("lmscollectfeedback", {
    feedLearnerId : {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  feedGameId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  feedQuestNo: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  feedContent: {
    type: DataTypes.INTEGER(255),
    allowNull: true,
  },
  feedRecommendation:{
    type:DataTypes.INTEGER(255),
    allowNull: true,
  },
  feedRelevance: {
    type: DataTypes.INTEGER(255),
    allowNull: true,
  },

  feedGamification: {
    type: DataTypes.INTEGER(255),
    allowNull: true,
  },
  feedBehaviour: {
    type: DataTypes.INTEGER(255),
    allowNull: true,
  },
  feedOthers: {
    type: DataTypes.TEXT,
    allowNull: false
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

module.exports = lmsCollectFeedback;
