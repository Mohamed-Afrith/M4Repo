const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../lib/config/database");

const LmsCohorts = sequelize.define(
  "lmscohorts",
  {
    chId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    chCohortsName: {
      type: DataTypes.STRING(250),
      allowNull: false,
    },
    chCreatedDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    chCreatedUserId: {
      type: DataTypes.INTEGER(100),
      allowNull: false,
    },
    chEditedDate: {
      type: DataTypes.DATE, 
      allowNull: true,
    },
    chEditedUserId: {
      type: DataTypes.INTEGER(100), 
      allowNull: true,
    },
    chStatus: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    chDeleteStatus: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    chIpAddress: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    chDeviceType: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    chUserAgent: {
      type: DataTypes.TEXT, // Change the type to TEXT
      allowNull: false,
    },
    chTimeStamp: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "lmscohorts",
    timestamps: true, // Enable timestamps for createdAt and updatedAt
    underscored: false,
    freezeTableName: true,
  }
);

// Sync the model with the database
// sequelize
//   .sync() // This will force the creation of the table (use with caution)
//   .then(() => {
//     console.log("LmsCohorts table created successfully!");
//   })
//   .catch((error) => {
//     console.error("Unable to create table: ", error);
//   });
module.exports = LmsCohorts;
