const handleValidationError = (err, res) => {
  const errors = Object.values(err.errors).map((el) => el.message)
  res.status(400).send({
    success: false,
    message: errors.length > 1 ? errors : errors[0],
  })
}

const typeError = (err, req, res, next) => {
  console.error(err)

  if (err.name === 'ValidationError') {
    return handleValidationError(err, res)
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)
    return res.status(400).send({
      success: false,
      message: `El campo ${field} ya está registrado. Debe ser único.`,
    })
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).send({
      success: false,
      message: 'Tu sesión ha expirado. Inicia sesión nuevamente.',
    })
  }

  if (err.name === 'CastError') {
    return res.status(400).send({
      success: false,
      message:
        'Identificador inválido. Asegúrate de proporcionar un ID válido.',
    })
  }

  res.status(500).send({
    success: false,
    message: 'Hubo un problema. Intenta nuevamente más tarde.',
  })
}

module.exports = { typeError }
