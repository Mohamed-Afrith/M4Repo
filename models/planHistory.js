const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../lib/config/database");
const LmsSuperAdmin = require("./admin");


const LmsPlanHistory = sequelize.define(
  "lmscreatorplanhistory",
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
      phPlanValidityFrom: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      phPlanValidityTo: {
        type: DataTypes.DATE,
        allowNull: false,
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
    timestamps: false, 
    freezeTableName: true,
  }
);

// sequelize.sync().then(() => {
//     console.log('planHistory table created successfully!');
//  }).catch((error) => {
//     console.error('Unable to create table : ', error);
//  });
module.exports = LmsPlanHistory;