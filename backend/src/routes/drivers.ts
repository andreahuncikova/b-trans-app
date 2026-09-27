import { Router } from 'express'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { listDrivers, createDriver, updateDriver, deleteDriver } from '../controllers/driversController.js'

const router = Router()
router.use(requireAuth)

router.get('/', asyncHandler(listDrivers))
router.post('/', requireAdmin, asyncHandler(createDriver))
router.patch('/:id', requireAdmin, asyncHandler(updateDriver))
router.delete('/:id', requireAdmin, asyncHandler(deleteDriver))

export default router
