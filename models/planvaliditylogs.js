const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../lib/config/database");
const LmsSuperAdmin = require("./admin");


const LmsPlanValidity = sequelize.define(
  "lmsplanvaliditylog",
  {
    phId: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      phCreatorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      phPlanId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      // phPlanType:{
      //   type: DataTypes.ENUM("Days", "Month", "Year"),
      //   charset: "utf8mb4",
      //   collate: "utf8mb4_general_ci",
      //   allowNull: false,
      // },
      phValidityDays:{
        type: DataTypes.STRING,
        allowNull: false,
      },
      phPlanValidityFrom: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      phPlanValidityTo: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      phRenewalPlanId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      // phRenewalPlanType:{
      //   type: DataTypes.ENUM("Days", "Month", "Year"),
      //   charset: "utf8mb4",
      //   collate: "utf8mb4_general_ci",
      //   allowNull: true,
      // },
      phRenewalValidityDays:{
        type: DataTypes.STRING,
        allowNull: true,
      },
      phRenewalPlanValidityFrom: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      phRenewalPlanValidityTo: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      phCreatedDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      phIpAddress: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      phDeviceType: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      phUserAgent: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
  },
  {
    timestamps: true, 
    freezeTableName: true,
  }
);

// sequelize.sync()
//   .then(() => {
//     console.log('planValiditylogs table created successfully!');
//   })
//   .catch((error) => {
//     console.error('Unable to create table:', error);
//   });
  const LmsCreator = require("./Creator");

  // LmsPlanValidity.belongsTo(LmsCreator, { foreignKey: 'phCreatorId' });
 // Inside LmsPlanValidity model definition
// LmsPlanValidity.belongsTo(LmsCreator, { foreignKey: 'phCreatorId' });
// LmsCreator.hasMany(LmsPlanValidity, { foreignKey: 'phCreatorId' });

module.exports = LmsPlanValidity;