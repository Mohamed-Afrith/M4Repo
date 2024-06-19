'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('lmsgamereviews', {
      reviewId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      gameReviewerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      reviewGameId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      tabId: {
        type: Sequelize.TINYINT.UNSIGNED,
        allowNull: true,
        validate: {
          isInt: true,
          min: 1,
          max: 255,
        },
      },
      tabAttribute: {
        type: Sequelize.ENUM(['blockSeqId', 'screenId', 'fieldName']),
        allowNull: true,
      },
      tabAttributeValue: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      review: {
        type: Sequelize.STRING(250),
        allowNull: true,
      },
      reviewIpAddress: {
        type: Sequelize.STRING(16),
        allowNull: true,
      },
      reviewUserAgent: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      reviewDeviceType: {
        type: Sequelize.STRING(16),
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // Add foreign key constraints
    await queryInterface.addConstraint('lmsgamereviews', {
      fields: ['gameReviewerId'],
      type: 'foreign key',
      name: 'fk_gameReviewerId',
      references: {
        table: 'lmsgamereviewers',
        field: 'gameReviewerId',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addConstraint('lmsgamereviews', {
      fields: ['reviewGameId'],
      type: 'foreign key',
      name: 'fk_reviewGameId',
      references: {
        table: 'lmsgame',
        field: 'gameId',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('lmsgamereviews');
  }
};
