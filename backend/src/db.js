import dns from 'node:dns'
import mongoose from 'mongoose'

// Some local DNS proxies (VPN clients, antivirus) refuse SRV lookups needed by
// mongodb+srv:// URIs even though normal A/AAAA lookups work. Fall back to a
// public resolver so the srv record for Atlas can be found.
dns.setServers(['8.8.8.8', '1.1.1.1', ...dns.getServers()])

export async function connectDB() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not set')
  await mongoose.connect(uri)
  console.log('MongoDB connected')
}
