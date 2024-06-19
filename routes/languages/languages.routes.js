const express = require('express');
const {getLanguages,updatelanguages,getCreatedLanguages,updateLanguageContent,getSelectedLanguages,getBlockData,getReflactionData,getGameStoryLine,getQuestionOptions,getQuestionOptionsText,
    getQuestionResponse, getGameLanguages,getContentRelatedLanguage,getLanguageCount,storyEngAudio,storyInteractionAudio,storyModGameContentLang,gameOverviewGameContentLang,getOldLanguages,GameVoicegenaration} = require('../../controllers/languages/languages.controller');
const router = express.Router();


// getOldLanguages
router.get('/getOldLanguages/:id',getOldLanguages);
router.get('/getlanguages',getLanguages);
router.get('/getBlockData/:id/:translationId',getBlockData);
router.get('/getReflactionData/:id/:translationId',getReflactionData);
router.get('/getGameStoryLine/:id/:translationId',getGameStoryLine);
router.get('/getQuestionOptions/:id/:translationId',getQuestionOptions);
router.get('/getQuestionOptionsText/:id/:translationId',getQuestionOptionsText);
router.get('/getQuestionResponse/:id/:translationId',getQuestionResponse);


router.get('/getSelectedLanguages/:id',getSelectedLanguages);
router.post('/getcreatedlanguages',getCreatedLanguages);
router.post('/updatelanguages',updatelanguages);
// vignesh 10-01-24
router.post('/updatecontent',updateLanguageContent);
router.get('/getGameLanguages/:id',getGameLanguages); //used for Demo game play
//Afrith-modified-starts-20/Mar/24
// router.get('/getContentRelatedLanguage/:id', getContentRelatedLanguage); //used to get selected langId from Demo game play(Character Selection)
router.get('/getContentRelatedLanguage/:currGameId/:langId', getContentRelatedLanguage); //used to get selected langId from Demo game play(Character Selection)
router.get('/getlanguagecount/:id',getLanguageCount)//nivetha
router.put('/storyEngAudio/:id',storyEngAudio); //Afrith-modified-10/May/24
router.put('/storyInteractionAudio/:id',storyInteractionAudio); //Afrith-modified-11/May/24
router.put('/storyModGameContentLang/:id',storyModGameContentLang); //Afrith-modified-11/May/24
router.put('/gameOverviewGameContentLang/:id',gameOverviewGameContentLang); //Afrith-modified-14/May/24
router.get('/GameVoicegenaration/:id',GameVoicegenaration); //Afrith-modified-14/May/24
module.exports = router;
