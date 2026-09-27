import type { Request, Response } from 'express'
import Applicant from '../models/Applicant.js'

export async function createApplicant(req: Request, res: Response) {
  const { name, phone, email } = req.body
  if (!name) return res.status(400).json({ error: 'name is required' })
  const applicant = await Applicant.create({ name, phone, email })
  res.status(201).json(applicant)
}

export async function listApplicants(_req: Request, res: Response) {
  const applicants = await Applicant.find().sort({ createdAt: -1 })
  res.json(applicants)
}
