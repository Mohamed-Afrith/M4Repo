const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../lib/config/database");

const Company = sequelize.define(
  "lmscompany",
  {
    cpId: {
        type: DataTypes.INTEGER(100),
        primaryKey: true,
        autoIncrement: true,
      },
      cpCompanyName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      cpAdminName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      cpAdminMail: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      cpIndustry: {
        type: DataTypes.INTEGER(10),
        allowNull: false,
      },
      cpCountry: {
        type: DataTypes.INTEGER(20),
        allowNull: false,
      },
      cpCreatedUserId: {
        type: DataTypes.INTEGER(100),
        allowNull: false,
      },
      cpEditedUserId: {
        type: DataTypes.INTEGER(100),
        allowNull: true,
      },
      cpCreatedDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      cpEditedDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      cpStatus: {
        type: DataTypes.ENUM('Active', 'Inactive'),
        allowNull: false,
        defaultValue: 'Active',
      },
      cpDeleteStatus: {
        type: DataTypes.ENUM('NO', 'YES'),
        allowNull: false,
        defaultValue: 'NO',
        comment: 'YES is deleted data',
      },
      cpIpAddress: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      cpDeviceType: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      cpUserAgent: {
        type: DataTypes.TEXT, // Change the type to TEXT
        allowNull: false
      },
      cpTimeStamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
  },
  {
    timestamps: false,
    freezeTableName: true,
  }
);
// sequelize.sync().then(() => {
//     console.log('Companies table created successfully!');
//  }).catch((error) => {
//     console.error('Unable to create table : ', error);
//  });
module.exports = Company;