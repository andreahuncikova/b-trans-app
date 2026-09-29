import { Router } from 'express'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import { applicantLimiter } from '../middleware/rateLimit.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { createApplicant, listApplicants, deleteApplicant } from '../controllers/applicantsController.js'

const router = Router()

router.post('/', applicantLimiter, asyncHandler(createApplicant))
router.get('/', requireAuth, requireAdmin, asyncHandler(listApplicants))
router.delete('/:id', requireAuth, requireAdmin, asyncHandler(deleteApplicant))

export default router
