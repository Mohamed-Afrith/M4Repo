// migration file (timestamp)_create_previews_table.js

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('previews_logs', {
      previewLogId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      userType: {
        allowNull: false,
        type: Sequelize.ENUM('creator', 'reviewer')
      },
      previewGameId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'lmsgame',
          key: 'gameId'
        }
      },
      nevigatedSeq: {
        allowNull: true,
        type: Sequelize.JSON
      },
      lastActiveBlockSeq: {
        allowNull: true,
        type: Sequelize.STRING(10)
      },
      selectedOptions: {
        type: Sequelize.JSON
      },
      previewScore: {
        type: Sequelize.JSON
      },
      previewProfile: {
        type: Sequelize.JSON
      },
      audioVolumeValue: {
        type: Sequelize.DECIMAL(2, 1),
        defaultValue: '0.5'
      },
      lastModifiedBlockSeq: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: true,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });
    await queryInterface.addConstraint('previews_logs', {
      fields: ['previewGameId'],
      type: 'foreign key',
      name: 'fk_previewGameId',
      references: {
        table: 'lmsgame',
        field: 'gameId',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('previews_logs');
  }
};
