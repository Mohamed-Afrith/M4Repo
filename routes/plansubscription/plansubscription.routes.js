const express = require('express');
const router = express.Router();
const {deletePlanValidity, createplansubscription,updateplansubscription,getSubscriptionPlanById,getSubscriptionPlan,getSubscriptionPlanById1,getPlanType,getSubscriptionPlan1 } = require('../../controllers/plansubscription/plansubscription.controller');

router.post('/createplansubscription',createplansubscription);

router.get('/getPlanType/:id',getPlanType);

router.get('/getSubscriptionPlanById/:id',getSubscriptionPlanById); 
router.get('/getSubscriptionPlanById1/:id',getSubscriptionPlanById1); 

router.get('/getSubscriptionPlan',getSubscriptionPlan);

router.put('/updateplansubscription/:id',updateplansubscription);
router.get('/getSubscriptionPlan1',getSubscriptionPlan1);
router.get('/deletePlanValidity/:id',deletePlanValidity);


module.exports=router;

 