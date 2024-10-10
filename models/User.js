const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const Schema = mongoose.Schema

const userSchema = new Schema(
  {
    profile: {
      type: String,
      required: [true, 'El perfil es requerido'],
      minlength: [3, 'El perfil debe tener al menos 3 caracteres'],
      maxlength: [50, 'El perfil no puede exceder los 50 caracteres'],
    },
    name: {
      type: String,
      required: [true, 'El nombre es requerido'],
      minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
      maxlength: [50, 'El nombre no puede exceder los 50 caracteres'],
    },
    surname: {
      type: String,
      required: [true, 'El apellido es requerido'],
      minlength: [2, 'El apellido debe tener al menos 2 caracteres'],
      maxlength: [50, 'El apellido no puede exceder los 50 caracteres'],
    },
    birth_date: {
      type: Date,
      required: [true, 'La fecha de nacimiento es requerida'],
      validate: {
        validator: function (v) {
          return v <= new Date()
        },
        message: 'La fecha de nacimiento no puede estar en el futuro',
      },
    },
    dni: {
      type: String,
      required: [true, 'El DNI es requerido'],
      unique: true,
      validate: {
        validator: function (v) {
          return /^[0-9]{8}[A-Za-z]$/.test(v)
        },
        message: 'El DNI no es válido',
      },
    },
    email: {
      type: String,
      required: [true, 'El correo electrónico es requerido'],
      unique: true,
      match: [/^\S+@\S+\.\S+$/, 'El correo electrónico no es válido'],
    },
    password: {
      type: String,
      required: [true, 'La contraseña es requerida'],
      minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    },
    city: {
      type: String,
      required: [true, 'La ciudad es requerida'],
      minlength: [2, 'La ciudad debe tener al menos 2 caracteres'],
    },
    iban: {
      type: String,
      required: [true, 'El IBAN es requerido'],
      unique: true,
      validate: {
        validator: function (v) {
          return /^[A-Z]{2}\d{22}$/.test(v)
        },
        message: 'El IBAN no es válido',
      },
    },
    assets: {
      type: Number,
      required: [true, 'El saldo es requerido'],
      min: [0, 'El saldo no puede ser negativo'],
    },
  },
  {
    timestamps: true,
  },
)

userSchema.pre('save', async function (next) {
  const user = this
  if (!user.isModified('password')) return next()

  try {
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(user.password, salt)
    next()
  } catch (err) {
    next(err)
  }
})

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

const User = mongoose.model('User', userSchema)
module.exports = User
