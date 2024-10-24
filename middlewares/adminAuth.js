const jwt = require('jsonwebtoken')
const Admin = require('../models/Admin')

const adminAuth = async (req, res, next) => {
  const token = req.headers.authorization

  if (!token) {
    return res.status(401).json({ message: 'No token provided' })
  }

  try {
    const decoded = jwt.verify(token, process.env.REACT_APP_JWT_SECRET)
    const admin = await Admin.findById(decoded._id)

    if (!admin || !admin.tokenAdmin.includes(token)) {
      return res.status(401).json({ message: 'No autorizado' })
    }

    req.admin = admin
    next()
  } catch (error) {
    console.error('Error en autenticación:', error)
    return res.status(401).json({ message: 'Token inválido' })
  }
}

module.exports = adminAuth
