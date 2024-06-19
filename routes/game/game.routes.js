const express = require('express');
const {getGame,addGame,updateGame,uploadBadge,getGameById, getBlocks,countByStage, gameDuplicate, gameLaunch, gameAssign, gamePublic,uploadIntroMusic, gameDelete,gameLearnersList,getDefaultCat,getDefaultSkill, getCreatorBlocks, getAudio, getBadge, gameQuestionDuplicateEntire,StroyInserting,GetStroy,ListStroy,getGameTemplate,viewHistroyMaintance,exitTemplateOpen, GetPreview,sentFeedbackMail,QuestDeletion,getCompletionScreen,getTotalMinofWords,ComplitionUpdate,getStoryValidtion, getGameCollections,getGamePreviewCollection, getMaxBlockQuestNo} = require('../../controllers/game/game.controller');
const { uploadSettings, fileFilters, storageLocations } = require('../../config/storageConfig');
const router = express.Router();
const path = require("path");

router.put('/getAllgame/:type',getGame);
router.put('/gettemplategame/',getGameTemplate);
router.post('/addgame',addGame);
router.put('/updateGame/:id',updateGame);
router.get('/getGameById/:id',getGameById);
router.get('/getBlocks/:id',getBlocks);
router.get('/countByStage',countByStage);
router.get('/preview/:id',GetPreview);
router.get('/gameduplicate/:id',gameDuplicate);
router.get('/gamelaunch/:id',gameLaunch);
router.put('/gameassign/:id',gameAssign);
router.get('/gamepublic/:id',gamePublic);
router.get('/gameDelete/:id',gameDelete);
router.get('/gameassignlist/:id',gameLearnersList)
router.get('/defaultcat/:id',getDefaultCat);
router.get('/defaultskill/:id',getDefaultSkill);
router.get('/creator/blocks/:id',getCreatorBlocks);
router.post('/duplicate/question/:id',gameQuestionDuplicateEntire);
router.get('/getbadge/:id',getBadge);
router.get('/getaudio/:id',getAudio);
router.put('/stroy/:id',StroyInserting);
router.get('/liststroy/:id',ListStroy);
router.get('/viewhistory/:id',viewHistroyMaintance);
router.get('/opentemplate/:id',exitTemplateOpen);
router.put('/getstroy/:id',GetStroy);
router.post("/feedback", sentFeedbackMail);
router.put('/deletequest/:id',QuestDeletion);
router.put('/completionscreen/:id',getCompletionScreen);
router.get('/getTotalMinofWords/:id',getTotalMinofWords);
router.put('/Compliupdate/:id',ComplitionUpdate);
router.get('/getStoryValidtion/:id',getStoryValidtion);
router.get('/uploadbadge',uploadSettings('badges',fileFilters.imageFilter,'gasAssetImage',storageLocations.badges),uploadBadge);
router.post('/uploadaudio',uploadSettings('audios',fileFilters.audioFilter,'gasAssetImage',storageLocations.audios),uploadIntroMusic);
router.get('/tryout/:uuid', getGameCollections);
router.get('/creator/demo/:id', getGamePreviewCollection);
router.get('/getMaxBlockQuestNo/:id',getMaxBlockQuestNo);

router.get('/audioTest', (req, res)=>{
    const url = `${req.protocol}://${req.get("host")}/uploads/audios/intromusicone.mp3`;
    res.setHeader('Content-Type', 'audio/mpeg');
    res.status(200).json({status: "success",url:url});
});
module.exports = router;
