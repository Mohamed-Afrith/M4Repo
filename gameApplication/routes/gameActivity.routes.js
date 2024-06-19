const express = require('express');
const {createActivity, ReacordActivity, getGameAvgScore,getGamePlayHistory ,createGamePlayHistory, getGameOverallQuestScore,getLastBlock,getGameActId} = require('../controllers/gameActivityLog.controller');
const router = express.Router();

router.post('/create',createActivity);
router.put('/update/:id',ReacordActivity);
//Afrith-modified-08/Apr/24,09,Apr/24-added-getGameAvgScore,gameOverallQuestScore
router.get('/getGameAvgScore/:id', getGameAvgScore);
router.get('/getGameOverallQuestScore/:id', getGameOverallQuestScore);

//Afrith-modified-08/Apr/24,09,Apr/24-added-getGameAvgScore,gameOverallQuestScore

//Priya-modified-15/Apr/24-added-getLastBlock
router.post('/getLastBlock', getLastBlock);
router.post('/createGamePlayHistory',createGamePlayHistory);
router.post('/getGamePlayHistory', getGamePlayHistory);

router.get('/getGameActId', getGameActId); //Afrith-modified-22/Apr/24








module.exports = router;