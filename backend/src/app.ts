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

export function createApp() {
  const app = express()

  app.use(helmet())
  app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }))
  app.use(express.json())

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
