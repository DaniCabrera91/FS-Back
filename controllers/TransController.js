require('dotenv').config()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const User = require('../models/Transaction')
const Transaction = require('../models/Transaction')

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

  // GET TRANSACTION BY ID
  async getTransById(req, res) {
    try {
      const transaction = await Transaction.findById(req.params._id)
      res.status(201).send({
        message: 'Transacción encontrada con éxito',
        transaction,
      })
    } catch (error) {
      console.error(error)
      res.status(500).send({ message: 'Error al buscar la transacción', error })
    }
  },

  // UPDATE TRANSACTION BY ID
  async updateTransById(req, res) {
    try {
      const transaction = await Transaction.findByIdAndUpdate(
        req.params._id,
        req.body,
        // devuelve el objeto modificado
        { new: true },
      )
      res.status(201).send({
        message: 'Transacción actualizada con éxito',
        transaction,
      })
    } catch (error) {
      console.error(error)
      res.status(500).send({ message: 'Error al crear la transacción', error })
    }
  },

  // DELETE TRANSACTION BY ID
  async deleteTransById(req, res) {
    try {
      const transaction = await Transaction.findByIdAndDelete(req.params._id)
      res.status(201).send({
        message: 'Transacción eliminada con éxito',
        transaction,
      })
    } catch (error) {
      console.error(error)
      res
        .status(500)
        .send({ message: 'Error al eliminar la transacción', error })
    }
  },

  // FILTER TRANSACTIONS BY TYPE

  // GET (monthly summary of transactions)

  // GET (monthly summary of transactions) BY CATEGORY

  // ---
}

module.exports = TransController
