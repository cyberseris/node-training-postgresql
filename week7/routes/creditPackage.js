const express = require('express')
const router = express.Router()
const handleErrorAsync = require('../utils/handleErrorAsync')
const isAuth = require('../middlewares/isAuth')
const creditPackageController = require('../controllers/creditPackageController')

//取得購買方案列表
router.get('/',  handleErrorAsync(creditPackageController.getCreditPackageList))

//新增購買方案
router.post('/', handleErrorAsync(creditPackageController.postCreditPackage))

//刪除購買方案
router.delete('/:creditPackageId', handleErrorAsync(creditPackageController.deleteCreditPackage))

//取得使用者已購買的方案列表
router.get('/userCreditPackage', isAuth, handleErrorAsync(creditPackageController.getUserCreditPackage))

//使用者購買方案
router.post('/:creditPackageId', isAuth, handleErrorAsync(creditPackageController.postUserCreditPackage))

module.exports = router
