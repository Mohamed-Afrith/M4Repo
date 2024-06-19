const { Sequelize } = require("sequelize");
const sequelize = require("../lib/config/database");
const LmsGameReviewers = require("./gameReviewers");
const LmsGame = require("./game");

const LmsReviewersGame = sequelize.define(
    "lmsreviewersgames",
    {
      gameUuid: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      gameId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      reviewerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      mailStatus:{
        type: Sequelize.ENUM(['queued','sent','failed']),
        allowNull: false,
        defaultValue: 'queued'
      },
      statusMessage: {
        type: Sequelize.STRING(250),
        allowNull: true,
      },
      mailMessageId: {
        type: Sequelize.STRING(250),
        allowNull: true,
      },
    },
    {
        tableName: "lmsreviewersgames", // Specify the table name if it differs from the model name
        freezeTableName: true,
        timestamps: false, // Disable timestamps
        primaryKey: false, // Exclude the default 'id' field
    }
    );
    LmsReviewersGame.belongsTo(LmsGameReviewers, { foreignKey: "reviewerId", targetKey: "gameReviewerId", onUpdate: 'CASCADE', onDelete: 'CASCADE'});
    LmsReviewersGame.belongsTo(LmsGame, { foreignKey: "gameId" , onUpdate: 'CASCADE', onDelete: 'CASCADE'});

module.exports = LmsReviewersGame;