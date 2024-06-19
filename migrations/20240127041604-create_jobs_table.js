'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('jobs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING, // Add a name field to identify the job type
        allowNull: false
      },
      data: {
        type: Sequelize.JSON,
        allowNull: false
      },
      status: {
        type: Sequelize.STRING, // Add a status field to track job status (e.g., 'queued', 'completed', 'failed')
        allowNull: false,
        defaultValue: 'queued'
      },
      attempts: {
        type: Sequelize.INTEGER, // Add an attempts field to track the number of retry attempts
        allowNull: false,
        defaultValue: 0
      },
      retryLimit: {
        type: Sequelize.INTEGER, // Add a retryLimit field to set the maximum number of retry attempts
        allowNull: false,
        defaultValue: 3
      },
      // Add more columns as needed
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('jobs');
  }
};
