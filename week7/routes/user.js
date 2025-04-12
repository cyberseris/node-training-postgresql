const express = require('express')
const router = express.Router()
const handleErrorAsync = require('../utils/handleErrorAsync')
const isAuth = require('../middlewares/isAuth')
const userController = require('../controllers/user')

//使用者註冊
router.post('/signup', handleErrorAsync(userController.postSignup))

//使用者登入
router.post('/login', handleErrorAsync(userController.postLogin))

//取得個人詳細資料
router.get('/profile', isAuth, handleErrorAsync(userController.putProfile))

//更新資料
router.put('/profile', isAuth, handleErrorAsync(userController.getProfile))

module.exports = router;
