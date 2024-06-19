const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../lib/config/database");
const LmsPlan = require("./plan");
const LmsPlanSubscription = sequelize.define(
  "lmssubscriptionvalidityplans",
  {
    psId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    psPlanId: {
      type: DataTypes.INTEGER,
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      allowNull: false,
    },
    psPlanType: {
      type: DataTypes.ENUM("Days", "Month", "Year"),
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      allowNull: false,
    },
    psPlanDuration: {
      type: DataTypes.BIGINT(20),
      allowNull: false,
    },
    psPrice: {
      type: DataTypes.INTEGER(100),
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      allowNull: true,
    },
    psCreatedUserId: {
      type: DataTypes.INTEGER(100),
      allowNull: false,
    },
    psEditedUserId: {
      type: DataTypes.BIGINT(100),
      allowNull: true,
    },
    psCreatedDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    psEditedDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    psStatus: {
      type: DataTypes.ENUM("Active", "Inactive"),
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      allowNull: false,
      defaultValue: "Active",
    },
    psDeleteStatus: {
      type: DataTypes.ENUM("NO", "YES"),
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      allowNull: false,
      defaultValue: "NO",
    },
    psIpAdderss: {
      type: DataTypes.STRING(100),
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      allowNull: false,
    },
    psDeviceType: {
      type: DataTypes.STRING(100),
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      allowNull: false,
    },
    psUserAgent: {
      type: DataTypes.TEXT,
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      allowNull: false,
    },
    psTimeStamp: {
      type: DataTypes.DATE,
    },
  },
  {
    freezeTableName: true, // Set freezeTableName option to true
  }
);
// LmsSubscriptionPlan.belongsTo(LmsPlan, { foreignKey: 'psPlanId', as: 'someAlias' });
// In lmssubscriptionvalidityplans.js
// LmsSubscriptionPlan.belongsTo(LmsPlan, { foreignKey: 'psPlanId', targetKey: 'plId', as: 'someAlias' });
// LmsSubscriptionPlan.belongsTo(LmsPlan, { foreignKey: 'psPlanId', as: 'someAlias' });

// sequelize
//   .sync()
//   .then(() => {
//     console.log("LmsPlanSubscription table created successfully!");
//   })
//   .catch((error) => {
//     console.error("Unable to create table : ", error);
//   });
module.exports = LmsPlanSubscription;
