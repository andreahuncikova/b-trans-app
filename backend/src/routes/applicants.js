import { Router } from 'express'
import Applicant from '../models/Applicant.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = Router()

router.post('/', async (req, res) => {
  const { name, phone, email } = req.body
  if (!name) return res.status(400).json({ error: 'name is required' })
  const applicant = await Applicant.create({ name, phone, email })
  res.status(201).json(applicant)
})

router.get('/', requireAuth, requireAdmin, async (req, res) => {
  const applicants = await Applicant.find().sort({ createdAt: -1 })
  res.json(applicants)
})

export default router
