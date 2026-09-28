import type { Request, Response } from 'express'
import Vehicle from '../models/Vehicle.js'
import { sendEmail } from '../utils/email.js'

const SOON_DAYS = 30

function nextStk(lastStk: Date | null, years: number) {
  if (!lastStk) return null
  const d = new Date(lastStk)
  d.setFullYear(d.getFullYear() + years)
  return d
}

function vignetteExpiry(purchasedAt: Date | null, days: number) {
  if (!purchasedAt) return null
  const d = new Date(purchasedAt)
  d.setDate(d.getDate() + days)
  return d
}

function daysUntil(date: Date | null) {
  if (!date) return null
  return Math.ceil((date.getTime() - Date.now()) / 86400000)
}

export async function listVehicles(_req: Request, res: Response) {
  const vehicles = await Vehicle.find().populate('driver', 'name').sort({ createdAt: 1 })
  res.json(vehicles)
}

export async function createVehicle(req: Request, res: Response) {
  const { name, plate, driver, lastStk, stkIntervalYears, photo, vignettePurchasedAt, vignetteIntervalDays } = req.body
  if (!name || !plate) return res.status(400).json({ error: 'Názov a ŠPZ sú povinné' })
  const vehicle = await Vehicle.create({
    name,
    plate,
    driver,
    lastStk,
    stkIntervalYears,
    photo,
    vignettePurchasedAt,
    vignetteIntervalDays,
  })
  res.status(201).json(vehicle)
}

export async function updateVehicle(req: Request, res: Response) {
  const {
    name,
    plate,
    driver,
    lastStk,
    stkIntervalYears,
    inService,
    serviceReason,
    photo,
    vignettePurchasedAt,
    vignetteIntervalDays,
  } = req.body
  const vehicle = await Vehicle.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        name,
        plate,
        driver,
        lastStk,
        stkIntervalYears,
        inService,
        serviceReason,
        photo,
        vignettePurchasedAt,
        vignetteIntervalDays,
      },
    },
    { new: true, runValidators: true, omitUndefined: true }
  )
  if (!vehicle) return res.status(404).json({ error: 'Vozidlo nenájdené' })
  res.json(vehicle)
}

export async function deleteVehicle(req: Request, res: Response) {
  const vehicle = await Vehicle.findByIdAndDelete(req.params.id)
  if (!vehicle) return res.status(404).json({ error: 'Vozidlo nenájdené' })
  res.status(204).end()
}

export async function checkReminders(_req: Request, res: Response) {
  const vehicles = await Vehicle.find()
  const lines: string[] = []

  for (const v of vehicles) {
    const stkDate = nextStk(v.lastStk, v.stkIntervalYears)
    const stkDays = daysUntil(stkDate)
    if (stkDays !== null && stkDays <= SOON_DAYS) {
      const when = stkDays < 0 ? 'po termíne' : `o ${stkDays} dní`
      lines.push(`${v.name} (${v.plate}): STK ${when} – ${stkDate!.toLocaleDateString('sk-SK')}`)
    }

    const vignetteDate = vignetteExpiry(v.vignettePurchasedAt, v.vignetteIntervalDays)
    const vignetteDays = daysUntil(vignetteDate)
    if (vignetteDays !== null && vignetteDays <= SOON_DAYS) {
      const when = vignetteDays < 0 ? 'po termíne' : `o ${vignetteDays} dní`
      lines.push(`${v.name} (${v.plate}): Diaľničná známka ${when} – ${vignetteDate!.toLocaleDateString('sk-SK')}`)
    }
  }

  const to = process.env.REMINDER_EMAIL_TO
  if (lines.length === 0 || !to) {
    res.json({ sent: false })
    return
  }

  await sendEmail(
    to,
    'B-Trans: blížiace sa termíny STK / diaľničných známok',
    lines.map((l) => `<p>${l}</p>`).join('')
  )
  res.json({ sent: true, count: lines.length })
}
