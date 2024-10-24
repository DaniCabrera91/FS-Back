require('dotenv').config()
const Transaction = require('../models/Transaction')
const User = require('../models/User')

const TestController = {
  async getAllUsers(req, res) {
    try {
      const users = await User.find()
      res.send(users)
    } catch (error) {
      console.error(error)
      res.status(500).send({ message: 'Error al obtener los usuarios' })
    }
  },

  async getAllTransactions(req, res) {
    try {
      const transactions = await Transaction.find().populate('userId', 'name')
      res.send(transactions)
    } catch (error) {
      console.error(error)
      res.status(500).send({ message: 'Error al obtener las transacciones' })
    }
  },

  async createUser(req, res) {
    try {
      const user = new User(req.body)
      await user.save()
      res.status(201).send({ message: 'Usuario creado con éxito', user })
    } catch (error) {
      console.error(error)
      res.status(500).send({ message: 'Error al crear el usuario', error })
    }
  },

  async createTransaction(req, res) {
    try {
      const { dni, ...transactionData } = req.body

      const user = await User.findOne({ dni })

      if (!user) {
        return res
          .status(400)
          .send({ message: 'No se encontró un usuario con ese DNI' })
      }

      transactionData.userId = user._id

      const transaction = new Transaction(transactionData)
      await transaction.save()

      res.status(201).send({
        message: 'Transacción creada con éxito',
        transaction,
      })
    } catch (error) {
      console.error(error)
      res.status(500).send({ message: 'Error al crear la transacción', error })
    }
  },
}

module.exports = TestController
