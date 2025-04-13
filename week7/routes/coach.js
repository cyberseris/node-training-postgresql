const express = require('express')
const router = express.Router()
const handleErrorAsync = require('../utils/handleErrorAsync')
const coachController = require('../controllers/coach')

// 取得教練列表
router.get('/', handleErrorAsync(coachController.getCoachList))

// 取得教練詳細資料
router.get('/:coachId', handleErrorAsync(coachController.getCoachDetail))

// 取得指定教練課程列表
router.get('/:coachId/courses', handleErrorAsync(coachController.getSingleCoachCourse))

module.exports = router
