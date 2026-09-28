import { Router } from 'express'
import { requireAuth, requireAdmin, requireReminderSecret } from '../middleware/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import {
  listVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  checkReminders,
} from '../controllers/vehiclesController.js'

const router = Router()

router.post('/check-reminders', requireReminderSecret, asyncHandler(checkReminders))

router.use(requireAuth)

router.get('/', asyncHandler(listVehicles))
router.post('/', requireAdmin, asyncHandler(createVehicle))
router.patch('/:id', requireAdmin, asyncHandler(updateVehicle))
router.delete('/:id', requireAdmin, asyncHandler(deleteVehicle))

export default router
