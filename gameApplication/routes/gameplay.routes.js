const express = require('express');
const {getAssignedGames,getGamePlay,learnerUpdation,getleaderBoard,learnerDasboard,getGameLanguages,getGameFeedback,insertGameFedback, getBadgeShadows} = require('../controllers/gamePlay.controller');
const router = express.Router();

router.get('/getAssignedGames/:id',getAssignedGames);
//Lokie Work here
router.get('/getgameplay/:id/:selectLanguageId',getGamePlay);
router.get('/getleaderboard/:id',getleaderBoard);
router.get('/learnerdashboard',learnerDasboard);

router.post('/updateprofile',learnerUpdation);
router.get('/getGameLanguages/:id',getGameLanguages);

// Added By Lokie 29/05/2024
router.get('/getGameFeedback/:id',getGameFeedback);

router.post('/insertGameFedback/:id',insertGameFedback);
// 

router.get('/getBadgeShadows/:id', getBadgeShadows)



module.exports = router;