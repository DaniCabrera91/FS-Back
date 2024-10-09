const mongoose = require('mongoose')
const Schema = mongoose.Schema

// Definir el esquema del usuario
const userSchema = new Schema(
  {
    profile: { type: String, required: true }, // Ej: buyer_1
    name: { type: String, required: true }, // Nombre del usuario
    surname: { type: String, required: true }, // Apellido del usuario
    birth_date: { type: Date, required: true }, // Fecha de nacimiento
    dni: { type: String, required: true, unique: true }, // DNI único
    email: { type: String, required: true, unique: true }, // Email único
    iban: { type: String, required: true, unique: true }, // IBAN único
    balance: { type: Number, required: true }, // Saldo del usuario
  },
  {
    timestamps: true, // Añade createdAt y updatedAt automáticamente
  },
)

// Crear el modelo del usuario
const User = mongoose.model('User', userSchema)
module.exports = User
