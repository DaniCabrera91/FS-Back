require('dotenv').config()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const User = require('../models/User')
const Token = require('../models/Token') // Asegúrate de tener este modelo para manejar los tokens.

const UserController = {
  async getAllUsers(req, res) {
    try {
      const users = await User.find()
      res.send(users)
    } catch (error) {
      console.error(error)
      res.status(500).send({ message: 'Error al obtener los usuarios' })
    }
  },

  async login(req, res) {
    const { dni, password } = req.body

    try {
      const user = await User.findOne({ dni })

      if (!user) {
        return res.status(404).json({ message: 'DNI o contraseña incorrectos' })
      }

      const isMatch = await bcrypt.compare(password, user.password)

      if (!isMatch) {
        return res.status(401).json({ message: 'DNI o contraseña incorrectos' })
      }

      const token = jwt.sign(
        { _id: user._id },
        process.env.REACT_APP_JWT_SECRET,
        {
          expiresIn: '1h',
        },
      )

      // Guardar el token en la base de datos
      await Token.create({ token }) // Asegúrate de tener el modelo Token.

      res.status(200).json({
        message: 'Inicio de sesión exitoso',
        user: {
          _id: user._id,
          name: user.name,
          surname: user.surname,
          dni: user.dni.slice(0, 6) + '***',
        },
        token,
      })
    } catch (error) {
      console.error('Error en el inicio de sesión:', error)
      res
        .status(500)
        .json({ message: 'Error al iniciar sesión', error: error.message })
    }
  },

  async logout(req, res) {
    const token = req.headers.authorization // Obtener el token de los headers

    if (!token) {
      return res.status(401).json({ message: 'No token provided' })
    }

    try {
      await Token.findOneAndDelete({ token })

      res.status(200).json({ message: 'Logout exitoso' })
    } catch (error) {
      console.error('Error en logout:', error)
      res
        .status(500)
        .json({ message: 'Error al hacer logout', error: error.message })
    }
  },
}

module.exports = UserController
