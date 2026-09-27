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

describe('vehicles', () => {
  let adminToken: string
  let driverToken: string

  beforeEach(async () => {
    adminToken = await registerAdmin()
    driverToken = await registerDriver(adminToken)
  })

  it('rejects unauthenticated access', async () => {
    const res = await request(app).get('/api/vehicles')
    expect(res.status).toBe(401)
  })

  it('lets an admin create a vehicle', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Dodávka 1', plate: 'PB-123XX' })

    expect(res.status).toBe(201)
    expect(res.body.name).toBe('Dodávka 1')
  })

  it('blocks a driver-role user from creating a vehicle', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${driverToken}`)
      .send({ name: 'Dodávka 1', plate: 'PB-123XX' })

    expect(res.status).toBe(403)
  })

  it('lets a driver-role user list vehicles', async () => {
    await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Dodávka 1', plate: 'PB-123XX' })

    const res = await request(app).get('/api/vehicles').set('Authorization', `Bearer ${driverToken}`)
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
  })

  it('returns 404 when updating a vehicle that does not exist', async () => {
    const res = await request(app)
      .patch('/api/vehicles/000000000000000000000000')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Nová' })

    expect(res.status).toBe(404)
  })
})
