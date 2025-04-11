const express = require('express')
const router = express.Router()
const { dataSource } = require('../db/data-source')
const { isValidString, isValidPassword } = require('../utils/validUtils')
const { generateJWT } = require('../utils/jwtUtils')
const appError = require('../utils/appError')
const handleErrorAsync = require('../utils/handleErrorAsync')
const bcrypt = require('bcrypt')
const isAuth = require('../middlewares/isAuth')
const saltRounds = 10

//使用者註冊
router.post('/signup', handleErrorAsync(async (req, res, next) => {
    const { name, email, password } = req.body;
    
    if(!isValidString(name) || !isValidString(email) || !isValidString(password) ){
        next(appError(400, "欄位未填寫正確"))  
        return
    }

    if(!isValidPassword(password)){
        next(appError(400, "密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字"))  
        return
    }

    const userRepo = dataSource.getRepository('User')
    const findUser = await userRepo.findOne({
        where: {
        email: email
        }
    })
    
    if(findUser){
        next(appError(409, "密碼不符合規則，Email已被使用")) 
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
}))

//使用者登入
router.post('/login', handleErrorAsync(async (req, res, next) => {
    const { email, password } = req.body
    if(!isValidString(email) || !isValidString(password)){
        next(appError(400, "欄位未填寫正確"))
        return
    }

    if(!isValidPassword(password)){
        next(appError(400, "密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字"))
        return
    }

    const userRepo = dataSource.getRepository('User')
    const findUser = await userRepo.findOne({
        select: ['id', 'name', 'password'],
        where: {
            email
        }
    })

    if(!findUser){
        next(appError(400, "使用者不存在或密碼輸入錯誤"))
        return
    }

    const isMatch = await bcrypt.compare(password, findUser.password)
    if(!isMatch){
        next(appError(400, "使用者不存在或密碼輸入錯誤"))
        return
    }

    //JWT
    const token = generateJWT({
        id: findUser.id,
        role: findUser.role
    })

    res.status(201).json({
        status: 'success',
        data: {
            token,
            user: {
                name: findUser.name
            }
        }
    })
}))

//取得個人詳細資料
router.get('/profile', isAuth, handleErrorAsync(async (req, res, next) => {
        const userRepo = dataSource.getRepository('User')
        const findUser = await userRepo.findOne({
            select: ['id', 'name', 'email', 'role'],
            where: {
                id: req.user
            }
        })

        res.status(200).json({
            id: findUser.id,
            name: findUser.name,
            email: findUser.email,
            role: findUser.role
        })   
}))

//更新資料
router.put('/profile', isAuth, handleErrorAsync(async (req, res, next) => {
    const { email } = req.body

    if(!isValidString(email)){
        nexy(appError(400, "欄位未填寫正確"))
    }

    const userRepo = dataSource.getTreeRepository('User')
    const updateUser = await userRepo.update(
        { id: req.user },
        { email: email }
    )

    if(updateUser.affected === 0){
        next(appError(400, "更新使用者失敗"))
        return
    }
    
    res.status(200).json({
        status : "success"
    })
    return  
}))

module.exports = router
