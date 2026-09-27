import jwt from 'jsonwebtoken'
import type { NextFunction, Request, Response } from 'express'
import User from '../models/User.js'

export interface AuthTokenPayload {
  sub: string
  role: 'admin' | 'driver'
  name: string
  tokenVersion?: number
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Chýba prihlasovací token' })

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as AuthTokenPayload
    const user = await User.findById(payload.sub).select('tokenVersion')
    if (!user || (user.tokenVersion ?? 0) !== (payload.tokenVersion ?? 0)) {
      return res.status(401).json({ error: 'Neplatný alebo vypršaný token' })
    }
    req.user = payload
    next()
  } catch {
    return res.status(401).json({ error: 'Neplatný alebo vypršaný token' })
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Vyžaduje sa prístup administrátora' })
  next()
}
