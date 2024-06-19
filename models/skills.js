const { DataTypes } = require("sequelize");
const sequelize = require("../lib/config/database");

const LmsCreatorSkills = sequelize.define(
  "lmscreatorskills",
  {
    crSkillId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    crSkillName: {
      type: DataTypes.STRING(250),
      allowNull: false,
    },
    crSkillStatus: {
      type: DataTypes.ENUM('Active','Inactive'),
      allowNull: false, 
    },
    crDeleteStatus: {
      type: DataTypes.ENUM('YES','NO'),
      allowNull: false,
    },
    crCreatedAdminId: {
      type: DataTypes.INTEGER, 
      allowNull: true,
    },
    crCreatedCreatorId: {
      type: DataTypes.INTEGER(100), 
      allowNull: true,
    },
    crDefaultStatus: {
      type: DataTypes.ENUM('YES','NO'),
      allowNull: false,
      defaultValue: 'NO',
    },
    crCreatedDate: {
      type: DataTypes.DATE,
      allowNull: false,
    }, 
    crEditedDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    crEditedAdminId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    crEditedCreatorId: {
      type: DataTypes.INTEGER, // Change the type to TEXT
      allowNull: true,
    },
    crUserAgent: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
     crIpAddress: {
        type: DataTypes.STRING(100),
        allowNull: false,
     },
     crDeviceType:{
        type: DataTypes.STRING(100),
        allowNull:false, 
     }
  },
  {
    tableName: "lmscreatorskills",
    timestamps: true,
    underscored: false,
    freezeTableName: true,
  }
);

// sequelize
//   .sync() 
//   .then(() => {
//     console.log("lmsskills table created successfully!");
//   })
//   .catch((error) => {
//     console.error("Unable to create table: ", error);
//   });
module.exports = LmsCreatorSkills;
