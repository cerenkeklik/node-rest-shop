const { request } = require('express')
const express = require('express')
const req = require('express/lib/request')
const router = express.Router()
const mongoose = require('mongoose')

const Order = require('../models/order')
const Product = require('../models/product')

router.get('/', (req, res, next) => {
  Order.find()
    .select('product quantity _id')
    .populate('product', 'name')
    .exec()
    .then((docs) => {
      res.status(200).json({
        count: docs.length,
        orders: docs.map((doc) => {
          return {
            _id: doc._id,
            product: doc.product,
            quantity: doc.quantity,
          }
        }),
      })
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      })
    })
})

router.post('/', (req, res, next) => {
  Product.findById(req.body.productId)
    .then((product) => {
      if (!product) {
        return res.status(404).json({
          message: 'Product not found.',
        })
      }
      const order = new Order({
        _id: mongoose.Types.ObjectId(),
        quantity: req.body.quantity,
        product: req.body.productId,
      })
      return order.save()
      .then((result) => {
        res.status(201).json({
          message: 'Order created successfully.',
          createdOrder: {
            _id: result._id,
            product: result.product,
            quantity: result.quantity,
          },
          request: {
            type: 'GET',
            url: 'http://localhost:3000/orders/' + result._id,
          },
        })
      })
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      })
    })
})

router.get('/:orderId', (req, res, next) => {
  Order.findById(req.params.orderId)
    .select('_id product quantity')
    .populate('product')
    .exec()
    .then((order) => {
      if (!order) {
        return res.status(404).json({
          message: 'Order not found.',
        })
      }
      res.status(200).json({
        order: order,
        request: {
          type: 'GET',
          url: 'http://localhost:3000/orders',
        },
      })
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      })
    })
})

router.delete('/:orderId', (req, res, next) => {
  Order.deleteOne({ _id: req.params.orderId })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: 'Order deleted.',
        request: {
          type: 'POST',
          url: 'http://localhost:3000/orders',
          body: { productId: 'ID', quantity: 'Number' },
        },
      })
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      })
    })
})

module.exports = router
