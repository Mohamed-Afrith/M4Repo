
const { DataTypes } = require('sequelize');
const sequelize = require("../lib/config/database");
const LmsGame = require('./game');

const PreviewLogs = sequelize.define('PreviewLogs', {
  previewLogId: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.INTEGER
        },
        playerId: {
          allowNull: false,
          type: DataTypes.INTEGER,
        },
        playerType: {
          allowNull: false,
          type: DataTypes.ENUM('creator', 'reviewer')
        },
        previewGameId: {
          allowNull: false,
          type: DataTypes.INTEGER
        },
        nevigatedSeq: {
          type: DataTypes.JSON
        },
        screenIdSeq: {
           type: DataTypes.JSON,
           allowNull: true
         },
        lastActiveBlockSeq: {
           type: DataTypes.JSON,
           allowNull: true
         },
         selectedOptions: {
           type: DataTypes.JSON,
           allowNull: true
         },
         previewScore: {
           type: DataTypes.JSON,
           allowNull: true
         },
         previewProfile: {
           type: DataTypes.JSON,
           allowNull: true
         },
         audioVolumeValue: {
           type: DataTypes.JSON,
           defaultValue: {bgVolume : 0.5, voVolume: 0.5}
          },
          lastModifiedBlockSeq: {
            type: DataTypes.STRING(10),
            allowNull:true
          },
          lastBlockModifiedDate: {
            type: DataTypes.DATE,
            allowNull: true
          },
          playerInputs:
          {
           type: DataTypes.JSON,
           allowNull: true
          },
          ipAddress: {
          type: DataTypes.STRING(16),
          allowNull: true,
        },
        userAgent: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        deviceType: {
          type: DataTypes.STRING(16),
          allowNull: true,
        },
        
         createdAt: {
           allowNull: false,
           type: DataTypes.DATE
         },
         updatedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: null,
          onUpdate: sequelize.literal('CURRENT_TIMESTAMP'),
        },
        questState: {
          type: DataTypes.JSON,
          allowNull: true
        },
      
}, {
  tableName: 'previews_logs',
  timestamps: true
});

  PreviewLogs.associate = (models) => {
    PreviewLogs.belongsTo(LmsGame, { foreignKey: 'previewGameId', as: 'game',onUpdate: 'CASCADE', onDelete: 'CASCADE'});    
  };
module.exports = PreviewLogs;
