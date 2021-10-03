import http from 'http'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import fs from 'fs'
import path from 'path'

import { sequelize } from './db'
import ProgramRouter from './routes/programs'
import ExerciseRouter from './routes/exercises'
import auth from './routes/auth'
import UserRouter from './routes/user'
import AdminRouter from './routes/admin'

sequelize.sync()

const app: express.Application = express()

// log only 4xx and 5xx responses to console
app.use(morgan('dev', {
    skip: function (req, res) { return res.statusCode < 400 }
}))

// log all requests to access.log
app.use(morgan('common', {
    stream: fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
}))


app.use(cookieParser())
app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use('/programs', ProgramRouter())
app.use('/exercises', ExerciseRouter())

app.use('/api/auth', auth())
app.use('/api/admin', AdminRouter())
app.use("/api/user", UserRouter())


app.use("*", (req, res) => {
    res.status(404).json({
        success: "false",
        message: "Page not found",
        error: {
            statusCode: 404,
            message: "You reached a route that is not defined on this server",
        },
    });
});

const httpServer: http.Server = http.createServer(app)

console.log('Sync database', 'postgresql://postgres:postgres@database-1.cb4vwu4uvc8e.eu-west-3.rds.amazonaws.com:5432/postgres')

httpServer.listen(8000).on('listening', async () => {
    console.log(`Server started at port ${8000}`)
})

export default httpServer
