const express = require('express')
const router = express.Router()
const { dataSource } = require('../db/data-source')
const appError = require('../utils/appError')
const handleErrorAsync = require('../utils/handleErrorAsync')
const { isValidString } = require('../utils/validUtils')
const isAuth = require('../middlewares/isAuth')

//報名課程 
router.post('/:courseId', isAuth, handleErrorAsync(async(req, res, next) => {
  const { courseId } = req.params
  
  //如果 ID 為空白或非字串
  if(!isValidString(courseId)){
    next(appError(400, "ID 錯誤"))
    return
  }

  //查看資料庫是否有此課程
  const courseRepo = dataSource.getRepository('Course')
  const findCourse = await courseRepo.findOne({
    where: {
        id: courseId
    }
  })

  //如果找不到此課程
  if(!findCourse){
    next(appError(400, "ID 錯誤"))    
    return
  }

  //寫入預約資料
  const courseBooking = dataSource.getRepository('CourseBooking')
  const newCourseBooking = courseBooking.create({
    user_id: req.user,
    course_id: courseId,
    status: 'pending',
  })
  const result = await courseBooking.save(newCourseBooking)

  res.status(200).json({
    status: "success",
    data: result
  })
  return
}))

//取得已預約的課程列表
router.get('/', isAuth, handleErrorAsync(async(req, res, next) => {
    const courseRepo = dataSource.getRepository('CourseBooking')
    const courseBookingResult = await courseRepo.find({
        select: ['id', 'course_id', 'booking_at', 'status', 'created_at'],
        where: {
            user_id: req.user
        },
        relations: ['Course']
    })

    res.status(200).json({
        data: courseBookingResult
    })
    return
}))

//取消課程
router.delete('/:courseId', isAuth, handleErrorAsync(async(req, res, next) => {
    const { courseId } = req.params
    
    if(!isValidString(courseId)){
        next(appError(400, "ID 錯誤"))
    }

    const courseBooking = dataSource.getRepository('CourseBooking')
    const findCourseBooking = await courseBooking.find({
        where: {
            course_id: courseId
        }
    })

    if(!findCourseBooking.length){
        next(appError(400, "ID 錯誤"))
        return
    }

    const courseUpdate = await courseBooking.update({
        user_id: req.user,
        course_id: courseId
    },{
        cancelled_at: new Date()
    })

    if(courseUpdate.affected===0){
        next(appError(400, "取消失敗"))
        return
    }

    res.status(200).json({
        status: "success",
        message: "取消成功"
    })
    return
}))

module.exports = router