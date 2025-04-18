const express = require('express')
const cors = require('cors')
const path = require('path')
const pinoHttp = require('pino-http')

const logger = require('./utils/logger')('App')
const creditPackageRouter = require('./routes/creditPackage')
const skillRouter = require('./routes/skill')
const userRouter = require('./routes/user')
const adminRouter = require('./routes/admin')
const coachRouter = require('./routes/coach')
const courseRouter = require('./routes/course')

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(pinoHttp({
  logger,
  serializers: {
    req (req) {
      req.body = req.raw.body
      return req
    }
  }
}))
app.use(express.static(path.join(__dirname, 'public')))

app.use('/api/credit-package', creditPackageRouter)
app.use('/api/coaches/skill', skillRouter)
app.use('/api/coaches', coachRouter)
app.use('/api/courses', courseRouter)
app.use('/api/users', userRouter)
app.use('/api/admin', adminRouter)

//404
app.use((req, res, next) => {
  res.status(404).json({
    status: "error",
    message: "無此路由"
  })
  return
})

// 放在所有路由之後，統一處理錯誤
app.use((err, req, res, next) => {
  req.log.error(err)
  const statusCode = err.status || 500
  res.status(statusCode).json({
    status: statusCode === 500 ? 'error' : 'failed',
    messgae: err.message || '伺服器錯誤'
  })
})

module.exports = app
