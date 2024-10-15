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

      // Se asegura que las categorías no se repitan
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

  // Obtener todas las transacciones de un usuario por req.body dni
  async getTransactionsByUserDni(req, res) {
    const { dni, category } = req.body //category es opcional y solo puede ser una, si no se envia categoria, se devolverán todas las transacciones

    try {
      const user = await User.findOne({ dni })
      if (!user) {
        return res.status(404).send({ message: 'Usuario no encontrado' })
      }

      if (category) {
        // Comprobar que la categoría es válida
        if (!categories[category]) {
          return res.status(400).send({
            message:
              'El usuario no cuenta con transacciones para esa categoría',
          })
        }

        const filteredTransactions = await Transaction.find({
          userId: user._id,
          category: { $in: categories[category].items },
        }).sort({ createdAt: -1 }) // Ordenar de más reciente a más antiguo

        // Comprobar si hay transacciones en la categoría especificada
        if (filteredTransactions.length === 0) {
          return res.status(404).send({
            message:
              'El usuario no cuenta con transacciones para esa categoría',
          })
        }

        return res.send({
          categories: [
            {
              [category]: {
                name: categories[category].name,
                transactions: filteredTransactions,
              },
            },
          ],
        })
      }

      // Si no hay categoría, obtener todas las transacciones
      const transactions = await Transaction.find({ userId: user._id }).sort({
        createdAt: -1,
      }) // También de más reciente a más antigua

      const groupedTransactions = Object.keys(categories).reduce(
        (result, key) => {
          const filteredTransactions = transactions.filter((transaction) =>
            categories[key].items.includes(transaction.category),
          )

          if (filteredTransactions.length > 0) {
            result.push({
              [key]: {
                name: categories[key].name,
                transactions: filteredTransactions,
              },
            })
          }

          return result
        },
        [],
      )

      res.send({ categories: groupedTransactions })
    } catch (error) {
      console.error(error)
      res
        .status(500)
        .send({ message: 'Error al obtener las transacciones', error })
    }
  },

  // Obtener transacciones mensuales de un usuario por req.body dni y categoria y fecha opcionales,
  // si no se especifica categoría mismo funcionamiento que getTransactionsByUserDni,
  // si no se especifica fecha, mes y año actual
  async getMonthlyTransactionsByUserDni(req, res) {
    const { dni, month, year, category } = req.body // La categoría es opcional

    const currentDate = new Date()
    const queryMonth = month !== undefined ? month - 1 : currentDate.getMonth()
    const queryYear = year || currentDate.getFullYear()

    try {
      const user = await User.findOne({ dni })
      if (!user) {
        return res.status(404).send({ message: 'Usuario no encontrado' })
      }

      if (category) {
        if (!categories[category]) {
          return res.status(400).send({
            message: 'El usuario no cuenta con transacciones en esa categoría',
          })
        }

        const filteredTransactions = await Transaction.find({
          userId: user._id,
          createdAt: {
            $gte: new Date(queryYear, queryMonth, 1),
            $lt: new Date(queryYear, queryMonth + 1, 1),
          },
          category: { $in: categories[category].items },
        }).sort({ createdAt: -1 })

        if (filteredTransactions.length === 0) {
          return res.status(404).send({
            message: 'El usuario no cuenta con transacciones en esa categoría',
          })
        }

        return res.send({
          categories: [
            {
              [category]: {
                name: categories[category].name,
                transactions: filteredTransactions,
              },
            },
          ],
        })
      }

      const transactions = await Transaction.find({
        userId: user._id,
        createdAt: {
          $gte: new Date(queryYear, queryMonth, 1),
          $lt: new Date(queryYear, queryMonth + 1, 1),
        },
      }).sort({ createdAt: -1 })

      const groupedTransactions = Object.keys(categories).reduce(
        (result, key) => {
          const filteredTransactions = transactions.filter((transaction) =>
            categories[key].items.includes(transaction.category),
          )

          if (filteredTransactions.length > 0) {
            result.push({
              [key]: {
                name: categories[key].name,
                transactions: filteredTransactions,
              },
            })
          }

          return result
        },
        [],
      )

      res.send({ categories: groupedTransactions })
    } catch (error) {
      console.error(error)
      res
        .status(500)
        .send({ message: 'Error al obtener las transacciones', error })
    }
  },
}

module.exports = TransController
