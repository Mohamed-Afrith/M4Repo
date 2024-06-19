const { DataTypes } = require("sequelize");
const sequelize = require("../lib/config/database");
const GameReviewers = require("./gameReviewers");
const LmsBlocks = require("./blocks");
const LmsGame = require("./game");

const LmsGameReviews = sequelize.define(
    "lmsgamereviews",
    {
      reviewId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      gameReviewerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      reviewGameId:{
        type: DataTypes.INTEGER(200),
        allowNull: false,
      },
      tabId: {
        type: DataTypes.TINYINT.UNSIGNED,
        allowNull: true,
        validate: {
          isInt: true,
          min: 1,
          max: 255,
        },
      },
      tabAttribute:{
        type: DataTypes.ENUM(['blockSeqId','screenId', 'fieldName']),
        allowNull: true,
      },
      tabAttributeValue:{
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      review:{
        type: DataTypes.STRING(250),
        allowNull: true,
      },
      readStatus: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0, // 0 for unreaded, 1 to marked as readed
    },
      reviewIpAddress: {
        type: DataTypes.STRING(16),
        allowNull: true,
      },
      reviewUserAgent: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      reviewDeviceType: {
        type: DataTypes.STRING(16),
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
      //Used for soft delete. by using commmand in model 
      // paranoid: true, // Enables soft delete
      },

    },
    {
        paranoid: true, // Enables soft delete
        tableName: "lmsgamereviews", // Specify the table name if it differs from the model name
        freezeTableName: true,
    }
    );
    LmsGameReviews.belongsTo(LmsGame, { foreignKey: "reviewGameId", onUpdate: 'CASCADE', onDelete: 'CASCADE'});

module.exports = LmsGameReviews;