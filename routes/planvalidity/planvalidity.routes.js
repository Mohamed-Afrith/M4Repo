const express = require('express');
const router = express.Router();
const { creatPlanValidity ,getPlanValidity,getEndDateById,getValidityPeriod,getEndDate} = require('../../controllers/planValidity/planValidity.controller');

router.post('/creatPlanValidity',creatPlanValidity);

router.get('/getEndDate/:id',getEndDate);

// router.get('/deleteplan/:id',deletePlan);

router.get('/getPlanValidity',getPlanValidity);

router.get('/getEndDateById/:id',getEndDateById);
router.get('/getValidityPeriod',getValidityPeriod);


module.exports=router;

