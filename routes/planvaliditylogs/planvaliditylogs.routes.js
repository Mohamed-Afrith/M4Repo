const express = require('express');
const router = express.Router();
const { creatPlanValidity ,getPlanValidity,getEndDateById,getValidityPeriod,getEndDate,updatePlanValidity,getPlanTypeInCreator} = require('../../controllers/planValiditylogs/planValidityLogs.controller');

router.post('/creatPlanValidity',creatPlanValidity);

router.get('/getEndDate/:id',getEndDate);

router.put('/updatePlanValidity/:id',updatePlanValidity);

router.get('/getPlanValidity',getPlanValidity);

router.get('/getEndDateById/:id',getEndDateById);
router.get('/getPlanTypeInCreator/:id',getPlanTypeInCreator);

router.get('/getValidityPeriod',getValidityPeriod);


module.exports=router;

