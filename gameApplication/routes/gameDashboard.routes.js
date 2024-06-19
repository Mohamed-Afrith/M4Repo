const express = require('express');
const router = express.Router();

const {learnerDasboard} = require('../controllers/gamePlay.controller');

router.get('/gameDashboard', learnerDasboard);

module.exports = router;