const express = require('express')
const adminAuth = require('../middlewares/adminAuth')
const AdminController = require('../controllers/AdminController')

const router = express.Router()

router.post('/register', AdminController.registerAdmin)
router.post('/login', AdminController.loginAdmin)
router.post('/logout', adminAuth, AdminController.logoutAdmin)

router.post('/create-user', adminAuth, AdminController.createUser)
router.delete('/delete-user/:userId', adminAuth, AdminController.deleteUser)
router.put('/update-user/:userId', adminAuth, AdminController.updateUser)
router.get('/users', adminAuth, AdminController.getAllUsers)

router.get('/transactions', adminAuth, AdminController.getAllTransactions)
router.post('/create-transaction', adminAuth, AdminController.createTransaction)
router.delete(
  '/delete-transaction/:transactionId',
  adminAuth,
  AdminController.deleteTransaction,
)

module.exports = router
