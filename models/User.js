const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const Schema = mongoose.Schema

const userSchema = new Schema(
  {
    profile: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 50,
    },
    name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 50,
    },
    surname: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 50,
    },
    birth_date: {
      type: Date,
      required: true,
      validate: {
        validator: function (v) {
          return v <= new Date()
        },
        message: 'La fecha de nacimiento no puede estar en el futuro',
      },
    },
    dni: {
      type: String,
      required: true,
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
      required: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, 'El correo electrónico no es válido'],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    city: {
      type: String,
      required: true,
      minlength: 2,
    },
    iban: {
      type: String,
      required: true,
      unique: true,
    },
    assets: {
      type: Number,
      required: true,
      min: [0, 'El saldo no puede ser negativo'],
    },
    tokens: [
      {
        type: String,
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  },
)

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
  }

  if (this.isModified('iban')) {
    const salt = await bcrypt.genSalt(10)
    this.iban = await bcrypt.hash(this.iban, salt)
  }

  next()
})

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

userSchema.methods.compareIBAN = async function (candidateIBAN) {
  return await bcrypt.compare(candidateIBAN, this.iban)
}

const User = mongoose.model('User', userSchema)
module.exports = User
