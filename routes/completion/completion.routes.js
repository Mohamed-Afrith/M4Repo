const express = require('express');
const { addCompleteScreen } = require('../../controllers/completion/completion.controller');
const router = express.Router();

router.post('/bulkCreate',addCompleteScreen);

module.exports = router;