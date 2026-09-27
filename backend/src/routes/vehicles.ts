import { Router } from 'express'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { listVehicles, createVehicle, updateVehicle, deleteVehicle } from '../controllers/vehiclesController.js'

const router = Router()
router.use(requireAuth)

router.get('/', asyncHandler(listVehicles))
router.post('/', requireAdmin, asyncHandler(createVehicle))
router.patch('/:id', requireAdmin, asyncHandler(updateVehicle))
router.delete('/:id', requireAdmin, asyncHandler(deleteVehicle))

export default router
