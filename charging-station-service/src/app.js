require('aws-sdk/lib/maintenance_mode_message').suppress = true;

const express = require('express')
require('dotenv').config()
const cors = require('cors')
const chargingStationRoute = require('./routes/chargingStationRoutes.js')
const logger = require('morgan')
const errorHandler = require('./middlewares/errorMiddleware.js')
const app = new express()
const createError = require('http-errors')
const cookieParser = require('cookie-parser');
const authVerify = require('./middlewares/authVerify.js');
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
)


app.use(express.json({ limit: '20kb' }))
app.use(express.urlencoded({ extended: true, limit: '20kb' }))
// app.use(express.static("public") only if we have any docs

app.use(cookieParser())

//! DONOT DELETEs
app.get('/api/health-check',((req, res) =>{
  res.status(200).send('connected to charging-station-service api!!')
}))


//main API
app.use(logger('dev'))
app.use('/api/v1', authVerify, chargingStationRoute)
// 404
app.all('*', (req, res, next) => {
  const err = new createError(
    404,
    `Cant find the ${req.originalUrl} on the charging station service server !`
  )
  next(err)
})

// Use the error-handling middleware
app.use(errorHandler)

// Export the Express app for use in the handler.js fil
module.exports = app
