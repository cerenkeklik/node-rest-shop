//16.41 dakika

const express = require('express') // node.js web app framework
const app = express()
const morgan = require('morgan') // a node.js and express.js middleware to log HTTP requests and errors, and simplifies the process
const bodyParser = require('body-parser')
//for parsing incoming request bodies in a middleware before you handle it
const mongoose = require('mongoose')

const productRoutes = require('./api/routes/products')
const orderRoutes = require('./api/routes/orders')

mongoose.connect(
  'mongodb+srv://ceren:' +
    process.env.MONGO_ATLAS_PW +
    '@node-rest-shop.xw2b9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
)

app.use(morgan('dev'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  )
  if (req.method === 'OPTIONS') {
    //browser will always send an options request first when you send a post request or put etc
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')
    return res.status(200).json({})
  }
  next()
})

app.use('/products', productRoutes)
app.use('/orders', orderRoutes)

app.use((req, res, next) => {
  const error = new Error('Not Found')
  error.status = 404
  next(error)
})

app.use((error, req, res, next) => {
  res.status(error.status || 500)
  res.json({
    error: {
      message: error.message,
    },
  })
})

module.exports = app
