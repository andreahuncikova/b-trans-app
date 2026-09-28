import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { sendEmail } from '../utils/email.js'

vi.mock('../utils/email.js', () => ({ sendEmail: vi.fn() }))

const app = createApp()

beforeEach(() => {
  vi.mocked(sendEmail).mockClear()
})

function extractResetToken() {
  const html = vi.mocked(sendEmail).mock.calls[0][2]
  return html.match(/token=([a-f0-9]+)/)?.[1]
}

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

  it('lets an admin token create a second admin account', async () => {
    const { body } = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Admin', email: 'admin@example.com', password: 'password123' })

    const res = await request(app)
      .post('/api/auth/register')
      .set('Authorization', `Bearer ${body.token}`)
      .send({ name: 'Second Admin', email: 'second@example.com', password: 'password123' })

    expect(res.status).toBe(201)
    expect(res.body.user.role).toBe('admin')
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

  it('gives a generic response for forgot-password regardless of whether the email exists', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Admin', email: 'admin@example.com', password: 'password123' })

    const known = await request(app).post('/api/auth/forgot-password').send({ email: 'admin@example.com' })
    const unknown = await request(app).post('/api/auth/forgot-password').send({ email: 'nobody@example.com' })

    expect(known.status).toBe(200)
    expect(unknown.status).toBe(200)
    expect(known.body.message).toBe(unknown.body.message)
    expect(sendEmail).toHaveBeenCalledTimes(1)
  })

  it('resets the password with a valid token and invalidates the old session', async () => {
    const { body } = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Admin', email: 'admin@example.com', password: 'password123' })
    const oldToken = body.token

    await request(app).post('/api/auth/forgot-password').send({ email: 'admin@example.com' })
    const resetToken = extractResetToken()

    const resetRes = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: resetToken, password: 'newpassword456' })
    expect(resetRes.status).toBe(200)
    expect(resetRes.body.token).toBeTruthy()

    const oldTokenRes = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${oldToken}`)
    expect(oldTokenRes.status).toBe(401)

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'newpassword456' })
    expect(loginRes.status).toBe(200)
  })

  it('rejects an invalid or expired reset token', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: 'not-a-real-token', password: 'newpassword456' })

    expect(res.status).toBe(400)
  })
})
