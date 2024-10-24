require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.REACT_APP_PORT || 3001

const { dbConnection } = require('./config/config')

dbConnection()

app.use('/test', require('./routes/test'))
app.use('/users', require('./routes/users'))
app.use('/admins', require('./routes/admins'))
app.use('/trans', require('./routes/trans'))

app.listen(PORT, () => console.log(`Server started at port ${PORT}`))
