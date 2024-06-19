const express = require('express');
const { createSkills, getSkills ,createCategory} = require('../../controllers/skill/skills.controller');
const router = express.Router();
router.post('/create/:id',createSkills);
router.get('/getSkills',getSkills);
router.post('/addcategory/:id',createCategory)

module.exports = router;