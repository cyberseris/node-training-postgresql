const express = require('express')
const { isValidString, isNumber } = require('../utils/validUtils')
const router = express.Router()
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('Coach')

// 取得教練詳細資料
router.get('/:coachId', async (req, res, next) => {
    try{
        const { coachId } = req.params

        if(!isValidString(coachId)){
            res.status(400).json({
                status: "failed",
                data: "欄位未填寫正確"      
            })
            return
        }

        const [data] = await dataSource.getRepository('Coach').find({
            where: {
                id: coachId
            },
            relations: ['User']
        })

        if(!data){
            res.status(400).json({
                status: "failed",
                data: "找不到該教練"      
            })
            return
        }

        res.status(200).json({
            status: "success",
            data: {
                user: {
                    name: data.User.name,
                    role: data.User.role
                },
                coach: {
                    id: data.id,
                    user_id: data.user_id,
                    experience_years: data.experience_years,
                    description: data.description,
                    profile_image_url: data.profile_image_url,
                    created_at: data.created_at,
                    updated_at: data.updated_at
                }
            }    
        })
      return
    }catch(error){
        logger.error(error)
        next(error)
    }    
})


module.exports = router
