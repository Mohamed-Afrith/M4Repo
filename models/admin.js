const { DataTypes } = require("sequelize");
const sequelize = require("../lib/config/database");

const LmsSuperAdmin = sequelize.define('lmssuperadmin', {
  sdId: {
    type: DataTypes.INTEGER(20),
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  sdnNme: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  sdMailId: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  sdPassword: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  sdStatus: {
    type: DataTypes.ENUM('Active', 'Inactive'),
    allowNull: false,
  },
  sdCreatedDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  sdDeleteStatus: {
    type: DataTypes.ENUM('0', '1'),
    allowNull: false,
    defaultValue: '0',
    comment: 'One is delete data',
  },
  sdTimeStamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
    timestamps: false,
    freezeTableName: true,
});


// sequelize.sync({alter: true}).then(() => {
//     console.log('superAdmin table created successfully!');
//  }).catch((error) => {
//     console.error('Unable to create table : ', error);
//  });

module.exports = LmsSuperAdmin;
