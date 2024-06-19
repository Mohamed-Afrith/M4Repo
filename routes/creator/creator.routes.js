const express = require('express');
const {createCreator,updateCreator,deleteCreator,getCreator,editDetails,getSelectCreator,EmailExistenceChecker, updatePassword, updateStatus,changePassword} = require('../../controllers/creator/creator.contollers');
const router = express.Router();

router.post('/addcreator',createCreator);
router.post('/getcreator',getCreator);
router.get('/getcreator/:id',editDetails);
router.put('/updatecreator/:id',updateCreator);
router.get('/deletecreator/:id',deleteCreator);
router.post('/selectcreator',getSelectCreator);
router.put('/updatepassword/:uuid',updatePassword);
router.post('/emailvalidator',EmailExistenceChecker);
router.put('/updatestatus/:id',updateStatus);
router.post('/changepassword/:id',changePassword);

module.exports = router;