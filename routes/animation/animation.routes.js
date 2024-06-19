const express = require('express');
const { updateAnimation, reomveAnimation, getOneAnimation, getAnimationList,getNonplayer,getPlayer,getBackground,getBadges} = require('../../controllers/animation/animation.controller');
const router = express.Router();

// router.post('/create',createAnimation);
router.put('/updateAnimation/:id',updateAnimation);
router.get('/removeAnimation/:id',reomveAnimation);
router.get('/getAnimation/:id',getOneAnimation);
router.get('/getAnimationList',getAnimationList);
router.get('/getNonplayer',getNonplayer);
router.get('/getplayer',getPlayer);
router.get('/getBackground/:id',getBackground);
router.get('/getBadges',getBadges);
module.exports = router; 