
const express = require('express');
const router = express.Router();
const { addIndustry,getIndustryById,getIndustry,deleteIndustry,updateIndustry,getIndustryName,updateStatus } = require('../../controllers/industry/industry.controller');

router.post('/addIndustry',addIndustry);

router.put('/updateIndustry/:id',updateIndustry);

router.get('/deleteIndustry/:id',deleteIndustry);

router.get('/getIndustry',getIndustry);
router.get('/getIndustryById/:id',getIndustryById); 
router.get('/getIndustryName',getIndustryName); 
router.put('/updateStatus/:id',updateStatus);

module.exports=router;

