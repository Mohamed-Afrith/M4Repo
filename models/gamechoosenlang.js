// models/games.js
const { DataTypes } = require("sequelize");
const sequelize = require("../lib/config/database");
const game = require("./game");
const languages = require("./languages");
 
const lmsGameChoosenLang = sequelize.define(
            "lmsgamechoosenlang",
            {
              gamechoosenId: {
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
              gameNonPlayerVoice: {
                type: DataTypes.STRING(250),
                allowNull: true,
              },
              gamePlayerMaleVoice: {
                type: DataTypes.STRING(250),
                allowNull: true,
              },
              gamePlayerFemaleVoice: {
                type: DataTypes.STRING(250),
                allowNull: true,
              },
              gameNarratorVoice: {
                type: DataTypes.STRING(250),
                allowNull: true,
              },
             createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
               defaultValue: DataTypes.NOW,              
             },
              
           },
            {
              tableName: "lmsgamechoosenlang", // Specify the table name if it differs from the model name
              freezeTableName: true,
updatedAt: false, // Disable updatedAt
            }
          );
//LmsGame.belongsTo(game, { foreignKey: "gameId", as: "image" });
// In lmsGameChoosenLang model file
lmsGameChoosenLang.belongsTo(languages, { foreignKey: 'translationId' });

module.exports = lmsGameChoosenLang;
