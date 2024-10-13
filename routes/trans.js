const express = require('express')
const router = express.Router()
const TransController = require('../controllers/TransController')

router.get('/getAllTransactions', TransController.getAllTransactions)
router.post('/createTransaction', TransController.createTransaction)
// UPDATE TRANSACTION BY ID
// DELETE TRANSACTION BY ID
// FILTER TRANSACTIONS BY TYPE
// GET (monthly summary of transactions)
// GET (monthly summary of transactions) BY CATEGORY

module.exports = router
