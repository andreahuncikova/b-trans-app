import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { connectDB } from './db.js'
import authRoutes from './routes/auth.js'
import driverRoutes from './routes/drivers.js'
import vehicleRoutes from './routes/vehicles.js'
import logStopRoutes from './routes/logstops.js'
import reportRoutes from './routes/report.js'

const app = express()

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }))
app.use(express.json())

app.get('/api/health', (req, res) => res.json({ ok: true }))

app.use('/api/auth', authRoutes)
app.use('/api/drivers', driverRoutes)
app.use('/api/vehicles', vehicleRoutes)
app.use('/api/logstops', logStopRoutes)
app.use('/api/report', reportRoutes)

app.use((req, res) => res.status(404).json({ error: 'Not found' }))

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

const port = process.env.PORT || 4000

connectDB()
  .then(() => {
    app.listen(port, () => console.log(`API listening on http://localhost:${port}`))
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err)
    process.exit(1)
  })
