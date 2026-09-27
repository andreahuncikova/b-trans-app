import 'dotenv/config'
import { createApp } from './app.js'
import { connectDB } from './db.js'

const app = createApp()
const port = process.env.PORT || 4000

connectDB()
  .then(() => {
    app.listen(port, () => console.log(`API listening on http://localhost:${port}`))
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err)
    process.exit(1)
  })
