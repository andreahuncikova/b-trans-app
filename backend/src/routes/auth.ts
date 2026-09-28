import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { authLimiter, passwordResetLimiter } from '../middleware/rateLimit.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { register, login, me, logout, forgotPassword, resetPassword } from '../controllers/authController.js'

const router = Router()

router.post('/register', authLimiter, asyncHandler(register))
router.post('/login', authLimiter, asyncHandler(login))
router.get('/me', requireAuth, asyncHandler(me))
router.post('/logout', requireAuth, asyncHandler(logout))
router.post('/forgot-password', passwordResetLimiter, asyncHandler(forgotPassword))
router.post('/reset-password', passwordResetLimiter, asyncHandler(resetPassword))

export default router
