const User = require('../models/User')
const Transaction = require('../models/Transaction')
const Admin = require('../models/Admin')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const AdminController = {
  async registerAdmin(req, res) {
    const { name, email, password } = req.body

    try {
      const existingAdmin = await Admin.findOne({ email })
      if (existingAdmin) {
        return res.status(400).json({ message: 'Email ya registrado' })
      }

      const saltRounds = 10
      const hashedPassword = await bcrypt.hash(password, saltRounds)

      const admin = new Admin({
        name,
        email,
        password: hashedPassword,
      })

      await admin.save()
      res
        .status(201)
        .json({ message: 'Administrador registrado con éxito', admin })
    } catch (error) {
      console.error('Error al registrar administrador:', error)
      res.status(500).json({
        message: 'Error al registrar el administrador',
        error: error.message,
      })
    }
  },

  async loginAdmin(req, res) {
    const { email, password } = req.body

    try {
      const admin = await Admin.findOne({ email })

      if (!admin) {
        return res
          .status(404)
          .json({ message: 'Email o contraseña incorrectos' })
      }

      const isMatch = await bcrypt.compare(password, admin.password)

      if (!isMatch) {
        return res
          .status(401)
          .json({ message: 'Email o contraseña incorrectos' })
      }

      const token = jwt.sign(
        { _id: admin._id },
        process.env.REACT_APP_JWT_SECRET,
        {
          expiresIn: '1h',
        },
      )

      admin.token = token // Guardar el token en el admin
      await admin.save()

      res.status(200).json({
        message: 'Inicio de sesión exitoso',
        token,
        admin: {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
        },
      })
    } catch (error) {
      console.error('Error en el inicio de sesión:', error)
      res
        .status(500)
        .json({ message: 'Error al iniciar sesión', error: error.message })
    }
  },

  async logoutAdmin(req, res) {
    const token = req.headers.authorization?.split(' ')[1] // Obtener el token del encabezado Authorization

    if (!token) {
      return res.status(401).json({ message: 'No token provided' })
    }

    try {
      const admin = await Admin.findOne({ token })

      if (!admin) {
        return res.status(401).json({ message: 'Token inválido' })
      }

      admin.token = null // Limpiar el token
      await admin.save()

      res.status(200).json({ message: 'Logout exitoso' })
    } catch (error) {
      console.error('Error en logout:', error)
      res
        .status(500)
        .json({ message: 'Error al hacer logout', error: error.message })
    }
  },

  async createUser(req, res) {
    try {
      const user = new User(req.body)
      await user.save()
      res.status(201).json({ message: 'Usuario creado con éxito', user })
    } catch (error) {
      console.error('Error al crear usuario:', error)
      res
        .status(500)
        .json({ message: 'Error al crear el usuario', error: error.message })
    }
  },

  async getAllUsers(req, res) {
    try {
      const users = await User.find()
      res.status(200).json(users)
    } catch (error) {
      console.error('Error al obtener usuarios:', error)
      res.status(500).json({ message: 'Error al obtener usuarios' })
    }
  },

  async updateUser(req, res) {
    try {
      const { userId } = req.params
      const updatedUser = await User.findByIdAndUpdate(userId, req.body, {
        new: true,
      })
      if (!updatedUser) {
        return res.status(404).json({ message: 'Usuario no encontrado' })
      }
      res
        .status(200)
        .json({ message: 'Usuario actualizado con éxito', updatedUser })
    } catch (error) {
      console.error('Error al actualizar usuario:', error)
      res.status(500).json({ message: 'Error al actualizar usuario' })
    }
  },

  async deleteUser(req, res) {
    try {
      const { userId } = req.params
      const deletedUser = await User.findByIdAndDelete(userId)
      if (!deletedUser) {
        return res.status(404).json({ message: 'Usuario no encontrado' })
      }
      res
        .status(200)
        .json({ message: 'Usuario eliminado con éxito', deletedUser })
    } catch (error) {
      console.error('Error al eliminar usuario:', error)
      res.status(500).json({ message: 'Error al eliminar usuario' })
    }
  },

  async getAllTransactions(req, res) {
    try {
      const transactions = await Transaction.find().populate(
        'userId',
        'name surname',
      )
      res.status(200).json(transactions)
    } catch (error) {
      console.error('Error al obtener transacciones:', error)
      res.status(500).json({ message: 'Error al obtener transacciones' })
    }
  },

  async createTransaction(req, res) {
    try {
      const { dni, ...transactionData } = req.body

      const user = await User.findOne({ dni })
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' })
      }

      const transaction = new Transaction({
        ...transactionData,
        userId: user._id,
      })

      await transaction.save()
      res
        .status(201)
        .json({ message: 'Transacción creada con éxito', transaction })
    } catch (error) {
      console.error('Error al crear transacción:', error)
      res
        .status(500)
        .json({ message: 'Error al crear transacción', error: error.message })
    }
  },

  async deleteTransaction(req, res) {
    try {
      const { transactionId } = req.params
      const deletedTransaction =
        await Transaction.findByIdAndDelete(transactionId)
      if (!deletedTransaction) {
        return res.status(404).json({ message: 'Transacción no encontrada' })
      }
      res.status(200).json({
        message: 'Transacción eliminada con éxito',
        deletedTransaction,
      })
    } catch (error) {
      console.error('Error al eliminar transacción:', error)
      res.status(500).json({ message: 'Error al eliminar transacción' })
    }
  },
}

module.exports = AdminController
