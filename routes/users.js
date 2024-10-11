const express = require('express')
const router = express.Router()
const UserController = require('../controllers/UserController')
const { authentication } = require('../middlewares/authentication')

router.get('/getAllUsers', UserController.getAllUsers)
router.post('/login', UserController.login)
router.post('/logout', authentication, UserController.logout)

module.exports = router
