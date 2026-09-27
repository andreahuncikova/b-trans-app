import type { Request, Response } from 'express'
import LogStop from '../models/LogStop.js'

function monthRange(year: number, month: number) {
  const start = new Date(Date.UTC(year, month - 1, 1))
  const end = new Date(Date.UTC(year, month, 1))
  return { start, end }
}

export async function listLogStops(req: Request, res: Response) {
  const { driver, year, month } = req.query
  const filter: Record<string, unknown> = {}
  if (driver) filter.driver = driver
  if (year && month) {
    const { start, end } = monthRange(Number(year), Number(month))
    filter.date = { $gte: start, $lt: end }
  }
  const entries = await LogStop.find(filter).sort({ date: 1 })
  res.json(entries)
}

export async function upsertLogStop(req: Request, res: Response) {
  const { driver, date, stops, hours } = req.body
  if (!driver || !date) return res.status(400).json({ error: 'driver and date are required' })

  const entry = await LogStop.findOneAndUpdate(
    { driver, date: new Date(date) },
    { $set: { stops: stops ?? 0, hours: hours ?? null } },
    { new: true, upsert: true, runValidators: true }
  )
  res.json(entry)
}

export async function deleteLogStop(req: Request, res: Response) {
  const entry = await LogStop.findByIdAndDelete(req.params.id)
  if (!entry) return res.status(404).json({ error: 'Entry not found' })
  res.status(204).end()
}
