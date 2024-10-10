require('dotenv').config()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const Transaction = require('../models/Transaction')
const User = require('../models/User')

const UserController = {}

module.exports = UserController
