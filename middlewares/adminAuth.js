const jwt = require('jsonwebtoken')
const Admin = require('../models/Admin')

const adminAuth = async (req, res, next) => {
  // Se espera que el token esté en el encabezado Authorization
  const token = req.headers.authorization // Aquí se asume que el token llega así

  if (!token) {
    return res.status(401).send({ message: 'No token provided' })
  }

  try {
    const decoded = jwt.verify(token, process.env.REACT_APP_JWT_SECRET) // Verifica el token
    const admin = await Admin.findById(decoded._id) // Busca al administrador por ID

    if (!admin) {
      return res.status(401).send({ message: 'No autorizado' }) // Si no existe, no está autorizado
    }

    req.admin = admin // Almacena el objeto admin en el request para uso posterior
    next() // Llama a la siguiente función de middleware o ruta
  } catch (error) {
    console.error(error) // Registra el error para depuración
    return res.status(401).send({ message: 'Token inválido' }) // Manejo de token inválido
  }
}

module.exports = adminAuth
