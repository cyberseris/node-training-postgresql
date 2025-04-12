const express = require('express')
const router = express.Router()
const handleErrorAsync = require('../utils/handleErrorAsync')
const isAuth = require('../middlewares/isAuth')
const courseController = require('../controllers/course')

//報名課程 
router.post('/:courseId', isAuth, handleErrorAsync(courseController.postBookingCourse))

//取得已預約的課程列表
router.get('/', isAuth, handleErrorAsync(courseController.getBookingCourse))

//取消課程
router.delete('/:courseId', isAuth, handleErrorAsync(courseController.deleteBookingCourse))

module.exports = router;