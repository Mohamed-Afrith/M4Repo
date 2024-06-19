const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../lib/config/database");

const LmsTemplates=require("./templates")
 
  const LmsGameAssets = sequelize.define('lmsgameassets', {
     gasId: {
    type: DataTypes.INTEGER(100),
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  gasAssetType: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  gasAssetName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  gasAssetImage: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
 
  gasCreatedUserId: {
    type: DataTypes.INTEGER(100),
    defaultValue: null
  },
  gasEditedUserId: {
    type: DataTypes.INTEGER(100),
    defaultValue: null
  },
  gasCreatedDate: {
    type: DataTypes.DATE,
    defaultValue: null
  },
  gasEditedDate: {
    type: DataTypes.DATE,
    defaultValue: null
  },
  gasStatus: {
    type: DataTypes.ENUM('Active', 'Inactive'),
    allowNull: false,
    defaultValue: 'Active'
  },
  gasDeleteStatus: {
    type: DataTypes.ENUM('NO', 'YES'),
    allowNull: false,
    defaultValue: 'NO',
    comment: 'YES for delete data'
  },
  gasIpAddress: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  gasDeviceType: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  gasUserAgent: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  
}, {
    timestamps: false,
    freezeTableName: true, // Set freezeTableName option to true
  });
  LmsGameAssets.belongsTo(LmsTemplates, { foreignKey: "gasId", as: "temp" });
  
//   sequelize.sync().then(() => {
//     console.log('LmsGameAssets table created successfully!');
//  }).catch((error) => {
//     console.error('Unable to create table : ', error);
//  });
module.exports = LmsGameAssets;

