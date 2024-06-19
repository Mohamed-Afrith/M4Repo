const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../lib/config/database");
const LmsSuperAdmin = require("./admin");


const LmsPlanValiditys = sequelize.define(
  "lmsplanvalidity",
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
      phValidityType:{
          type:DataTypes.STRING,
          allowNull:true,
      },
      phValidityDays:{
        type: DataTypes.INTEGER,
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
      // phReNewValidityDays:{
      //   type: DataTypes.INTEGER,
      //   allowNull: true,
      // },
      // phReNewValidityFrom: {
      //   type: DataTypes.DATEONLY,
      //   allowNull: true,
      // },
      // phReNewValidityTo: {
      //   type: DataTypes.DATEONLY,
      //   allowNull: true,
      // },
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

sequelize.sync().then(() => {
    console.log('planValidity table created successfully!');
 }).catch((error) => {
    console.error('Unable to create table : ', error);
 });
module.exports = LmsPlanValiditys;