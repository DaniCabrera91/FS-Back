const jwt = require('jsonwebtoken')
const Admin = require('../models/Admin')

const adminAuth = async (req, res, next) => {
  const token = req.headers.authorization // Obtener el token directamente del header

  // Verificar si se proporciona el token
  if (!token) {
    return res.status(401).json({ message: 'No token provided' })
  }

  try {
    // Verificar el token
    const decoded = jwt.verify(token, process.env.REACT_APP_JWT_SECRET)

    // Buscar el administrador utilizando el ID del token decodificado
    const admin = await Admin.findById(decoded._id)

    // Verificar si el administrador existe y si el token está en la lista de tokens
    if (!admin || !admin.tokenAdmin.includes(token)) {
      return res.status(401).json({ message: 'No autorizado' })
    }

    // Almacenar el admin en la solicitud para usarlo en rutas posteriores
    req.admin = admin
    next() // Continuar con la siguiente función middleware o controlador
  } catch (error) {
    console.error('Error en autenticación:', error)
    return res.status(401).json({ message: 'Token inválido' })
  }
}

module.exports = adminAuth
