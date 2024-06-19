const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../lib/config/database");
const LmsSubscriptionPlan = require("./subscriptionvalidityplans");

const LmsPlan = sequelize.define(
  "lmsplan",
  {
    plId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    plPlanName: {
      type: DataTypes.STRING(100),
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      allowNull: false,
    },   
    plMaxLearner:{
      type: DataTypes.INTEGER(100),
      allowNull: false,
    },
    plMaxGame:{
      type: DataTypes.INTEGER(100),
      allowNull: false,
    },
    plMaxBackgrounds:{
      type: DataTypes.INTEGER(100),
      allowNull: false,
    },
    plMaxCharacters:{
      type: DataTypes.INTEGER(100),
      allowNull: false,
    },
    plMaxAnalyticsDashboard:{
      type: DataTypes.INTEGER(100),
      allowNull: false,
    },
    plMAxGameHours:{
      type: DataTypes.INTEGER(100),
      allowNull: false,
    },

    plCreatedUserId: {
      type: DataTypes.INTEGER(100),
      allowNull: false,
    },
    plEditedUserId: {
      type: DataTypes.BIGINT(100),
      allowNull: true,
    },
    plCreatedDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    plEditedDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    plStatus: {
      type: DataTypes.ENUM("Active", "Inactive"),
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      allowNull: false,
      defaultValue: "Active",
    },
    plDeleteStatus: {
      type: DataTypes.ENUM("NO", "YES"),
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      allowNull: false,
      defaultValue: "NO",
    },
    plIpAdderss: {
      type: DataTypes.STRING(100),
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      allowNull: false,
    },
    plDeviceType: {
      type: DataTypes.STRING(100),
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      allowNull: false,
    },
    plUserAgent: {
      type: DataTypes.TEXT,
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      allowNull: false,
    },
    plTimeStamp: {
      type: DataTypes.DATE,
    },
  },
  {
    freezeTableName: true, // Set freezeTableName option to true
  }
);
LmsPlan.hasMany(LmsSubscriptionPlan, { foreignKey: 'psPlanId', as: 'someAlias' });
// LmsSubscriptionPlan.belongsTo(LmsPlan, { foreignKey: 'psPlanId', as: 'someAlias' });
// In lmssubscriptionvalidityplans.js
LmsSubscriptionPlan.belongsTo(LmsPlan, { foreignKey: 'psPlanId', targetKey: 'plId', as: 'someAlias' });

// sequelize
//   .sync()
//   .then(() => {
//     console.log("Lmsplan table created successfully!");
//   })
//   .catch((error) => {
//     console.error("Unable to create table : ", error);
//   });
module.exports = LmsPlan;
