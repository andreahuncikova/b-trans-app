import { Router } from 'express'
import Vehicle from '../models/Vehicle.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

router.get('/', async (req, res) => {
  const vehicles = await Vehicle.find().populate('driver', 'name').sort({ createdAt: 1 })
  res.json(vehicles)
})

router.post('/', requireAdmin, async (req, res) => {
  const { name, plate, driver, lastStk, stkIntervalYears } = req.body
  if (!name || !plate) return res.status(400).json({ error: 'name and plate are required' })
  const vehicle = await Vehicle.create({ name, plate, driver, lastStk, stkIntervalYears })
  res.status(201).json(vehicle)
})

// Used for both editing details and toggling the service checkbox/reason from the Vehicles page.
router.patch('/:id', requireAdmin, async (req, res) => {
  const { name, plate, driver, lastStk, stkIntervalYears, inService, serviceReason } = req.body
  const vehicle = await Vehicle.findByIdAndUpdate(
    req.params.id,
    { $set: { name, plate, driver, lastStk, stkIntervalYears, inService, serviceReason } },
    { new: true, runValidators: true, omitUndefined: true }
  )
  if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' })
  res.json(vehicle)
})

router.delete('/:id', requireAdmin, async (req, res) => {
  const vehicle = await Vehicle.findByIdAndDelete(req.params.id)
  if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' })
  res.status(204).end()
})

export default router
