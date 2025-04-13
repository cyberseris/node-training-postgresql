const { dataSource } = require('../db/data-source')
const appError = require('../utils/appError')
const { isValidString } = require('../utils/validUtils')

const courseController = {
    //報名課程 
    async postBookingCourse (req, res, next) {
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
            user_id: req.user.id,
            course_id: courseId,
            status: 'pending',
        })
        const result = await courseBooking.save(newCourseBooking)

        res.status(200).json({
            status: "success",
            data: result
        })
        return        
    },
    //取消課程
    async deleteBookingCourse (req, res, next) {
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
            user_id: req.user.id,
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
    }
}

module.exports = courseController;