const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../lib/config/database");


const lmsMultiLanguageSupport= sequelize.define('lmsMultiLanguageSupport', {

    language_Id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
     language_name: {
        type: DataTypes.STRING(32),
        allowNull: false,
      },
     language_code: {  
        type: DataTypes.STRING(10),
        allowNull: false,      
     },  
     created_datetime: {
         type: DataTypes.DATE,
         allowNull: false,
         defaultValue: DataTypes.NOW,
      },
      ip_address: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      user_agent: {
        type:  DataTypes.STRING(500),
        allowNull: false,
      },
      device_type: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
    }, {

  tableName: 'lmsMultiLanguageSupport',
  timestamps: false, 
  underscored: false, 
  freezeTableName: true,
});
module.exports = lmsMultiLanguageSupport;
 