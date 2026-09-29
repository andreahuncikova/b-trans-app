import type { Request, Response } from 'express'
import Applicant from '../models/Applicant.js'

export async function createApplicant(req: Request, res: Response) {
  const { name, phone, email, cv } = req.body
  if (!name) return res.status(400).json({ error: 'Meno je povinné' })
  if (cv && !/^data:application\/pdf;base64,/.test(cv)) {
    return res.status(400).json({ error: 'Životopis musí byť súbor vo formáte PDF' })
  }
  const applicant = await Applicant.create({ name, phone, email, cv })
  res.status(201).json(applicant)
}

export async function listApplicants(_req: Request, res: Response) {
  const applicants = await Applicant.find().sort({ createdAt: -1 })
  res.json(applicants)
}

export async function deleteApplicant(req: Request, res: Response) {
  const applicant = await Applicant.findByIdAndDelete(req.params.id)
  if (!applicant) return res.status(404).json({ error: 'Žiadosť nenájdená' })
  res.status(204).end()
}
