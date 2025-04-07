const express = require('express')
const { isValidString, isNumber, isValidPassword } = require('../utils/validUtils')
const router = express.Router()
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('User')
const bcrypt = require('bcrypt')
const saltRounds = 10

router.post('/signup', async (req, res, next) => {
    try{
        const { name, email, password } = req.body;
       
        if(!isValidString(name) || !isValidString(email) || !isValidString(password) ){
            res.status(400).json({
                status: "failed",
                data: "欄位未填寫正確"       
            })
            return
        }

        if(!isValidPassword(password)){
            res.status(400).json({
                status: "failed",
                data: "密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字"       
            })
            return
        }

        const userRepo = dataSource.getRepository('User')
        const findUser = await userRepo.findOne({
          where: {
            email: email
          }
        })
        
        if(findUser){
            res.status(409).json({
                status: "failed",
                message: "Email已被使用"       
            })
            return
        }

        const hashPassword = await bcrypt.hash(password, saltRounds)
        const newUser = userRepo.create({
          name, email, role:'USER', password:hashPassword
        })
        const result = await userRepo.save(newUser)

        res.status(201).json({
            status: "success",
            data: {
                user: {
                    id: result.id,
                    name: result.name 
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
