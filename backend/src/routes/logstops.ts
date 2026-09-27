import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { listLogStops, upsertLogStop, deleteLogStop } from '../controllers/logStopsController.js'

const router = Router()
router.use(requireAuth)

router.get('/', asyncHandler(listLogStops))
router.put('/', asyncHandler(upsertLogStop))
router.delete('/:id', asyncHandler(deleteLogStop))

export default router
