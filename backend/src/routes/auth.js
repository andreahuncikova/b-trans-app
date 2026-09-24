import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role, driver: user.driver }
}

// First account ever created becomes admin; after that, only an admin can register new users.
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email and password are required' })
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' })
  }

  const existing = await User.findOne({ email: email.toLowerCase() })
  if (existing) return res.status(409).json({ error: 'Email already registered' })

  const userCount = await User.countDocuments()
  if (userCount > 0) {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    let requesterRole = null
    if (token) {
      try {
        requesterRole = jwt.verify(token, process.env.JWT_SECRET).role
      } catch {
        // ignore invalid token, treated as unauthenticated below
      }
    }
    if (requesterRole !== 'admin') {
      return res.status(403).json({ error: 'Only an admin can create new accounts' })
    }
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const role = userCount === 0 ? 'admin' : 'driver'
  const user = await User.create({ name, email: email.toLowerCase(), passwordHash, role })

  res.status(201).json({ token: signToken(user), user: publicUser(user) })
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'email and password are required' })

  const user = await User.findOne({ email: email.toLowerCase() })
  if (!user) return res.status(401).json({ error: 'Invalid credentials' })

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' })

  res.json({ token: signToken(user), user: publicUser(user) })
})

router.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.user.sub)
  if (!user) return res.status(404).json({ error: 'User not found' })
  res.json({ user: publicUser(user) })
})

export default router
