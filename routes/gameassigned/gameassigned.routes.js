const express = require('express');
const {createAssign, getAssign, updateAssign, reomveAssign, getOneAssign, getAssignList} = require('../../controllers/gameassigned/gameassigned.controller');
const router = express.Router();

router.post('/create',createAssign);
router.get('/getAllgameassign',getAssign);
router.put('/updategameassign/:id',updateAssign);
router.get('/removegameassign/:id',reomveAssign);
router.get('/getselectgameassign/:id',getOneAssign);
router.get('/getgameassignList',getAssignList);
module.exports = router;