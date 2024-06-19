const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../lib/config/database");

const Country = sequelize.define(
  "country", {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    countryCode: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    countryName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    isEnable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    dialCode: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  
  }, {
    freezeTableName: true, // Set freezeTableName option to true
    timestamps: true,
  });
// sequelize.sync().then(() => {
//     console.log('Country table created successfully!');
//  }).catch((error) => {
//     console.error('Unable to create table : ', error);
//  });
module.exports = Country;