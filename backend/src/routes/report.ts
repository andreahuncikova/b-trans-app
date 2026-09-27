import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { getMonthlyReport } from '../controllers/reportController.js'

const router = Router()
router.use(requireAuth)

router.get('/', asyncHandler(getMonthlyReport))

export default router
