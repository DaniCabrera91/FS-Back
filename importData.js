require('dotenv').config()
const mongoose = require('mongoose')
const fs = require('fs')
const bcrypt = require('bcrypt')
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
    const dniToUserIdMap = new Map()

    for (const userData of users) {
      if (!/^[0-9]{8}[A-Za-z]$/.test(userData.dni)) {
        console.error(`DNI no válido: ${userData.dni}`)
        continue
      }

      const user = new User(userData)

      try {
        const savedUser = await user.save()
        insertedUsers.push(savedUser)

        dniToUserIdMap.set(savedUser.dni, savedUser._id)
      } catch (error) {
        console.error('Error al guardar el usuario:', error)
      }
    }

    console.log(
      'Usuarios importados correctamente:',
      insertedUsers.map((user) => ({ dni: user.dni, id: user._id })),
    )

    return { insertedUsers, dniToUserIdMap }
  } catch (error) {
    console.error('Error al importar usuarios:', error)
  }
}

const importTransactions = async (dniToUserIdMap) => {
  try {
    const transactions = JSON.parse(
      fs.readFileSync('./resources/transactionInsert.json', 'utf-8'),
    )

    const transactionsToInsert = []

    for (const transaction of transactions) {
      console.log('Verificando transacción:', transaction)

      const userId = dniToUserIdMap.get(transaction.dni)

      if (userId) {
        transaction.userId = userId
      } else {
        console.warn(
          `Usuario no encontrado para la transacción con DNI: ${transaction.dni}`,
        )
        continue
      }

      delete transaction.dni
      transactionsToInsert.push(transaction)
    }

    if (transactionsToInsert.length > 0) {
      await Transaction.insertMany(transactionsToInsert)
      console.log(
        'Transacciones importadas correctamente:',
        transactionsToInsert.length,
      )
    } else {
      console.warn(
        'No se importaron transacciones, ya que ninguna tenía un usuario asociado.',
      )
    }
  } catch (error) {
    console.error('Error al importar transacciones:', error)
  }
}

const importData = async () => {
  const { dniToUserIdMap } = await importUsers()
  await importTransactions(dniToUserIdMap)
  mongoose.connection.close()
}

importData()
