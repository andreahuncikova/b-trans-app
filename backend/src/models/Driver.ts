import mongoose, { Schema, Document } from 'mongoose'

export interface IDriver extends Document {
  name: string
  role: string
  type: 'permanent' | 'substitute'
  status: 'active' | 'inactive'
  createdAt: Date
  updatedAt: Date
}

const driverSchema = new Schema<IDriver>(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, trim: true, default: '' },
    type: { type: String, enum: ['permanent', 'substitute'], default: 'permanent' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
)

export default mongoose.model<IDriver>('Driver', driverSchema)
