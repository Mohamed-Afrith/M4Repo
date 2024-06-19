const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../lib/config/database");

const LmsGamesAssigned = sequelize.define(
  "lmsgamesassigned",
  {
    gaId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    gaDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    gaGameId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    gaLearnerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    gaNickName: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    gaCancelledDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    gaCancelledReason: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    gaGameState: {
      type: DataTypes.ENUM(
        "not yet started",
        "pause",
        "stop",
        "resume",
        "cancel",
        "completed"
      ),
      allowNull: false,
      defaultValue: "not yet started", // Set your desired default value here
    },
    gaVolumeAdjust: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    gaCreatedUserId: {
      type: DataTypes.INTEGER(100),
      allowNull: false,
    },
    gaEditedUserId: {
      type: DataTypes.INTEGER(100),
      allowNull: true,
    },
    gaCreatedDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    gaEditedDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    gaStatus: {
      type: DataTypes.ENUM("Active", "Inactive"),
      allowNull: false,
    },
    gaDeleteStatus: {
      type: DataTypes.ENUM("NO", "YES"),
      allowNull: false,
      defaultValue: "NO",
    },
    gaIpAddress: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    gaDeviceType: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    gaUserAgent: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "lmsgamesassigned",
    timestamps: false,
    freezeTableName: true,
  }
);
// sequelize
//   .sync()
//   .then(() => {
//     console.log("lmsanimation table created successfully!");
//   })
//   .catch((error) => {
//     console.error("Unable to create table : ", error);
//   });
module.exports = LmsGamesAssigned;
