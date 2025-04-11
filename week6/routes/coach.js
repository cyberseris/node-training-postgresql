const express = require('express')
const router = express.Router()
const { dataSource } = require('../db/data-source')
const appError = require('../utils/appError')
const handleErrorAsync = require('../utils/handleErrorAsync')
const { isValidString } = require('../utils/validUtils')

// 取得教練列表
router.get('/', handleErrorAsync(async(req, res, next) => {
    const { per, page } = req.query

    if(!isValidString(per)||!isValidString(page)){
        next(appError(400, "欄位未填寫正確")) 
        return
    }

    const perNum = Number(per)
    const pageNum = Number(page)
    const data = await dataSource.getRepository('Coach').find({
        select:[    
            'id', 
            'user_id', 
            'experience_years', 
            'description', 
            'profile_image_url',
            'created_at',
            'updated_at'
        ],
        take: perNum,
        skip: (perNum-1)*pageNum,  //pageNum: 0, 1, 2,...
        relations: ['User'] 
    })

    if(!data){
        next(appError(400, "目前沒有教練")) 
        return
    }

    res.status(200).json({
        status: "success",
        data: data   
    })
    return
}))

// 取得教練詳細資料
router.get('/:coachId', handleErrorAsync(async (req, res, next) => {
    const { coachId } = req.params

    if(!isValidString(coachId)){
        next(appError(400, "欄位未填寫正確")) 
        return
    }

    const [data] = await dataSource.getRepository('Coach').find({
        where: {
            id: coachId
        },
        relations: ['User']
    })

    if(!data){
        next(appError(400, "找不到該教練"))
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
}))


module.exports = router
