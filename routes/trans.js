const express = require('express')
const router = express.Router()
const TransController = require('../controllers/TransController')

router.get('/getAllTransactions', TransController.getAllTransactions)
router.post('/createTransaction', TransController.createTransaction)
router.get('/getTransById/id/:_id', TransController.getTransById)
router.put('/updateTransById/:_id', TransController.updateTransById)
router.delete('/deleteTransById/:_id', TransController.deleteTransById)

router.get('/getAllCategories', TransController.getAllCategories)

//pasar por body dni, categoria opcional
router.get('/getByUserDni', TransController.getTransactionsByUserDni)

// pasarpor body dni, categoria, mes y año opcional
router.get(
  '/getMonthlyByUserDni',
  TransController.getMonthlyTransactionsByUserDni,
)

module.exports = router
