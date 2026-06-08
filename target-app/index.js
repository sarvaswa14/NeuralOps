const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const routes = require('./routes')

dotenv.config()

const app = express()
app.use(express.json())

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('connected to mongodb'))
  .catch((err) => console.log('mongodb connection error', err))

app.use('/', routes)

app.listen(process.env.PORT, () => {
  console.log(`target app running on port ${process.env.PORT}`)
})