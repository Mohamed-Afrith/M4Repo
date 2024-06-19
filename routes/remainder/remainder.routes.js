const express = require('express');
const { remainderMail,learnerAdd } = require('../../controllers/remainder/remainder.controller');
const router = express.Router();
router.get('/remainder',remainderMail);
router.get('/learnerAdded/:id',learnerAdd);
module.exports = router;