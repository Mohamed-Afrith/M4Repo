const express = require('express');
const router = express.Router();
const { createplan,updatePlan,getPlan,deletePlan,getPlanById,getPlanName } = require('../../controllers/plan/plan.controllers');

router.post('/createplan',createplan);

router.put('/updateplan/:id',updatePlan);

router.get('/deleteplan/:id',deletePlan);

router.get('/getplan',getPlan);
router.get('/getPlanById/:id',getPlanById);
router.get('/getPlanName',getPlanName);


module.exports=router;

