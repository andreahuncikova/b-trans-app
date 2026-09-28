import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'

const app = createApp()

async function registerAdmin() {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Admin', email: 'admin@example.com', password: 'password123' })
  return res.body.token as string
}

describe('report', () => {
  let adminToken: string
  let driverId: string

  beforeEach(async () => {
    adminToken = await registerAdmin()
    const createRes = await request(app)
      .post('/api/drivers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Jozef', type: 'permanent' })
    driverId = createRes.body._id
  })

  it('rejects unauthenticated access', async () => {
    const res = await request(app).get('/api/report?year=2026&month=1')
    expect(res.status).toBe(401)
  })

  it('requires year and month', async () => {
    const res = await request(app).get('/api/report').set('Authorization', `Bearer ${adminToken}`)
    expect(res.status).toBe(400)
  })

  it('totals stops per driver for the given month', async () => {
    await request(app)
      .put('/api/logstops')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ driver: driverId, date: '2026-01-05', stops: 3 })
    await request(app)
      .put('/api/logstops')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ driver: driverId, date: '2026-01-06', stops: 4 })

    const res = await request(app)
      .get('/api/report?year=2026&month=1')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.status).toBe(200)
    expect(res.body.rows).toHaveLength(1)
    expect(res.body.rows[0].driver.name).toBe('Jozef')
    expect(res.body.rows[0].days).toBe(2)
    expect(res.body.rows[0].stops).toBe(7)
    expect(res.body.totals).toEqual({ days: 2, stops: 7 })
  })
})
