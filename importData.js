require('dotenv').config()
const mongoose = require('mongoose')
const fs = require('fs')
const User = require('./models/User')
const Transaction = require('./models/Transaction')

mongoose
  .connect(process.env.REACT_APP_MONGO_URI)
  .then(() => console.log('Conexión exitosa a MongoDB'))
  .catch((err) => console.error('Error al conectar a MongoDB:', err))

const importUsers = async () => {
  try {
    const users = JSON.parse(
      fs.readFileSync('./resources/userInsert.json', 'utf-8'),
    )

    const insertedUsers = []

    for (const userData of users) {
      const user = new User(userData)

      const savedUser = await user.save()
      insertedUsers.push(savedUser)
    }

    console.log('Usuarios importados correctamente:', insertedUsers)
    return insertedUsers
  } catch (error) {
    console.error('Error al importar usuarios:', error)
  }
}

const importTransactions = async (insertedUsers) => {
  try {
    let transactions = JSON.parse(
      fs.readFileSync('./resources/transactionInsert.json', 'utf-8'),
    )

    transactions = transactions.map((transaction) => {
      const user = insertedUsers.find((user) => user.dni === transaction.dni)
      if (user) {
        transaction.userId = user._id
      }
      delete transaction.dni
      return transaction
    })

    await Transaction.insertMany(transactions)
    console.log('Transacciones importadas correctamente')
  } catch (error) {
    console.error('Error al importar transacciones:', error)
  }
}

const importData = async () => {
  const insertedUsers = await importUsers()
  await importTransactions(insertedUsers)
  mongoose.connection.close()
}

importData()
