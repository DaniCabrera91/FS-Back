require('dotenv').config()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const User = require('../models/Transaction')

const TransController = {
  // ---
  // GET ALL THE TRANSACTIONS
  async getAllTransactions(req, res) {
    try {
      const transactions = await Transaction.find().populate('userId', 'name')
      // Obtiene todas las transacciones
      res.send(transactions)
    } catch (error) {
      console.error(error)
      res.status(500).send({ message: 'Error al obtener las transacciones' })
    }
  },

  // CREATE TRANSACTION
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

  // UPDATE TRANSACTION BY ID
  async updateTransaction(req, res) {
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

  // DELETE TRANSACTION BY ID

  // FILTER TRANSACTIONS BY TYPE

  // GET (monthly summary of transactions)

  // GET (monthly summary of transactions) BY CATEGORY

  // ---
}

module.exports = TransController
