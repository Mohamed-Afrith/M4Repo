const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../lib/config/database");

const LmsCategory = sequelize.define('lmscategory', {
  catId: {
    type: DataTypes.INTEGER(50),
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  catName: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  catDescription: {
    type: DataTypes.TEXT,
    allowNull: true 
  },
  catDefaultStatus: {
    type: DataTypes.ENUM('YES', 'NO'),
    allowNull: false,
    defaultValue: 'NO',
  },
  ctCreatedUserId: {
    type: DataTypes.INTEGER(100),
    allowNull: false
  },
  catEditedUserId: {
    type: DataTypes.INTEGER(100),
    allowNull: true
  },
  catCreatedDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  catEditedDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  catStatus: {
    type: DataTypes.ENUM('Active', 'Inactive'),
    allowNull: false
  },
  catDeleteStatus: {
    type: DataTypes.ENUM('NO', 'YES'),
    allowNull: false,
    defaultValue: 'NO'
  },
  catIpAddress: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  catDeviceType: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  catUserAgent: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
}, {
  tableName: 'lmscategory',
  freezeTableName: true, 
  timestamps: false // If you don't want timestamps like createdAt, updatedAt
});

// Additional associations or methods can be defined here if needed

module.exports = LmsCategory;
