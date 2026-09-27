import { Router } from 'express'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { listLogStops, upsertLogStop, deleteLogStop } from '../controllers/logStopsController.js'

const router = Router()
router.use(requireAuth)

router.get('/', asyncHandler(listLogStops))
router.put('/', requireAdmin, asyncHandler(upsertLogStop))
router.delete('/:id', requireAdmin, asyncHandler(deleteLogStop))

export default router
