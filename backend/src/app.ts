import express from 'express'
import type { NextFunction, Request, Response } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import authRoutes from './routes/auth.js'
import driverRoutes from './routes/drivers.js'
import vehicleRoutes from './routes/vehicles.js'
import logStopRoutes from './routes/logstops.js'
import reportRoutes from './routes/report.js'
import applicantRoutes from './routes/applicants.js'

const DEV_ORIGINS = ['http://localhost:5173', 'http://localhost:5174']

export function createApp() {
  const app = express()

  const configuredOrigins = (process.env.CLIENT_ORIGIN ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
  const allowedOrigins = [...new Set([...configuredOrigins, ...DEV_ORIGINS])]

  app.use(helmet())
  app.use(
    cors({
      origin(origin, callback) {
        // requests with no Origin header (curl, server-to-server, the health check) are always allowed
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true)
        } else {
          callback(new Error('Not allowed by CORS'))
        }
      },
    })
  )
  app.use(express.json({ limit: '5mb' }))

  app.get('/api/health', (_req: Request, res: Response) => res.json({ ok: true }))

  app.use('/api/auth', authRoutes)
  app.use('/api/drivers', driverRoutes)
  app.use('/api/vehicles', vehicleRoutes)
  app.use('/api/logstops', logStopRoutes)
  app.use('/api/report', reportRoutes)
  app.use('/api/applicants', applicantRoutes)

  app.use((_req: Request, res: Response) => res.status(404).json({ error: 'Stránka nenájdená' }))

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err)
    res.status(500).json({ error: 'Interná chyba servera' })
  })

  return app
}
