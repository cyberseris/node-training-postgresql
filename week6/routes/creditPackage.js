const express = require('express')
const router = express.Router()
const { dataSource } = require('../db/data-source')
const appError = require('../utils/appError')
const handleErrorAsync = require('../utils/handleErrorAsync')
const { isValidString, isNumber } = require('../utils/validUtils')

//取得購買方案列表
router.get('/',  handleErrorAsync(async (req, res, next) => {
    const data = await dataSource.getRepository('CreditPackage').find({
    select: ['id', 'name', 'credit_amount', 'price']
    })
    res.status(200).json({
    status: "success",
    data: data       
    })   
}))

//新增購買方案
router.post('/', handleErrorAsync(async (req, res, next) => {
    const {name, credit_amount, price} = req.body;
    
    if(!isValidString(name)|| !isNumber(credit_amount) || !isNumber(price)){
        next(appError(400, "欄位未填寫正確")) 
        return
    }

    const creditPackage = dataSource.getRepository('CreditPackage')
    const findCreditPackage = await creditPackage.find({
        where: {
        name: name
        }
    })
    
    if(findCreditPackage.length > 0){
        next(appError(409, "資料重複")) 
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
}))

//刪除購買方案
router.delete('/:creditPackageId', handleErrorAsync(async (req, res, next) => {
    const { creditPackageId } = req.params
    if(!isValidString(creditPackageId)){
        next(appError(400, "ID 錯誤")) 
    }
    const result = await dataSource.getRepository('CreditPackage').delete(creditPackageId)

    if(result.affected===0){
        next(appError(400, "ID 錯誤")) 
    }

    res.status(200).json({
        status: "success"     
    }) 
}))

module.exports = router
