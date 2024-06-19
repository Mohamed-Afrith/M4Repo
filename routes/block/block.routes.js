const express = require('express');
const {createBlocks,updateBlock,getBlockById,getBlock,deleteBlock, } = require('../../controllers/block/block.controller');
const router = express.Router();

router.post('/createBlocks',createBlocks);
router.put('/updateBlock/:id',updateBlock);
router.get('/getBlockById/:id',getBlockById);
router.get('/getBlock',getBlock);
router.get('/deleteBlock/:id',deleteBlock);

// router.get('/getlearner',getlearner);
// router.get('/getlearnerById/:id',getlearnerById);
// router.put('/updatelearner/:id',updatelearner);
// router.put('/learnerstatus/:id',updateStatus);
// router.get('/deletelearner/:id',deletelearner);
module.exports = router;