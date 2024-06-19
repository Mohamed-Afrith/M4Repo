const express = require('express');
const { adminLogin, adminRegister,logoutAuto } = require('../../controllers/admin/admin.controller');
const router = express.Router();

router.post('/login',adminLogin);
router.post('/signup',adminRegister);
router.post('/logoutAuto',logoutAuto);

module.exports = router;