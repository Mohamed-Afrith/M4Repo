const express = require('express');
const {createQuesOption,updateQuesOption,getQuesOption,getQuesOptionById,deleteQuesOption } = require('../../controllers/questionOption/questionOption.controller');
const router = express.Router();




router.post('/createQuesOption',createQuesOption);
router.get('/getQuesOptionById/:id',getQuesOptionById);
router.get('/getQuesOption',getQuesOption);
router.put('/updateQuesOption/:id',updateQuesOption);
router.get('/deleteQuesOption/:id',deleteQuesOption);
module.exports = router;