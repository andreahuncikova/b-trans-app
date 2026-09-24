import { Router } from 'express'
import LogStop from '../models/LogStop.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

function monthRange(year, month) {
  const start = new Date(Date.UTC(year, month - 1, 1))
  const end = new Date(Date.UTC(year, month, 1))
  return { start, end }
}

router.get('/', async (req, res) => {
  const { driver, year, month } = req.query
  const filter = {}
  if (driver) filter.driver = driver
  if (year && month) {
    const { start, end } = monthRange(Number(year), Number(month))
    filter.date = { $gte: start, $lt: end }
  }
  const entries = await LogStop.find(filter).sort({ date: 1 })
  res.json(entries)
})

router.put('/', async (req, res) => {
  const { driver, date, stops, hours } = req.body
  if (!driver || !date) return res.status(400).json({ error: 'driver and date are required' })

  const entry = await LogStop.findOneAndUpdate(
    { driver, date: new Date(date) },
    { $set: { stops: stops ?? 0, hours: hours ?? null } },
    { new: true, upsert: true, runValidators: true }
  )
  res.json(entry)
})

router.delete('/:id', async (req, res) => {
  const entry = await LogStop.findByIdAndDelete(req.params.id)
  if (!entry) return res.status(404).json({ error: 'Entry not found' })
  res.status(204).end()
})

export default router
