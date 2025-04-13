const express = require('express')
const router = express.Router()
const isAuth = require('../middlewares/isAuth')
const isCoach = require('../middlewares/isCoach')
const handleErrorAsync = require('../utils/handleErrorAsync')
const adminController = require('../controllers/admin')

//取得教練自己的課程列表
router.get('/coaches/courses', isAuth, isCoach, adminController.getCourseList)

// 新增教練課程
router.post('/coaches/courses', isAuth, isCoach, handleErrorAsync(adminController.postCourse))

// 修改教練課程 
router.put('/coaches/courses/:courseId', isAuth, isCoach, handleErrorAsync(adminController.putCourse))

//變更使用者身分為教練
router.post('/coaches/:userId', isAuth, handleErrorAsync(adminController.postUserToCoach))

module.exports = router
