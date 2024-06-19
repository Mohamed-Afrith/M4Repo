// models/games.js
const { DataTypes } = require("sequelize");
const sequelize = require("../lib/config/database");
const game = require("./game");
const languages = require("./languages");
const LmsBlocks = require("./blocks");

const lmsGameContentLang = sequelize.define(
            "lmsgamecontentlang",
            {
              gamecontentId: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
              },
              gameId: {
                type: DataTypes.INTEGER,
                allowNull: false,
              },
               translationId: {
                type: DataTypes.INTEGER,
                allowNull: false,
              },
              tblName: {
                 type: DataTypes.STRING(100),
                allowNull: false,
              },
              fieldName:{
                type: DataTypes.STRING(50),
                allowNull: false,
              },
              textId: {
                type: DataTypes.INTEGER,
                allowNull: false,
              },
              content:{
                 type: DataTypes.STRING(250),
                 allowNull: true,
              },            
              audioUrls:
              {
                type: DataTypes.TEXT,
                allowNull: true,
              },
              felmalAudioUrls:
              {
                type: DataTypes.TEXT,
                allowNull: true,
              },
             createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,              
             },
           },
           
            {
              tableName: "lmsgamecontentlang", // Specify the table name if it differs from the model name
              freezeTableName: true,
              updatedAt: false, // Disable updatedAt
            }
          );
//LmsGame.belongsTo(game, { foreignKey: "gameId", as: "image" });
module.exports = lmsGameContentLang;
