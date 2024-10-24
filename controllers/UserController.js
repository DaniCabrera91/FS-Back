require('dotenv').config()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const User = require('../models/User')

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
        { expiresIn: '2h' },
      )

      user.tokens = user.tokens.concat(token)
      await user.save()

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
    const token = req.headers.authorization

    if (!token) {
      return res.status(401).json({ message: 'No se ha proporcionado token' })
    }

    try {
      const user = await User.findOne({ tokens: token })

      if (!user) {
        return res.status(401).json({ message: 'Token inválido' })
      }

      user.tokens = user.tokens.filter((t) => t !== token)
      await user.save()

      res.status(200).json({ message: 'Logout exitoso' })
    } catch (error) {
      console.error('Error al hacer logout:', error)
      res
        .status(500)
        .json({ message: 'Error al hacer logout', error: error.message })
    }
  },

  async getUserData(req, res) {
    try {
      const { dni } = req.body
      const user = await User.findOne({ dni })

      if (!user) {
        return res.status(401).json({ message: 'Usuario no encontrado' })
      }

      res.send({ assets: user.assets, iban: user.iban })
    } catch (error) {
      console.error(error)
      res.status(500).send({ message: 'Error al obtener los usuarios' })
    }
  },
}

module.exports = UserController
