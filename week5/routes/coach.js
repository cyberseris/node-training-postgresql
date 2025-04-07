const express = require('express')
const { isValidString, isNumber } = require('../utils/validUtils')
const router = express.Router()
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('Coach')

router.get('/', async (req, res, next) => {
    try{
      const data = await dataSource.getRepository('Skill').find({
        select: ['id', 'name']
      })
      res.status(200).json({
        status: "success",
        data: data       
      })
      return
    }catch(error){
        logger.error(error)
        next(error)
    }    
})

router.post('/', async (req, res, next) => {
    try{
        const { name } = req.body;
       
        if(!isValidString(name)){
            res.status(400).json({
                status: "failed",
                data: "欄位未填寫正確"       
            })
            return
        }

        const skillRepo = dataSource.getRepository('Skill')
        const findSkill = await skillRepo.find({
          where: {
            name: name
          }
        })
        
        if(findSkill.length > 0){
            res.status(409).json({
                status: "failed",
                message: "資料重複"       
            })
            return
        }

        const newSkill = skillRepo.create({
          name
        })
        const result = await skillRepo.save(newSkill)

        res.status(200).json({
            status: "success",
            data: result       
        })
        return
    }catch(error){
        logger.error(error)
        next(error) 
    } 
})

router.delete('/:skillId', async (req, res, next) => {
    try{
        console.log("req.params: ", req.params)
        const { skillId } = req.params 
        console.log("hihihi")
        if(!isValidString(skillId)){
            res.status(400).json({
                status: "failed",
                data: "ID 錯誤"       
            }) 
        }

        const result = await dataSource.getRepository('Skill').delete(skillId)

        if(result.affected===0){
            res.status(400).json({
                status: "failed",
                data: "ID 錯誤"       
            }) 
        }

        res.status(200).json({
            status: "success"     
        }) 
    }catch(error){
        logger.error(error)
        next(error)
    } 
})

module.exports = router
