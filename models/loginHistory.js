const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../lib/config/database");
const LmsGame=require('./game')
const LmsLearner=require('./learner')
const  Creator=require('./Creator')
const LoginHistory = sequelize.define('lmsloginhistory', {
    lgId : {
    type: DataTypes.INTEGER(50),
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  lgUserId: {
    type: DataTypes.INTEGER(50),
    allowNull: false
  },
  lgUserRole: {
    type: DataTypes.ENUM('Creator', 'Admin','Learner'),
    allowNull: true 
  },
  lgLoginTime: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  lgLogoutTime: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  lgTotalTime: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  lgStatus: {
    type: DataTypes.ENUM('login', 'logout'),
    allowNull: true,
  },
  lgIpAddress: {
    type: DataTypes.STRING(16),
    allowNull: true,
  },
  lgDeviceType: {
    type: DataTypes.STRING(16),
      allowNull: true,
  },
  lgUserAgent: {
    type: DataTypes.TEXT,
      allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
      allowNull: false,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'lmsloginhistory',
  freezeTableName: true, 
});
// sequelize
//   .sync({alter:true}) 
//   .then(() => {
//     console.log("LoginHistory table created successfully!");
//   })
//   .catch((error) => {
//     console.error("Unable to create table : ", error.messsage);
//   });
LoginHistory.belongsTo(LmsGame, { foreignKey: 'lgUserId' });
// LoginHistory.hasMany(LmsGame, {
//   foreignKey: 'lgUserId',
//   sourceKey: 'lgUserId'
// });

// LoginHistory.belongsTo(LmsLearner, { foreignKey: 'lgUserId' });


LoginHistory.belongsTo(Creator, { foreignKey: 'lgUserId' ,as:"Creator"});
module.exports = LoginHistory;
