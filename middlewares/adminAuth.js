const jwt = require('jsonwebtoken')
const Admin = require('../models/Admin')

const adminAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).send({ message: 'No token provided' })
  }

  try {
    const decoded = jwt.verify(token, process.env.REACT_APP_JWT_SECRET)
    const admin = await Admin.findById(decoded._id)
    if (!admin) {
      return res.status(401).send({ message: 'No autorizado' })
    }
    req.admin = admin // Guarda el admin en la solicitud para uso posterior
    next()
  } catch (error) {
    return res.status(401).send({ message: 'Token inválido' })
  }
}

module.exports = adminAuth
