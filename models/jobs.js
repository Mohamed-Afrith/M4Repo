const Sequelize = require('sequelize');

// Assuming you have a Sequelize instance named 'sequelize'
const JobModel = Sequelize.define('Job', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true, // Use a UUID or string for Bull's job IDs
    allowNull: false,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  data: {
    type: Sequelize.JSONB,
    allowNull: false,
  },
  status: {
    type: Sequelize.ENUM('waiting', 'active', 'completed', 'failed', 'delayed'),
    defaultValue: 'waiting',
  },
  attempts: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  error: {
    type: Sequelize.STRING,
  },
  processedOn: {
    type: Sequelize.DATE,
  },
  createdAt: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  updatedAt: {
    type: Sequelize.DATE,
    allowNull: false,
  },
});

module.exports = JobModel;
