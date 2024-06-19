const { DataTypes } = require("sequelize");
const sequelize = require("../lib/config/database");
const LmsGame = require("./game");
const LmsCreator = require("./Creator");
const LmsGameReviews = require("./gameReviews");


const LmsGameReviewers = sequelize.define(
    "lmsgamereviewers",
    {
      gameReviewerId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      creatorId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      emailId: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      activeStatus:{
        type: DataTypes.ENUM(['YES','NO']),
        defaultValue:  "Yes", 
      },
      reviewerIpAddress: {
        type: DataTypes.STRING(16),
        allowNull: true,
      },
      reviewerUserAgent: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      reviewerDeviceType: {
        type: DataTypes.STRING(16),
        allowNull: true,
      },
      createdBy:{
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      updatedBy:{
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      deletedBy:{
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
        onUpdate: sequelize.literal('CURRENT_TIMESTAMP'),
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        // defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      }
     },

    {
        paranoid: true, // Enables soft delete, only returns deletedAt field is null
        tableName: "lmsgamereviewers", // Specify the table name if it differs from the model name
        freezeTableName: true,
    }
    );
    
    LmsGameReviewers.belongsTo(LmsCreator, { foreignKey: "creatorId", targetKey: "ctId", as: "ReviewingCreator", onUpdate: 'CASCADE', onDelete: 'CASCADE'});
    LmsGameReviewers.hasMany(LmsGameReviews, { foreignKey: "gameReviewerId", targetKey: "gameReviewerId", as:"reviews",onUpdate: 'CASCADE', onDelete: 'CASCADE' });
    
module.exports = LmsGameReviewers;