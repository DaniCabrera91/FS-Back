const User = require('../models/User')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const authentication = async (req, res, next) => {
  try {
    const token = req.headers.authorization

    if (!token) {
      return res.status(401).send({ message: 'No token provided' })
    }

    const payload = jwt.verify(token, process.env.REACT_APP_JWT_SECRET)

    const user = await User.findById(payload._id)

    if (!user) {
      return res.status(401).send({ message: 'No estás autorizado' })
    }

    req.user = user
    next()
  } catch (error) {
    console.error(error)

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).send({ message: 'Token no válido' })
    }

    return res
      .status(500)
      .send({ message: 'Ha habido un problema con el token' })
  }
}

module.exports = { authentication }
