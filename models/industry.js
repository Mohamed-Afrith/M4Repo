const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../lib/config/database");

const LmsCohorts = sequelize.define(
  "lmsindustry",
  {
    itId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    itIndustryName: {
      type: DataTypes.STRING(250),
      allowNull: false,
    },
    itCreatedDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    itEditedDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    itStatus: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    itDeleteStatus: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    itIpAddress: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    itDeviceType: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    itUserAgent: {
      type: DataTypes.TEXT, 
      allowNull: false,
    },
    itTimeStamp: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "lmsindustry",
    timestamps: true, // Enable timestamps for createdAt and updatedAt
    underscored: false,
    freezeTableName: true,
  }
);

// Sync the model with the database
// sequelize
//   .sync() // This will force the creation of the table (use with caution)
//   .then(() => {
//     console.log("LmsIndustry table created successfully!");
//   })
//   .catch((error) => {
//     console.error("Unable to create table: ", error);
//   });

module.exports = LmsCohorts;
