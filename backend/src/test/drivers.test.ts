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

describe('drivers', () => {
  let adminToken: string

  beforeEach(async () => {
    adminToken = await registerAdmin()
  })

  it('rejects unauthenticated access', async () => {
    const res = await request(app).get('/api/drivers')
    expect(res.status).toBe(401)
  })

  it('lets an admin create and list a driver', async () => {
    const createRes = await request(app)
      .post('/api/drivers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Jozef', type: 'permanent' })
    expect(createRes.status).toBe(201)
    expect(createRes.body.name).toBe('Jozef')

    const listRes = await request(app).get('/api/drivers').set('Authorization', `Bearer ${adminToken}`)
    expect(listRes.status).toBe(200)
    expect(listRes.body).toHaveLength(1)
  })

  it('lets an admin update a driver', async () => {
    const createRes = await request(app)
      .post('/api/drivers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Jozef', type: 'permanent' })

    const updateRes = await request(app)
      .patch(`/api/drivers/${createRes.body._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'inactive' })

    expect(updateRes.status).toBe(200)
    expect(updateRes.body.status).toBe('inactive')
  })

  it('lets an admin delete a driver', async () => {
    const createRes = await request(app)
      .post('/api/drivers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Jozef', type: 'permanent' })

    const deleteRes = await request(app)
      .delete(`/api/drivers/${createRes.body._id}`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(deleteRes.status).toBe(204)
  })

  it('returns 404 when updating a driver that does not exist', async () => {
    const res = await request(app)
      .patch('/api/drivers/000000000000000000000000')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Nová' })

    expect(res.status).toBe(404)
  })
})
