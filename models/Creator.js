const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../lib/config/database");
const companies = require("./companies");
const LmsCreator = sequelize.define(
  "lmscreator",
  {
    ctId: {
      type: DataTypes.INTEGER(100),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    ctCompanyId: {
      type: DataTypes.INTEGER(100),
      allowNull: false,
    },
    ctUUID: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false
    },
    ctName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    ctMail: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    ctPlanId: {
      type: DataTypes.INTEGER(100),
      allowNull: true,
    },
    ctPlanValidity: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // ctRenewPlanValidity: {
    //   type: DataTypes.INTEGER(100),
    //   allowNull: true,
    // },
    ctCountry: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
    },
    ctDesignation: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    ctAge: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    ctGender: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    ctPassword: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    ctCreatedUserId: {
      type: DataTypes.INTEGER(100),
      defaultValue: null,
    },
    ctEditedUserId: {
      type: DataTypes.INTEGER(100),
      allowNull: true,
      defaultValue: null,
    },
    ctCreatedDate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    ctEditedDate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    ctCreateAdminId: {
      type: DataTypes.INTEGER(20),
      defaultValue: null,
    },
    ctEditAdminId: {
      type: DataTypes.INTEGER(20),
      defaultValue: null,
    },
    ctCreateAdminDate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    ctEditAdminDate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    ctStatus: {
      type: DataTypes.ENUM("Active", "Inactive"),
      allowNull: false,
      defaultValue: "Active",
    },
    ctDeleteStatus: {
      type: DataTypes.ENUM("NO", "YES"),
      allowNull: false,
      defaultValue: "NO",
      comment: "YES for delete data",
    },
    ctIpAddress: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    ctDeviceType: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    ctUserAgent: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    freezeTableName: true, // Set freezeTableName option to true
  }
);
const LmsPlanValidity = require("./planvaliditylogs");

LmsCreator.hasMany(LmsPlanValidity, { foreignKey: 'phCreatorId', as: 'validityLogs' });
// LmsPlan.hasMany(LmsSubscriptionPlan, { foreignKey: 'psPlanId', as: 'someAlias' });
// LmsSubscriptionPlan.belongsTo(LmsPlan, { foreignKey: 'psPlanId', as: 'someAlias' });
// In lmssubscriptionvalidityplans.js
LmsPlanValidity.belongsTo(LmsCreator, { foreignKey: 'phCreatorId', targetKey: 'ctId', as: 'plvali' });
LmsCreator.belongsTo(companies, { foreignKey: 'ctCompanyId', targetKey: 'cpId' });
companies.hasMany(LmsCreator, { foreignKey: 'ctCompanyId', sourceKey: 'cpId' });

// sequelize
//   .sync()
//   .then(() => {
//     console.log("LmsCreator table created successfully!");
//   })
//   .catch((error) => {
//     console.error("Unable to create table : ", error);
//   });
module.exports = LmsCreator;
