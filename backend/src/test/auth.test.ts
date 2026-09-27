import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'

const app = createApp()

describe('auth', () => {
  it('first registered user becomes admin and can log in', async () => {
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Admin', email: 'admin@example.com', password: 'password123' })

    expect(registerRes.status).toBe(201)
    expect(registerRes.body.user.role).toBe('admin')
    expect(registerRes.body.token).toBeTruthy()

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'password123' })

    expect(loginRes.status).toBe(200)
    expect(loginRes.body.user.email).toBe('admin@example.com')
  })

  it('rejects login with wrong password', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Admin', email: 'admin@example.com', password: 'password123' })

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'wrong-password' })

    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Nesprávny email alebo heslo')
  })

  it('blocks anonymous registration once an admin exists, regardless of whether the email is taken', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Admin', email: 'admin@example.com', password: 'password123' })

    const existingEmailRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'X', email: 'admin@example.com', password: 'password123' })
    const newEmailRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'X', email: 'someone-new@example.com', password: 'password123' })

    expect(existingEmailRes.status).toBe(403)
    expect(newEmailRes.status).toBe(403)
  })

  it('lets an admin token create a second (driver) account', async () => {
    const { body } = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Admin', email: 'admin@example.com', password: 'password123' })

    const res = await request(app)
      .post('/api/auth/register')
      .set('Authorization', `Bearer ${body.token}`)
      .send({ name: 'Driver One', email: 'driver@example.com', password: 'password123' })

    expect(res.status).toBe(201)
    expect(res.body.user.role).toBe('driver')
  })

  it('requires a token for /me', async () => {
    const res = await request(app).get('/api/auth/me')
    expect(res.status).toBe(401)
  })

  it('invalidates the token server-side on logout', async () => {
    const { body } = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Admin', email: 'admin@example.com', password: 'password123' })
    const token = body.token

    const meBefore = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`)
    expect(meBefore.status).toBe(200)

    const logoutRes = await request(app).post('/api/auth/logout').set('Authorization', `Bearer ${token}`)
    expect(logoutRes.status).toBe(204)

    const meAfter = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`)
    expect(meAfter.status).toBe(401)
  })
})
