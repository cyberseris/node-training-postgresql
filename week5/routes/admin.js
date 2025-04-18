const express = require('express')
const { isValidString, isNumber } = require('../utils/validUtils')
const router = express.Router()
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('Admin')

// 新增教練課程
router.post('/coaches/courses', async (req, res, next) => {
    try{
        const { user_id, skill_id, name, description, start_at, end_at, max_participants, meeting_url } = req.body

        if(!isValidString(user_id) || !isValidString(skill_id) || !isValidString(name)
            || !isValidString(description) || !isValidString(start_at) || !isValidString(end_at)
            || !isNumber(max_participants) || !isValidString(meeting_url) || !meeting_url.startsWith('https')) {

            res.status(400).json({
                status : "failed",
                message: "欄位未填寫正確"
            })
            return
        }

        const userRepo = dataSource.getRepository('User')
        const findUser = await userRepo.findOne({
          where: {
            id: user_id
          }
        })

        if(!findUser){
            res.status(400).json({
                status : "failed",
                message: "使用者不存在"
            })
            return
        }else if(findUser.role!=='COACH'){
            res.status(400).json({
                status : "failed",
                message: "使用者尚未成為教練"
            })
            return
        }

        const skillRepo = dataSource.getRepository('Skill')
        const findSkill = await skillRepo.findOne({
          where: {
            id: skill_id
          }
        })

        if(!findSkill){
            res.status(400).json({
                status : "failed",
                message: "技能不存在"
            })
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

    }catch(error){
        logger.error(error)
        next(error)        
    }
})

// 修改教練課程
router.put('/coaches/courses/:courseId', async (req, res, next) => {
    try{
        const { courseId } = req.params
        const { skill_id, name, description, start_at, end_at, max_participants, meeting_url } = req.body

        if(!isValidString(skill_id) || !isValidString(name)
            || !isValidString(description) || !isValidString(start_at) || !isValidString(end_at)
            || !isNumber(max_participants) || !isValidString(meeting_url) || !meeting_url.startsWith('https')) {

            res.status(400).json({
                status : "failed",
                message: "欄位未填寫正確"
            })
            return
        }

        const courseRepo = dataSource.getRepository('Course')
        const findCourse = await courseRepo.findOne({
            where:{
                id: courseId
            }
        })

        if(!findCourse){
            res.status(400).json({
                status : "failed",
                message: "課程不存在"
            })  
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
            res.status(400).json({
                status : "failed",
                message: "更新課程失敗"
            })
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
    }catch(error){
        logger.error(error)
        next(error)        
    }
})

//變更使用者身分為教練
router.post('/coaches/:userId', async (req, res, next) => {
    try{
        const { userId } = req.params
        const { experience_years, description, profile_image_url } = req.body
        console.log("userId: ", userId)
       
        if(!isValidString(userId) || !isValidString(description) || !isNumber(experience_years)){
            res.status(400).json({
                status: "failed",
                data: "欄位未填寫正確"       
            })
        }
        
        if(profile_image_url && isValidString(profile_image_url) && !profile_image_url.startsWith('https')){
            res.status(400).json({
                status: "failed",
                data: "欄位未填寫正確"       
            })
        }

        const userRepo = dataSource.getRepository('User')
        const findUser = await userRepo.findOne({
          where: {
            id: userId
          }
        })

        if(!findUser){
            res.status(400).json({
                status: "failed",
                message: "使用者不存在"       
            })
        }else if(findUser.role === 'COACH'){
             res.status(400).json({
                status: "failed",
                message: "使用者已經是教練"       
            })           
        }

        const updateUser = await userRepo.update({
            id: userId
        }, {
            role: 'COACH'
        })

        if(updateUser.affected === 0){
            res.status(400).json({
                status: "failed",
                message: "更新使用者失敗"       
            })     
        }

        const coachRepo = dataSource.getRepository('Coach')
        const newCoach = coachRepo.create({
            user_id: userId,
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
    }catch(error){
        logger.error(error)
        next(error) 
    } 
})

module.exports = router
