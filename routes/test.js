const express = require('express')
const router = express.Router()
const TestController = require('../controllers/TestController')

router.post('/createUser', TestController.createUser)
router.post('/createTransaction', TestController.createTransaction)
router.get('/getAllUsers', TestController.getAllUsers)
router.get('/getAllTransactions', TestController.getAllTransactions)

module.exports = router
