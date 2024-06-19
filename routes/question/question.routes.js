const express = require('express');
const {createQuestions,updateQUestion,getQUestionById,getQUestion,deleteQUestion, createReflection,getReflection } = require('../../controllers/question/question.controller');
const router = express.Router();

router.post('/createQuestions',createQuestions);
router.put('/updateQUestion/:id',updateQUestion);
router.get('/getQUestionById/:id',getQUestionById);
router.get('/getQUestion',getQUestion);
router.get('/deleteQUestion/:id',deleteQUestion);
router.post('/createreflection',createReflection);
router.put('/getReflection/:id',getReflection);

// router.get('/getlearner',getlearner);
// router.get('/getlearnerById/:id',getlearnerById);
// router.put('/updatelearner/:id',updatelearner);
// router.put('/learnerstatus/:id',updateStatus);
// router.get('/deletelearner/:id',deletelearner);
module.exports = router;