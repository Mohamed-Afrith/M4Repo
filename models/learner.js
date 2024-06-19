const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../lib/config/database");
const Creator =require("./Creator");

const LmsLearner = sequelize.define('lmslearner', {
    lenId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      lenCreatorId: {
        type: DataTypes.INTEGER(100),
        references: {
          model: Creator,
          key: 'ctId',
},
allowNull: false,
      },
      lenMail: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
       lenUUID: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false
      },
        
      lenPassword: {
        type: DataTypes.STRING(250),
        allowNull: true,
      },
      lenUserName: {
        type: DataTypes.STRING(250),
        allowNull: false,
      },
      lenCompanyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      lenCountryId: {
        type: DataTypes.STRING(11),
        allowNull: true,
      },
      lenDesignation: {
        type: DataTypes.STRING(250),
        allowNull: false,
      },
      lenDepartment: {
        type: DataTypes.STRING(250),
        allowNull: false,
      },
      lenAge: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      lenGender: {
        type: DataTypes.ENUM('Male', 'Female', 'Others'),
        allowNull: true,
      },
      lenCohorts: {
        //type: DataTypes.ARRAY(DataTypes.INTEGER),
        type: DataTypes.STRING(250),
        allowNull: true,
      },
      lenRegion: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      lenNickName: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      lenEducation: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      lenCreatedUserId: {
        type: DataTypes.INTEGER(100),
        allowNull: true,
      },
      lenAdminUserId: {
        type: DataTypes.INTEGER(100),
        allowNull: true,
      },
      lenAdminDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      lenCreatedDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      lenEditedUserId: {
        type: DataTypes.INTEGER(100),
        allowNull: true,
      },
      lenEditedAdminId: {
        type: DataTypes.INTEGER(100),
        allowNull: true,
      },
      lenEditAdminDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      lenEditedDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      lenStatus: {
        type: DataTypes.ENUM('Active', 'Inactive'),
        allowNull: false,
        defaultValue: 'Active',
      },
      lenDeleteStatus: {
        type: DataTypes.ENUM('NO', 'YES'),
        allowNull: false,
        defaultValue: 'NO',
      },
      lenIpAddress: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      lenDeviceType: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      lenUserAgent: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    }, {
  tableName: 'lmslearner',
  timestamps: false, 
  underscored: false, 
  freezeTableName: true,
});
LmsLearner.belongsTo(Creator, { foreignKey: 'lenCreatorId', as: 'creator' });
// Sync the model with the database
// (async () => {
//   try {
//     await sequelize.sync();
//     console.log('LmsLearner table created!');
//   } catch (error) {
//     console.error('Error creating LmsLearner table:', error);
//   }
// })();
// sequelize
//   .sync()
//   .then(() => {
//     console.log("Lmslearner table created successfully!");
//   })
//   .catch((error) => {
//     console.error("Unable to create table : ", error);
//   });
module.exports = LmsLearner;
 