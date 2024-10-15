require('dotenv').config()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const User = require('../models/User')
const Transaction = require('../models/Transaction')
const categories = require('../utils/categories')

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

  // GET ALL CATEGORIES
  async getAllCategories(req, res) {
    try {
      // Encuentra todas las transacciones y extrae las categorías
      const transactions = await Transaction.find().select('category')

      // Usar un conjunto para obtener categorías únicas
      const categories = [
        ...new Set(transactions.map((transaction) => transaction.category)),
      ]
      res.send(categories)
    } catch (error) {
      console.error(error)
      res
        .status(500)
        .send({ message: 'Error al obtener las categorías', error })
    }
  },

  // async getTransactionsByUserDni(req, res) {
  //   const { dni } = req.params

  //   try {
  //     const user = await User.findOne({ dni })
  //     if (!user) {
  //       return res.status(404).send({ message: 'Usuario no encontrado' })
  //     }
  //     const transactions = await Transaction.find({ userId: user._id })
  //     const groupedTransactions = Object.keys(categories).map((key) => {
  //       return {
  //         [key]: {
  //           name: categories[key].name,
  //           transactions: transactions.filter((transaction) =>
  //             categories[key].items.includes(transaction.category),
  //           ),
  //         },
  //       }
  //     })

  //     res.send({ categories: groupedTransactions })
  //   } catch (error) {
  //     console.error(error)
  //     res
  //       .status(500)
  //       .send({ message: 'Error al obtener las transacciones', error })
  //   }
  // },
  async getTransactionsByUserDni(req, res) {
    const { dni } = req.body

    try {
      const user = await User.findOne({ dni })
      if (!user) {
        return res.status(404).send({ message: 'Usuario no encontrado' })
      }

      const transactions = await Transaction.find({ userId: user._id })

      const groupedTransactions = Object.keys(categories).map((key) => {
        return {
          [key]: {
            name: categories[key].name,
            transactions: transactions.filter((transaction) =>
              categories[key].items.includes(transaction.category),
            ),
          },
        }
      })

      res.send({ categories: groupedTransactions })
    } catch (error) {
      console.error(error)
      res
        .status(500)
        .send({ message: 'Error al obtener las transacciones', error })
    }
  },
  async getMonthlyTransactionsByUserDni(req, res) {
    const currentDate = new Date().toDateString()
    const { dni } = req.body

    try {
      const user = await User.findOne({ dni })
      if (!user) {
        return res.status(404).send({ message: 'Usuario no encontrado' })
      }

      const transactions = await Transaction.find({ userId: user._id })

      const groupedTransactions = Object.keys(categories).map((key) => {
        return {
          [key]: {
            name: categories[key].name,
            transactions: transactions.filter((transaction) =>
              categories[key].items.includes(transaction.category),
            ),
          },
        }
      })
      //filtrar po currentdate, que corresponda a ese mes
      const filteredTransactions = Object.keys(categories).map((key) => {
        return {
          [key]: {
            name: categories[key].name,
            transactions: transactions.filter((transaction) =>
              categories[key].items.includes(transaction.category),
            ),
          },
        }
      })

      res.send({ categories: groupedTransactions })
    } catch (error) {
      console.error(error)
      res
        .status(500)
        .send({ message: 'Error al obtener las transacciones', error })
    }
  },
  // async getMonthlyTransactionsByUserDni(req, res) {
  //   const currentDate = new Date();
  //   const { dni } = req.body;

  //   try {
  //     const user = await User.findOne({ dni });
  //     if (!user) {
  //       return res.status(404).send({ message: 'Usuario no encontrado' });
  //     }

  //     // Obtener las transacciones del usuario
  //     const transactions = await Transaction.find({ userId: user._id });

  //     // Obtener el mes y año actuales
  //     const currentMonth = currentDate.getMonth();
  //     const currentYear = currentDate.getFullYear();

  //     // Filtrar las transacciones que pertenecen al mes y año actuales
  //     const filteredTransactions = transactions.filter(transaction => {
  //       const transactionDate = new Date(transaction.createdAt);
  //       return (
  //         transactionDate.getMonth() === currentMonth &&
  //         transactionDate.getFullYear() === currentYear
  //       );
  //     });

  //     // Agrupar las transacciones filtradas por categorías
  //     const groupedTransactions = Object.keys(categories).map((key) => {
  //       return {
  //         [key]: {
  //           name: categories[key].name,
  //           transactions: filteredTransactions.filter((transaction) =>
  //             categories[key].items.includes(transaction.category),
  //           ),
  //         },
  //       };
  //     });

  //     // Enviar la respuesta con las transacciones agrupadas
  //     res.send({ categories: groupedTransactions });
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).send({ message: 'Error al obtener las transacciones', error });
  //   }
  // }

  // FILTER TRANSACTIONS BY TYPE

  // GET (monthly summary of transactions)

  // GET (monthly summary of transactions) BY CATEGORY

  // ---
}

module.exports = TransController
