const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../lib/config/database");


 
  const LmsAnimationType = sequelize.define('lmsanimationtype', {
     atId: {
    type: DataTypes.INTEGER(100),
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  atType: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  atvalue: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
 
  atCreatedUserId: {
    type: DataTypes.INTEGER(100),
    defaultValue: null
  },
  atEditedUserId: {
    type: DataTypes.INTEGER(100),
    defaultValue: null
  },
  atCreatedDate: {
    type: DataTypes.DATE,
    defaultValue: null
  },
  atEditedDate: {
    type: DataTypes.DATE,
    defaultValue: null
  },
  atStatus: {
    type: DataTypes.ENUM('Active', 'Inactive'),
    allowNull: false,
    defaultValue: 'Active'
  },
  atDeleteStatus: {
    type: DataTypes.ENUM('NO', 'YES'),
    allowNull: false,
    defaultValue: 'NO',
    comment: 'YES for delete data'
  },
  atIpAddress: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  atDeviceType: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  atUserAgent: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  
}, {
    timestamps: false,
    freezeTableName: true, // Set freezeTableName option to true
  });
  

//   sequelize.sync().then(() => {
//     console.log('LmsAnimationType table created successfully!');
//  }).catch((error) => {
//     console.error('Unable to create table : ', error);
//  });
module.exports = LmsAnimationType;

