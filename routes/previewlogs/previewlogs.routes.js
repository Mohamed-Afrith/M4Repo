const express = require('express');
const router = express.Router();
const {updatePreviewLogs, updateBlockModifiedLog ,getPrivewlogData} = require('../../controllers/previewLogs/previewlogs.controller');

router.put('/logs', updatePreviewLogs);
router.put('/blocklog', updateBlockModifiedLog); //game preview logs of an creator/reviewer
router.put('/priviewlogs',getPrivewlogData);
module.exports=router; 
