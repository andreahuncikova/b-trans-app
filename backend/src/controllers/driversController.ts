import type { Request, Response } from 'express'
import Driver from '../models/Driver.js'

export async function listDrivers(_req: Request, res: Response) {
  const drivers = await Driver.find().sort({ createdAt: 1 })
  res.json(drivers)
}

export async function createDriver(req: Request, res: Response) {
  const { name, role, type, status } = req.body
  if (!name) return res.status(400).json({ error: 'name is required' })
  const driver = await Driver.create({ name, role, type, status })
  res.status(201).json(driver)
}

export async function updateDriver(req: Request, res: Response) {
  const { name, role, type, status } = req.body
  const driver = await Driver.findByIdAndUpdate(
    req.params.id,
    { $set: { name, role, type, status } },
    { new: true, runValidators: true, omitUndefined: true }
  )
  if (!driver) return res.status(404).json({ error: 'Driver not found' })
  res.json(driver)
}

export async function deleteDriver(req: Request, res: Response) {
  const driver = await Driver.findByIdAndDelete(req.params.id)
  if (!driver) return res.status(404).json({ error: 'Driver not found' })
  res.status(204).end()
}
