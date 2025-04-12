const express = require('express')
const router = express.Router()
const { dataSource } = require('../db/data-source')
const appError = require('../utils/appError')
const handleErrorAsync = require('../utils/handleErrorAsync')
const { isValidString } = require('../utils/validUtils')
const skillController = require('../controllers/skill')

//取得教練專長列表
router.get('/', handleErrorAsync(skillController.getSkills))

//新增教練專長
router.post('/', handleErrorAsync(skillController.postSkills))

//刪除教練專長
router.delete('/:skillId', handleErrorAsync(skillController.deleteSkills))

module.exports = router
