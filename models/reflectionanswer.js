const { DataTypes } = require("sequelize");
const sequelize = require("../lib/config/database");

const LmsCreatorSkills = sequelize.define(
  "lmsreflectionanswer",
  {
   
    refansId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    refansLeanerId: {
      type: DataTypes.INTEGER(200),
      allowNull: true,
    },
    refansGameId: {
        type: DataTypes.INTEGER(200),
      allowNull: true, 
    },
    refansQuestNo: {
        type: DataTypes.INTEGER(10),
      allowNull: true,
    },
    refansQuesId: {
        type: DataTypes.INTEGER(200),
      allowNull: true,
    },
    refansAnswer: {
      type: DataTypes.TEXT, 
      allowNull: true,
    },
    refansGameMode: {
      type: DataTypes.ENUM('game','perview'),
      allowNull: true,
    },
    refansDeleteStatus: {
    type: DataTypes.ENUM('NO','YES'),
    allowNull: false,
    defaultValue: 'NO',
    }, 
    refansIpAddress: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    refansDeviceType: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    refansUserAgent: {
      type: DataTypes.TEXT, // Change the type to TEXT
      allowNull: true,
    },
    refansCreatedDate: {
        type: DataTypes.DATE,
      allowNull: false,
    }
   
  },
  {
    tableName: "lmsreflectionanswer",
    timestamps: false,
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
