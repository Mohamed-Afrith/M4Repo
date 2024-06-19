const express = require('express');
const { generateScorm, createOrUpdateScormConfig, getScormConfig} = require('../../controllers/scorm/scorm.controller');
const router = express.Router();
router.post('/generateScorm',generateScorm);
router.post('/createScormConfig', createOrUpdateScormConfig);
router.put('/updateScormConfig/:id', createOrUpdateScormConfig);
router.put('/getScormConfig/:id',getScormConfig);

module.exports = router;