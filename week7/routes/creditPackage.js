const express = require('express')
const router = express.Router()
const handleErrorAsync = require('../utils/handleErrorAsync')
const isAuth = require('../middlewares/isAuth')
const creditPackageController = require('../controllers/creditPackage')

//取得購買方案列表
router.get('/',  handleErrorAsync(creditPackageController.getCreditPackageList))

//新增購買方案
router.post('/', handleErrorAsync(creditPackageController.postCreditPackage))

//刪除購買方案
router.delete('/:creditPackageId', handleErrorAsync(creditPackageController.deleteCreditPackage))

//使用者購買方案
router.post('/:creditPackageId', isAuth, handleErrorAsync(creditPackageController.postUserCreditPackage))

module.exports = router
