const express = require('express');
const {getReflectionAnswer} = require('../controllers/gameReflectionanswer.controller');
const router = express.Router();

router.post('/storeanswer',getReflectionAnswer);



module.exports = router;