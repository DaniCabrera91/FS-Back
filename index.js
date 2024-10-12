require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors())

const PORT = process.env.REACT_APP_PORT || 3001

const { dbConnection } = require('./config/config')

app.use(express.json())
dbConnection()

app.use('/test', require('./routes/test'))
app.use('/users', require('./routes/users'))
app.use('/admins', require('./routes/admins'))

app.listen(PORT, () => console.log(`Server started at port ${PORT}`))
