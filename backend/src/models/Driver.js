import mongoose from 'mongoose'

const driverSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, trim: true, default: '' },
    type: { type: String, enum: ['permanent', 'substitute'], default: 'permanent' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
)

export default mongoose.model('Driver', driverSchema)
