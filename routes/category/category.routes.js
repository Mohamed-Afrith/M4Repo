const express = require('express');
const {createCategory, getCategory, updateCategory, reomveCategory, getOneCategory, getCategoryList,CategoryDataGet,updatecatStatus} = require('../../controllers/category/category.controller');
const router = express.Router();

router.post('/create',createCategory);
router.get('/getAllCategory',getCategory);
router.put('/updateCategory/:id',updateCategory);
router.get('/removeCategory/:id',reomveCategory);
router.get('/getCategory/:id',getOneCategory);
// updatecatStatus
router.put('/updatecatStatus/:id',updatecatStatus);
router.get('/getCategoryList',getCategoryList)
router.get('/CategoryDataGet',CategoryDataGet)
// CategoryDataGet
module.exports = router;