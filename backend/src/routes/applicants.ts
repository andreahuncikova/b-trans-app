import { Router } from 'express'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import { applicantLimiter } from '../middleware/rateLimit.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { createApplicant, listApplicants } from '../controllers/applicantsController.js'

const router = Router()

router.post('/', applicantLimiter, asyncHandler(createApplicant))
router.get('/', requireAuth, requireAdmin, asyncHandler(listApplicants))

export default router
