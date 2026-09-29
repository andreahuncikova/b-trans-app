import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'

const app = createApp()

async function registerAdmin() {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Admin', email: 'admin@example.com', password: 'password123' })
  return res.body.token as string
}

describe('applicants', () => {
  it('lets an unauthenticated visitor submit an application', async () => {
    const res = await request(app)
      .post('/api/applicants')
      .send({ name: 'Ján Nový', phone: '0900123456', email: 'jan@example.com' })

    expect(res.status).toBe(201)
    expect(res.body.name).toBe('Ján Nový')
  })

  it('requires a name', async () => {
    const res = await request(app).post('/api/applicants').send({ phone: '0900123456' })
    expect(res.status).toBe(400)
  })

  it('rejects unauthenticated access to the applicant list', async () => {
    const res = await request(app).get('/api/applicants')
    expect(res.status).toBe(401)
  })

  it('lets an admin list submitted applications', async () => {
    const adminToken = await registerAdmin()
    await request(app).post('/api/applicants').send({ name: 'Ján Nový', phone: '0900123456' })

    const res = await request(app).get('/api/applicants').set('Authorization', `Bearer ${adminToken}`)
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
  })

  it('accepts a base64 PDF as the cv field', async () => {
    const cv = 'data:application/pdf;base64,JVBERi0xLjQK'
    const res = await request(app)
      .post('/api/applicants')
      .send({ name: 'Ján Nový', phone: '0900123456', cv })

    expect(res.status).toBe(201)
    expect(res.body.cv).toBe(cv)
  })

  it('rejects a cv that is not a base64 PDF', async () => {
    const res = await request(app)
      .post('/api/applicants')
      .send({ name: 'Ján Nový', cv: 'data:image/png;base64,abc123' })

    expect(res.status).toBe(400)
  })

  it('rejects unauthenticated deletion', async () => {
    const res = await request(app).delete('/api/applicants/000000000000000000000000')
    expect(res.status).toBe(401)
  })

  it('lets an admin delete an application', async () => {
    const adminToken = await registerAdmin()
    const createRes = await request(app).post('/api/applicants').send({ name: 'Ján Nový' })

    const deleteRes = await request(app)
      .delete(`/api/applicants/${createRes.body._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
    expect(deleteRes.status).toBe(204)

    const listRes = await request(app).get('/api/applicants').set('Authorization', `Bearer ${adminToken}`)
    expect(listRes.body).toHaveLength(0)
  })

  it('returns 404 when deleting an application that does not exist', async () => {
    const adminToken = await registerAdmin()
    const res = await request(app)
      .delete('/api/applicants/000000000000000000000000')
      .set('Authorization', `Bearer ${adminToken}`)
    expect(res.status).toBe(404)
  })
})
