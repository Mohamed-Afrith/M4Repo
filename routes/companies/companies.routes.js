const express = require('express');
const { createCompanies, getCompanies, updateCompany, reomveCompany, getOneCompany, getCompaniesList,updateStatus } = require('../../controllers/companies/companies.controller');
const router = express.Router();

router.post('/create',createCompanies);
router.get('/getAllCompany',getCompanies);
router.put('/updateCompany/:id',updateCompany);
router.get('/removeCompany/:id',reomveCompany);
router.get('/getCompany/:id',getOneCompany);
router.get('/getCompanyList',getCompaniesList)
router.put('/updateStatus/:id',updateStatus)
module.exports = router;
