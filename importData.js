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
    const dniToUserIdMap = new Map() // Mapa para búsqueda rápida

    for (const userData of users) {
      // Verifica el formato del DNI antes de continuar
      if (!/^[0-9]{8}[A-Za-z]$/.test(userData.dni)) {
        console.error(`DNI no válido: ${userData.dni}`)
        continue // Saltar este usuario si el DNI no es válido
      }

      const user = new User(userData) // No hashear el DNI aquí, solo IBAN y contraseña

      try {
        const savedUser = await user.save() // Esto activará el pre('save') y hasheará la contraseña e IBAN
        insertedUsers.push(savedUser)

        // Agregar el DNI al mapa para búsqueda rápida
        dniToUserIdMap.set(savedUser.dni, savedUser._id)
      } catch (error) {
        console.error('Error al guardar el usuario:', error)
      }
    }

    console.log(
      'Usuarios importados correctamente:',
      insertedUsers.map((user) => ({ dni: user.dni, id: user._id })),
    )

    return { insertedUsers, dniToUserIdMap } // Retornar ambos usuarios y el mapa
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

      // Usar el mapa para encontrar rápidamente el ID de usuario basado en el DNI
      const userId = dniToUserIdMap.get(transaction.dni)

      if (userId) {
        transaction.userId = userId // Asignar el ID de usuario encontrado
      } else {
        console.warn(
          `Usuario no encontrado para la transacción con DNI: ${transaction.dni}`,
        )
        continue // Saltar esta transacción si no se encuentra el usuario
      }

      delete transaction.dni // Asegurarse de que el DNI no se almacene
      transactionsToInsert.push(transaction) // Agregar la transacción al array
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
  const { dniToUserIdMap } = await importUsers() // Desestructurar el objeto retornado
  await importTransactions(dniToUserIdMap) // Pasar el mapa de DNI a ID
  mongoose.connection.close()
}

importData()
