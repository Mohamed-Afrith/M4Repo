const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../lib/config/database");



  const LmsTemplates = sequelize.define('lmstemplate', {
     tempId: {
    type: DataTypes.INTEGER(100),
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  tempCharaterId: {
    type: DataTypes.INTEGER(100),
    allowNull: false
  },
  tempTitle: {
    type: DataTypes.STRING(250),
    allowNull: false
  },
  tempStoryLine: {
    type: DataTypes.TEXT,
    allowNull: false
  },
 
  tempVoiceGender: {
    type: DataTypes.ENUM('Male', 'Female', ''),
    allowNull: false
  },
  
  tempVoiceEmotions: {
    type: DataTypes.STRING(11),
    allowNull: false
  },
  
  tempAccents: {
    type: DataTypes.STRING(11),
    allowNull: false
  },
  tempCreatedUserId: {
    type: DataTypes.INTEGER(100),
    defaultValue: null
  },
  tempEditedUserId: {
    type: DataTypes.INTEGER(100),
    defaultValue: null
  },
  tempCreatedDate: {
    type: DataTypes.DATE,
    defaultValue: null
  },
  tempEditedDate: {
    type: DataTypes.DATE,
    defaultValue: null
  },
  tempStatus: {
    type: DataTypes.ENUM('Active', 'Inactive'),
    allowNull: false,
    defaultValue: 'Active'
  },
  tempDeleteStatus: {
    type: DataTypes.ENUM('NO', 'YES'),
    allowNull: false,
    defaultValue: 'NO',
    comment: 'YES for delete data'
  },
  tempIpAddress: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  tempDeviceType: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  tempUserAgent: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  
}, {
    timestamps: false,
    freezeTableName: true, // Set freezeTableName option to true
  });
  

//   sequelize.sync().then(() => {
//     console.log('LmsTemplates table created successfully!');
//  }).catch((error) => {
//     console.error('Unable to create table : ', error);
//  });
module.exports = LmsTemplates;

