const express = require('express')
const router = express.Router()
const { dataSource } = require('../db/data-source')
const appError = require('../utils/appError')
const handleErrorAsync = require('../utils/handleErrorAsync')
const { isValidString, isNumber } = require('../utils/validUtils')
const isAuth = require('../middlewares/isAuth')

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

//取得單一使用者購買方案
router.get('/userCreditPackage', isAuth, async(req, res, next) => {
    try{
        console.log("==================取得單一使用者購買方案===================")
        console.log(req.user)
        console.log("==================取得單一使用者購買方案===================")
        const creditPurchase = dataSource.getRepository('CreditPurchase')
        const findUserCreditCreditPurchase = await creditPurchase.find({
            select: ['credit_package_id', 'purchase_credits', 'price_paid'],
            where: {
                user_id: req.user
            },
            relations: ['CreditPackage']
        })
        console.log("==================取得單一使用者購買方案===================")
        console.log(findUserCreditCreditPurchase)
        console.log("==================取得單一使用者購買方案===================")
/*         const findUserCreditPackage = creditPackage.find({
            select: ['credit_package_id', 'purchase_credits', 'price_paid'],
            where: {
                user_id: req.user
            }
        }) */

        if(!findUserCreditCreditPurchase){
            next(appError(400, "目前尚未購買任何方案"))
            return
        }

        res.status(200).json({
            status: "success",
            data: findUserCreditCreditPurchase
        })
        return
    }catch(error){
        next(error)
    }
})

//使用者購買方案
router.post('/:creditPackageId', isAuth, handleErrorAsync(async (req, res, next) => {
    const { creditPackageId } = req.params

    if(!isValidString(creditPackageId)){
        next(appError(400, "ID 錯誤"))
    }

    const creditPackage = dataSource.getRepository('CreditPackage')
    const findCreditPackage = await creditPackage.findOne({
        where: {
            id: creditPackageId
        }
    })

    if(!findCreditPackage){
        next(appError(400, "ID 錯誤"))
        return
    }

    const creditPurchase = dataSource.getRepository('CreditPurchase')
    const newCreditPurchase = creditPurchase.create({
        user_id: req.user,
        credit_package_id: creditPackageId,
        purchase_credits: findCreditPackage.credit_amount, 
        price_paid: Number(findCreditPackage.price)
    })

    const result = await creditPurchase.save(newCreditPurchase)

    if(result.affected===0){
        next(appError(400, "購買失敗"))
    }

    res.status(201).json({
        status: "success"
    })
}))

module.exports = router
