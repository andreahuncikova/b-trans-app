import type { Request, Response } from 'express'
import Vehicle from '../models/Vehicle.js'

export async function listVehicles(_req: Request, res: Response) {
  const vehicles = await Vehicle.find().populate('driver', 'name').sort({ createdAt: 1 })
  res.json(vehicles)
}

export async function createVehicle(req: Request, res: Response) {
  const { name, plate, driver, lastStk, stkIntervalYears } = req.body
  if (!name || !plate) return res.status(400).json({ error: 'Názov a ŠPZ sú povinné' })
  const vehicle = await Vehicle.create({ name, plate, driver, lastStk, stkIntervalYears })
  res.status(201).json(vehicle)
}

export async function updateVehicle(req: Request, res: Response) {
  const { name, plate, driver, lastStk, stkIntervalYears, inService, serviceReason } = req.body
  const vehicle = await Vehicle.findByIdAndUpdate(
    req.params.id,
    { $set: { name, plate, driver, lastStk, stkIntervalYears, inService, serviceReason } },
    { new: true, runValidators: true, omitUndefined: true }
  )
  if (!vehicle) return res.status(404).json({ error: 'Vozidlo nenájdené' })
  res.json(vehicle)
}

export async function deleteVehicle(req: Request, res: Response) {
  const vehicle = await Vehicle.findByIdAndDelete(req.params.id)
  if (!vehicle) return res.status(404).json({ error: 'Vozidlo nenájdené' })
  res.status(204).end()
}
