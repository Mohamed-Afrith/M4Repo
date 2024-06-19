const express = require('express');
const {getGameWiseData,getSkillWiseScore,getLearnerData,getGamesList,gamesListData,updatecohortsgame,gameAnswer, learnerListData, updatecohortsLearner, gameCompleteList, getAssignedGames,getBlocklWiseScore,getAllLearners, getLearnerFilter,getCreatorname,cohortsLearnerDatas,cohortsGamesData,getGameAssignData,GameWiseCompletePrint,GameWiseStartedPrint}=require('../../controllers/activitycontroller/activity.controller')
const router = express.Router();


router.get('/getSkillWiseScore/:id',getSkillWiseScore)
router.post('/getGameWiseData',getGameWiseData);
router.post('/getGamesList',getGamesList);
router.get('/getLearnerData/:id',getLearnerData);


router.get('/answer/:id',gameAnswer);
router.post('/gamesListData',gamesListData)
router.post('/updatecohortsgame',updatecohortsgame);
router.post('/updatecohortsLearner',updatecohortsLearner);
router.post('/learnerListData',learnerListData);
router.get('/getGameCompleteList/:id',gameCompleteList);
router.post('/getAllLearners',getAllLearners);
router.get('/getLearnerFilter',getLearnerFilter);
router.get('/getAssignedGames/:id',getAssignedGames);
router.get('/getBlocklWiseScore/:id',getBlocklWiseScore);

router.post('/getCreatorName',getCreatorname)

router.get('/cohortsLearnerDatas/:id',cohortsLearnerDatas);
router.get('/getcohortsDetails/:id',cohortsGamesData);
router.get('/getGameAssignData/:id',getGameAssignData);
router.get('/GameWiseCompletePrint/:id',GameWiseCompletePrint);
router.get('/GameWiseStartedPrint/:id', GameWiseStartedPrint);
module.exports = router;