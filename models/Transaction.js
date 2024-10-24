const mongoose = require('mongoose')
const ObjectId = mongoose.SchemaTypes.ObjectId

const TransactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, 'Por favor proporciona el tipo de transacción'],
    },
    category: {
      type: String,
      required: [true, 'Por favor proporciona la categoría de la transacción'],
    },
    amount: {
      type: Number,
      required: [true, 'Por favor proporciona el monto de la transacción'],
    },
    userId: {
      type: ObjectId,
      ref: 'User',
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
  },
)

const Transaction = mongoose.model('Transaction', TransactionSchema)
module.exports = Transaction
