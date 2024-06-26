const mongoose = require('mongoose')
const mongoUrl = process.env.MONGO_URI || 'mongodb+srv://userone:userone@serverlessinstance0.8pwddqq.mongodb.net'
const dbName = process.env.DB_NAME || 'OXIUM_DB'

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${mongoUrl}/${dbName}`)

    console.log(
      `\n MongoDB connected !! DB HOST : ${connectionInstance.connection.host}/${dbName}`
    )
    // Event monitoring
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to db')
    })

    mongoose.connection.on('error', (err) => {
      console.log(err.message)
    })

    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose connection is disconnected')
    })

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close()
      console.log('Mongoose connection closed through app termination')
      process.exit(0)
    })
  } catch (error) {
    console.log('Error:' + error.message)
    process.exit(1)
  }
}

module.exports =  connectDB;
