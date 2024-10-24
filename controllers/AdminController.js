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

      const admin = new Admin({
        name,
        email,
        password,
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
        console.error('La contraseña no coincide')
        return res
          .status(401)
          .json({ message: 'Email o contraseña incorrectos' })
      }

      const token = jwt.sign(
        { _id: admin._id },
        process.env.REACT_APP_JWT_SECRET,
        { expiresIn: '2h' },
      )

      if (!admin.tokenAdmin) {
        admin.tokenAdmin = []
      }

      admin.tokenAdmin.push(token)
      await admin.save()

      return res.status(200).json({
        message: 'Inicio de sesión exitoso',
        admin: {
          _id: admin._id,
          name: admin.name,
        },
        token,
      })
    } catch (error) {
      console.error('Error en el inicio de sesión:', error)
      return res
        .status(500)
        .json({ message: 'Error al iniciar sesión', error: error.message })
    }
  },

  async logoutAdmin(req, res) {
    const token = req.headers.authorization

    if (!token) {
      return res.status(401).json({ message: 'No token provided' })
    }

    try {
      const decoded = jwt.verify(token, process.env.REACT_APP_JWT_SECRET)
      const admin = await Admin.findById(decoded._id)

      if (!admin || !admin.tokenAdmin.includes(token)) {
        return res.status(401).json({ message: 'Token inválido' })
      }

      admin.tokenAdmin = admin.tokenAdmin.filter((t) => t !== token)
      await admin.save()

      return res.status(200).json({ message: 'Logout exitoso' })
    } catch (error) {
      console.error('Error en logout:', error)
      return res
        .status(500)
        .json({ message: 'Error al hacer logout', error: error.message })
    }
  },

  async createUser(req, res) {
    const { dni, password, iban, ...otherData } = req.body

    try {
      const existingUserByDNI = await User.findOne({ dni })
      if (existingUserByDNI) {
        return res.status(400).json({ message: 'DNI ya registrado' })
      }

      const existingUserByIBAN = await User.findOne({ iban })
      if (existingUserByIBAN) {
        return res.status(400).json({ message: 'IBAN ya registrado' })
      }

      const user = new User({ dni, password, iban, ...otherData })
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
      const page = parseInt(req.query.page) || 1
      const limit = parseInt(req.query.limit) || 10
      const skip = (page - 1) * limit

      const users = await User.find().skip(skip).limit(limit)
      const totalUsers = await User.countDocuments()

      // Calcular el número total de páginas
      const totalPages = Math.ceil(totalUsers / limit)

      res.status(200).json({
        totalUsers,
        totalPages,
        currentPage: page,
        users,
      })
    } catch (error) {
      console.error('Error al obtener usuarios:', error)
      res.status(500).json({ message: 'Error al obtener usuarios' })
    }
  },

  async getUserByDni(req, res) {
    const { dni } = req.params

    try {
      const user = await User.findOne({ dni })

      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' })
      }

      const transactions = await Transaction.find({ userId: user._id })

      res.status(200).json({
        user,
        transactions,
      })
    } catch (error) {
      console.error('Error al buscar usuario por DNI:', error)
      res.status(500).json({
        message: 'Error al buscar usuario por DNI',
        error: error.message,
      })
    }
  },

  async updateUser(req, res) {
    const { userId } = req.params
    const updateData = req.body

    try {
      if (!Object.keys(updateData).length) {
        return res.status(400).json({ message: 'No data provided for update' })
      }

      if (updateData.dni) {
        updateData.dni = updateData.dni.trim().toUpperCase()
      }

      const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
      })

      if (!updatedUser) {
        return res.status(404).json({ message: 'Usuario no encontrado' })
      }

      res
        .status(200)
        .json({ message: 'Usuario actualizado con éxito', updatedUser })
    } catch (error) {
      console.error('Error al actualizar usuario:', error)
      res
        .status(500)
        .json({ message: 'Error al actualizar usuario', error: error.message })
    }
  },

  async deleteUser(req, res) {
    try {
      const { userId } = req.params

      const deletedTransactions = await Transaction.deleteMany({ userId })

      const deletedUser = await User.findByIdAndDelete(userId)

      if (!deletedUser) {
        return res.status(404).json({ message: 'Usuario no encontrado' })
      }

      res.status(200).json({
        message: 'Usuario y transacciones eliminados con éxito',
        deletedUser,
        deletedTransactions,
      })
    } catch (error) {
      console.error('Error al eliminar usuario:', error)
      res.status(500).json({
        message: 'Error al eliminar usuario y transacciones',
        error: error.message,
      })
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

  async updateTransaction(req, res) {
    const { transactionId } = req.params
    const updateData = req.body

    try {
      if (!Object.keys(updateData).length) {
        return res.status(400).json({ message: 'No data provided for update' })
      }

      const updatedTransaction = await Transaction.findByIdAndUpdate(
        transactionId,
        updateData,
        { new: true, runValidators: true },
      )

      if (!updatedTransaction) {
        return res.status(404).json({ message: 'Transacción no encontrada' })
      }

      res.status(200).json({
        message: 'Transacción actualizada con éxito',
        updatedTransaction,
      })
    } catch (error) {
      console.error('Error al actualizar transacción:', error)
      res.status(500).json({
        message: 'Error al actualizar transacción',
        error: error.message,
      })
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
