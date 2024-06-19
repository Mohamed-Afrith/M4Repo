const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../lib/config/database");

const LmsAnimation = sequelize.define('lmsanimation', {
  aniId: {
    type: DataTypes.INTEGER(100),
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  aniType: {
    type: DataTypes.ENUM('Background', 'Non-playing Character', 'playing Character', 'Badges'),
    allowNull: false
  },
  aniCharacterName: {
    type: DataTypes.STRING(250),
    allowNull: false
  },
  aniPosesName: {
    type: DataTypes.STRING(250),
    allowNull: false
  },
  aniImages: {
    type: DataTypes.STRING(250),
    allowNull: false
  },
  aniVoiceId: {
    type: DataTypes.INTEGER(50),
    allowNull: false
  },
  aniCreatedUserId: {
    type: DataTypes.INTEGER(100),
    allowNull: false
  },
  aniEditedUserId: {
    type: DataTypes.INTEGER(100),
    allowNull: false
  },
  aniCreatedDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  aniEditedDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  aniStatus: {
    type: DataTypes.ENUM('Active', 'Inactive'),
    allowNull: false
  },
  aniDeleteStatus: {
    type: DataTypes.ENUM('NO', 'YES'),
    allowNull: false,
    defaultValue: 'NO'
  },
  aniIpAdderss: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  aniDeviceType: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  aniUserAgent: {
    type: DataTypes.TEXT, // Change the type to TEXT
    allowNull: false
  },
}, {
  tableName: 'lmsanimation',
  freezeTableName: true, 
  timestamps: false // If you don't want timestamps like createdAt, updatedAt
});

// sequelize.sync().then(() => {
//   console.log('lmsanimation table created successfully!');
// }).catch((error) => {
//   console.error('Unable to create table : ', error);
// });
// Additional associations or methods can be defined here if needed

module.exports = LmsAnimation;
