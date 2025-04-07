const express = require('express')
const { isValidString, isNumber } = require('../utils/validUtils')
const router = express.Router()
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('CreditPackage')

router.get('/', async (req, res, next) => {
    try{
      const data = await dataSource.getRepository('CreditPackage').find({
        select: ['id', 'name', 'credit_amount', 'price']
      })
      res.status(200).json({
        status: "success",
        data: data       
      })
    }catch(error){
        logger.error(error)
        next(error)
    }    
})

router.post('/', async (req, res, next) => {
    try{
        const {name, credit_amount, price} = req.body;
       
        if(!isValidString(name)|| !isNumber(credit_amount) || !isNumber(price)){
            res.status(400).json({
                status: "failed",
                data: "欄位未填寫正確"       
            })
            return
        }

        const creditPackage = dataSource.getRepository('CreditPackage')
        const findCreditPackage = await creditPackage.find({
          where: {
            name: name
          }
        })
        
        if(findCreditPackage.length > 0){
            res.status(409).json({
                status: "failed",
                message: "資料重複"       
            })
            return
        }

        const newCreditPackage = creditPackage.create({
          name,
          credit_amount,
          price
        })

        const result = await creditPackage.save(newCreditPackage)
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

router.delete('/:creditPackageId', async (req, res, next) => {
    try{
        const { creditPackageId } = req.params
        if(!isValidString(creditPackageId)){
            res.status(400).json({
                status: "failed",
                data: "ID 錯誤"       
            }) 
        }
        const result = await dataSource.getRepository('CreditPackage').delete(creditPackageId)

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
