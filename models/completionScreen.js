const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../lib/config/database");


const CompletionScreen = sequelize.define('lmscompletionscreen', {
    csId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      csGameId: {
        type: DataTypes.INTEGER,
      },
      csBlockId: {
        type: DataTypes.INTEGER,
      },
      csBadge: {
        type: DataTypes.ENUM('true','false'),
      },
      csBadgeName: {
        type: DataTypes.STRING(250),
      },
      csBadgeUrl: {
        type: DataTypes.TEXT,
      },
      csBadgeAssetId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        
      },
      csBaxCondition: {
        type: DataTypes.INTEGER,
      },
      csBinCondition: {
        type: DataTypes.INTEGER,
      },
      csSkillwiseScore: {
        type: DataTypes.ENUM('true','false'),
      },
      csMinScore:{
        type: DataTypes.INTEGER,
      },
      csMaxScore:{
        type: DataTypes.INTEGER,
      },
      csWishMessage: {
        type: DataTypes.STRING(250),
      },
      csType: {
        type: DataTypes.ENUM('GAME', 'QUESTION'),
      },
      csCreatedDatetime: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      csEditedDatetime: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      csIpAddress: {
        type: DataTypes.STRING(16),
      },
      csUserAgent: {
        type: DataTypes.TEXT,
      },
      csDeviceType: {
        type: DataTypes.STRING(16),
      },
},
{
    timestamps: false,
    freezeTableName: true,
  });

// sequelize.sync().then(() => {
//     console.log('Completion table created successfully!');
//  }).catch((error) => {
//     console.error('Unable to create table : ', error);
//  });

// Export the CompletionScreen model for use in other parts of your application
module.exports = CompletionScreen;