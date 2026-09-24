import { Router } from 'express'
import LogStop from '../models/LogStop.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

router.get('/', async (req, res) => {
  const year = Number(req.query.year)
  const month = Number(req.query.month)
  if (!year || !month) return res.status(400).json({ error: 'year and month are required' })

  const start = new Date(Date.UTC(year, month - 1, 1))
  const end = new Date(Date.UTC(year, month, 1))

  const rows = await LogStop.aggregate([
    { $match: { date: { $gte: start, $lt: end }, stops: { $gt: 0 } } },
    {
      $group: {
        _id: '$driver',
        days: { $sum: 1 },
        stops: { $sum: '$stops' },
        hours: { $sum: '$hours' },
      },
    },
    { $lookup: { from: 'drivers', localField: '_id', foreignField: '_id', as: 'driver' } },
    { $unwind: '$driver' },
    {
      $project: {
        _id: 0,
        driver: { _id: '$driver._id', name: '$driver.name' },
        days: 1,
        stops: 1,
        hours: 1,
      },
    },
    { $sort: { 'driver.name': 1 } },
  ])

  const totals = rows.reduce(
    (acc, r) => ({
      days: acc.days + r.days,
      stops: acc.stops + r.stops,
      hours: acc.hours + (r.hours || 0),
    }),
    { days: 0, stops: 0, hours: 0 }
  )

  res.json({ rows, totals })
})

export default router
