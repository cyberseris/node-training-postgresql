const { dataSource } = require('../db/data-source')
const { isValidString, isNumber } = require('../utils/validUtils')
const appError = require('../utils/appError')

const adminController = {
    // 新增教練課程
    async postCourse (req, res, next) {
        const { user_id, skill_id, name, description, start_at, end_at, max_participants, meeting_url } = req.body

        if(!isValidString(user_id) || !isValidString(skill_id) || !isValidString(name)
            || !isValidString(description) || !isValidString(start_at) || !isValidString(end_at)
            || !isNumber(max_participants) || !isValidString(meeting_url) || !meeting_url.startsWith('https')) {

            next(appError(400, "欄位未填寫正確")) 
            return
        }

        const userRepo = dataSource.getRepository('User')
        const findUser = await userRepo.findOne({
            where: {
                id: user_id
            }
        })

        if(!findUser){
            next(appError(400, "使用者不存在")) 
            return
        }else if(findUser.role!=='COACH'){
            next(appError(400, "使用者尚未成為教練")) 
            return
        }

        const skillRepo = dataSource.getRepository('Skill')
        const findSkill = await skillRepo.findOne({
            where: {
            id: skill_id
            }
        })

        if(!findSkill){
            next(appError(400, "技能不存在")) 
            return
        }

        const courseRepo = dataSource.getRepository('Course')
        const newCourse = courseRepo.create({
            user_id, 
            skill_id, 
            name, 
            description, 
            start_at, 
            end_at, 
            max_participants, 
            meeting_url
        })

        const result = await courseRepo.save(newCourse)

        res.status(201).json({
            status: "success",
            data: {
                course:result
            }
        })
        return
    },
    // 修改教練課程
    async putCourse (req, res, next) {
        const { courseId } = req.params
        const { skill_id, name, description, start_at, end_at, max_participants, meeting_url } = req.body

        if(!isValidString(skill_id) || !isValidString(name)
            || !isValidString(description) || !isValidString(start_at) || !isValidString(end_at)
            || !isNumber(max_participants) || !isValidString(meeting_url) || !meeting_url.startsWith('https')) {

            next(appError(400, "欄位未填寫正確")) 
            return
        }

        const courseRepo = dataSource.getRepository('Course')
        const findCourse = await courseRepo.findOne({
            where:{
                id: courseId
            }
        })

        if(!findCourse){
            next(appError(400, "課程不存在"))   
            return          
        }

        const updateCourse = await courseRepo.update({
            id: courseId
        },
        {
            skill_id, 
            name, 
            description, 
            start_at, 
            end_at, 
            max_participants, 
            meeting_url           
        })

        if(updateCourse.affected === 0){
            next(appError(400, "更新課程失敗")) 
            return             
        }

        const courseResult = await courseRepo.findOne({
            where: {
                id: courseId
            }
        })

        res.status(201).json({
            status: "success",
            data: {
                course: courseResult
            }
        })
        return
    },
    //變更使用者身分為教練
    async postUserToCoach (req, res, next) {
        const { userId } = req.params
        const { experience_years, description, profile_image_url } = req.body
        
        if(!isValidString(userId) || !isValidString(description) || !isNumber(experience_years)){
            next(appError(400, "欄位未填寫正確")) 
            return
        }
        
        if(profile_image_url && isValidString(profile_image_url) && !profile_image_url.startsWith('https')){
            next(appError(400, "欄位未填寫正確")) 
            return
        }

        const userRepo = dataSource.getRepository('User')
        const findUser = await userRepo.findOne({
            where: {
                id: userId
            }
        })

        if(!findUser){
            next(appError(400, "使用者不存在")) 
            return
        }else if(findUser.role === 'COACH'){
            next(appError(400, "使用者已經是教練")) 
            return           
        }

        const updateUser = await userRepo.update({
            id: userId
        }, {
            role: 'COACH'
        })

        if(updateUser.affected === 0){
            next(appError(400, "更新使用者失敗"))    
            return  
        }

        const coachRepo = dataSource.getRepository('Coach')
        const newCoach = coachRepo.create({
            user_id:userId,
            experience_years,
            description,
            profile_image_url
        })

        const coachResult = await coachRepo.save(newCoach)
        const userResult = await userRepo.findOne({
            where: {
                id: userId
            }
        })

        res.status(201).json({
            status : "success",
            data: {
                user: {
                    name: userResult.name,
                    role: userResult.role
                },
                coach: coachResult
            }      
        })
        return
    },
    //取得教練自己的課程列表
    async getCourseList (req, res, next) {
        const coachId = req.user.id

        if(!isValidString(coachId)){
            next(appError(400, "欄位未填寫正確"))
            return
        }

        const courseRepo = dataSource.getRepository('Course')
        const findCourseList = await courseRepo.createQueryBuilder('course')
            .select([
                'course.id AS id',
                'course.name AS name',
                'course.start_at AS start_at',
                'course.end_at AS end_at',
                'course.max_participants AS max_participants',
                `CASE 
                    WHEN course.start_at > NOW() THEN '開放報名中'
                    WHEN course.end_at < NOW() THEN '報名已結束'
                    ELSE '未開放報名'
                END AS status
                `
            ])
            .leftJoin('course.CourseBooking', 'booking')
            .addSelect('COUNT(booking.id)', 'participants')
            .where('course.user_id=:coachId', { coachId })
            .groupBy('course.id')
            .getRawMany();

        if(!findCourseList){
            next(appError(400, "找不到教練"))
            return
        }

        res.status(200).json({
            status: "success",
            data: findCourseList
        })
    }
}

module.exports = adminController;