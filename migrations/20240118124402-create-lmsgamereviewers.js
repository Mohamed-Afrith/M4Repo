'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable('lmsgamereviewers', {
      gameReviewerId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      // reviewerUuid: {
      //   type: Sequelize.UUID,
      //   allowNull: true,
      // },
      // Add other columns based on your model definition
      creatorId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      emailId: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      activeStatus:{
        type: Sequelize.ENUM(['YES','NO']),
        defaultValue:  "Yes", 
      },
      reviewerIpAddress: {
        type: Sequelize.STRING(16),
        allowNull: true,
      },
      reviewerUserAgent: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      reviewerDeviceType: {
        type: Sequelize.STRING(16),
        allowNull: true,
      },
      createdBy:{
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      updatedBy:{
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      deletedBy:{
        type: Sequelize.INTEGER,
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
        // defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    // Add foreign key constraint
    
    await queryInterface.addConstraint('lmsgamereviewers', { 
    fields: ['creatorId'],
    type: 'foreign key',
    name: 'fk_creatorId',
    references: {
      table: 'lmscreator', // Assuming the related table is named lmsgame
      field: 'ctId',
    },
    onDelete: 'CASCADE', // Adjust as needed
    onUpdate: 'CASCADE', // Adjust as needed
  });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('lmsgamereviewers');
  },
};
