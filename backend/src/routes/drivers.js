import { Router } from 'express'
import Driver from '../models/Driver.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

router.get('/', async (req, res) => {
  const drivers = await Driver.find().sort({ createdAt: 1 })
  res.json(drivers)
})

router.post('/', requireAdmin, async (req, res) => {
  const { name, role, type, status } = req.body
  if (!name) return res.status(400).json({ error: 'name is required' })
  const driver = await Driver.create({ name, role, type, status })
  res.status(201).json(driver)
})

router.patch('/:id', requireAdmin, async (req, res) => {
  const { name, role, type, status } = req.body
  const driver = await Driver.findByIdAndUpdate(
    req.params.id,
    { $set: { name, role, type, status } },
    { new: true, runValidators: true, omitUndefined: true }
  )
  if (!driver) return res.status(404).json({ error: 'Driver not found' })
  res.json(driver)
})

router.delete('/:id', requireAdmin, async (req, res) => {
  const driver = await Driver.findByIdAndDelete(req.params.id)
  if (!driver) return res.status(404).json({ error: 'Driver not found' })
  res.status(204).end()
})

export default router
