const { dataSource } = require('../db/data-source')
const { isValidString, isNumber } = require('../utils/validUtils')
const appError = require('../utils/appError')

const creditPackageController = {
    //取得購買方案列表
    async getCreditPackageList (req, res, next) {
        const data = await dataSource.getRepository('CreditPackage').find({
            select: ['id', 'name', 'credit_amount', 'price']
        })
        res.status(200).json({
            status: "success",
            data: data       
        })
        return 
    },
    //新增購買方案
    async postCreditPackage (req, res, next) {
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
    },
    //刪除購買方案
    async deleteCreditPackage (req, res, next) {
        const { creditPackageId } = req.params
        if(!isValidString(creditPackageId)){
            next(appError(400, "ID 錯誤")) 
            return
        }
        const result = await dataSource.getRepository('CreditPackage').delete(creditPackageId)

        if(result.affected===0){
            next(appError(400, "ID 錯誤")) 
            return
        }

        res.status(200).json({
            status: "success"     
        }) 
        return       
    },
    //使用者購買方案    
    async postUserCreditPackage (req, res, next) {
        const { creditPackageId } = req.params

        if(!isValidString(creditPackageId)){
            next(appError(400, "ID 錯誤"))
            return
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
            user_id: req.user.id,
            credit_package_id: creditPackageId,
            purchase_credits: findCreditPackage.credit_amount, 
            price_paid: Number(findCreditPackage.price)
        })

        const result = await creditPurchase.save(newCreditPurchase)

        if(result.affected===0){
            next(appError(400, "購買失敗"))
            return
        }

        res.status(201).json({
            status: "success"
        })
        return        
    }
}

module.exports = creditPackageController;