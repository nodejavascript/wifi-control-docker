import 'dotenv/config'
import { startMonitor, returnLogs } from './lib'
import express from 'express'
import helmet from 'helmet'

const { APP_PORT } = process.env

export const readySetGo = async () => {
  await startMonitor()

  const app = express()

  app.disable('x-powered-by')
  app.use(helmet())

  app.get('/favicon.ico', (req, res) => res.sendStatus(204))

  app.use('/', (req, res) => {
    res.send(returnLogs())
  })

  app.get('*', (req, res, next) => {
    const error404 = new Error()
    error404.status = 404
    next(error404)
  })

  app.use((error, req, res, next) => console.log(error))

  app.listen({ port: APP_PORT })
}
