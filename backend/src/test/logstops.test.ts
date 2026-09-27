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

async function registerDriver(adminToken: string) {
  const res = await request(app)
    .post('/api/auth/register')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: 'Driver', email: 'driver@example.com', password: 'password123' })
  return res.body.token as string
}

describe('logstops', () => {
  let adminToken: string
  let driverToken: string
  let driverId: string

  beforeEach(async () => {
    adminToken = await registerAdmin()
    driverToken = await registerDriver(adminToken)
    const createRes = await request(app)
      .post('/api/drivers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Driver', type: 'permanent' })
    driverId = createRes.body._id
  })

  it('blocks a driver-role user from writing a log stop', async () => {
    const res = await request(app)
      .put('/api/logstops')
      .set('Authorization', `Bearer ${driverToken}`)
      .send({ driver: driverId, date: '2026-01-05', stops: 3 })

    expect(res.status).toBe(403)
  })

  it('lets an admin create a log stop and populates the driver name when listing', async () => {
    const putRes = await request(app)
      .put('/api/logstops')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ driver: driverId, date: '2026-01-05', stops: 3 })
    expect(putRes.status).toBe(200)

    const listRes = await request(app)
      .get('/api/logstops?year=2026&month=1')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(listRes.status).toBe(200)
    expect(listRes.body).toHaveLength(1)
    expect(listRes.body[0].driver.name).toBe('Driver')
  })

  it('lets an admin delete a log stop', async () => {
    const putRes = await request(app)
      .put('/api/logstops')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ driver: driverId, date: '2026-01-05', stops: 3 })

    const deleteRes = await request(app)
      .delete(`/api/logstops/${putRes.body._id}`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(deleteRes.status).toBe(204)
  })
})
