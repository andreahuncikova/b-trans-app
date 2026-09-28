import crypto from 'crypto'
import type { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User, { type IUser } from '../models/User.js'
import type { AuthTokenPayload } from '../middleware/auth.js'
import { sendEmail } from '../utils/email.js'

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000

function signToken(user: IUser) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role, name: user.name, tokenVersion: user.tokenVersion },
    process.env.JWT_SECRET as string,
    { expiresIn: '7d' }
  )
}

function publicUser(user: IUser) {
  return { id: user._id, name: user.name, email: user.email, role: user.role }
}

export async function register(req: Request, res: Response) {
  const { name, email, password } = req.body
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Meno, email a heslo sú povinné' })
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Heslo musí mať aspoň 8 znakov' })
  }

  const userCount = await User.countDocuments()
  if (userCount > 0) {
    // Checked before the email lookup below so an unauthenticated caller always gets a
    // uniform 403 and can't use the 409/403 split to probe which emails are registered.
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    let requesterRole: string | null = null
    if (token) {
      try {
        requesterRole = (jwt.verify(token, process.env.JWT_SECRET as string) as AuthTokenPayload).role
      } catch {
        // fall through as unauthenticated
      }
    }
    if (requesterRole !== 'admin') {
      return res.status(403).json({ error: 'Nové účty môže vytvárať len administrátor' })
    }
  }

  const existing = await User.findOne({ email: email.toLowerCase() })
  if (existing) return res.status(409).json({ error: 'Email je už zaregistrovaný' })

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.create({ name, email: email.toLowerCase(), passwordHash })

  res.status(201).json({ token: signToken(user), user: publicUser(user) })
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email a heslo sú povinné' })

  const user = await User.findOne({ email: email.toLowerCase() })
  if (!user) return res.status(401).json({ error: 'Nesprávny email alebo heslo' })

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return res.status(401).json({ error: 'Nesprávny email alebo heslo' })

  res.json({ token: signToken(user), user: publicUser(user) })
}

export async function me(req: Request, res: Response) {
  const user = await User.findById(req.user?.sub)
  if (!user) return res.status(404).json({ error: 'Používateľ nenájdený' })
  res.json({ user: publicUser(user) })
}

export async function logout(req: Request, res: Response) {
  await User.findByIdAndUpdate(req.user?.sub, { $inc: { tokenVersion: 1 } })
  res.status(204).end()
}

export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Email je povinný' })

  const genericResponse = { message: 'Ak účet s týmto emailom existuje, poslali sme naň odkaz na obnovenie hesla.' }
  const user = await User.findOne({ email: email.toLowerCase() })

  if (user) {
    const rawToken = crypto.randomBytes(32).toString('hex')
    user.resetPasswordTokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
    user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS)
    await user.save()

    const baseUrl = (process.env.CLIENT_ORIGIN ?? 'http://localhost:5173').split(',')[0].trim()
    const resetUrl = `${baseUrl}/reset-password?token=${rawToken}`
    await sendEmail(
      user.email,
      'B-Trans: obnovenie hesla',
      `<p>Dobrý deň,</p><p>Kliknutím na odkaz nižšie si nastavíte nové heslo. Odkaz je platný 1 hodinu.</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Ak ste o obnovenie hesla nežiadali, tento email môžete ignorovať.</p>`
    )
  }

  res.json(genericResponse)
}

export async function resetPassword(req: Request, res: Response) {
  const { token, password } = req.body
  if (!token || !password) return res.status(400).json({ error: 'Token a heslo sú povinné' })
  if (password.length < 8) return res.status(400).json({ error: 'Heslo musí mať aspoň 8 znakov' })

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  const user = await User.findOne({
    resetPasswordTokenHash: tokenHash,
    resetPasswordExpires: { $gt: new Date() },
  })
  if (!user) return res.status(400).json({ error: 'Odkaz na obnovenie hesla je neplatný alebo vypršal' })

  user.passwordHash = await bcrypt.hash(password, 10)
  user.resetPasswordTokenHash = null
  user.resetPasswordExpires = null
  user.tokenVersion += 1
  await user.save()

  res.json({ token: signToken(user), user: publicUser(user) })
}
