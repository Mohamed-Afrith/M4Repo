const { DataTypes } = require("sequelize");
const sequelize = require("../lib/config/database");

const lmsgameviewhistory = sequelize.define(
  "lmsgameviewhistory",
  {
    gvId: {
      type: DataTypes.INTEGER(200),
     allowNull: true,
     primaryKey: true,
     autoIncrement: true,
      // references: {
      //   model: 'Games', // Assuming you have a Games table
      //   key: 'gameId'
      // }
    },
    gvgameId: {
      type: DataTypes.INTEGER(200),
     allowNull: true,
     
    },
    gvViewUserId: {
      type: DataTypes.INTEGER(100),
     allowNull: true,
    },
    gvIpAddress: {
      type: DataTypes.STRING(100),
     allowNull: true,
     
    },
    gvUserAgent: {
        type: DataTypes.TEXT,
     allowNull: true,
     
    },
    gvDeviceType: {
        type: DataTypes.TEXT,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

  },
  {
    tableName: "lmsgameviewhistory",
    freezeTableName: true,
    timestamps: false,
    underscored: false,
  }
);



// sequelize
//   .sync()
//   .then(() => { 
//     console.log("LmsBlocks table created successfully!");
//   })
//   .catch((error) => {
//     console.error("Unable to create table : ", error);
//   });

// Additional associations or methods can be defined here if needed

module.exports = lmsgameviewhistory;
