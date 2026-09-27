import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  passwordHash: string
  role: 'admin' | 'driver'
  driver: Types.ObjectId | null
  tokenVersion: number
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'driver'], default: 'driver' },
    driver: { type: Schema.Types.ObjectId, ref: 'Driver', default: null },
    tokenVersion: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export default mongoose.model<IUser>('User', userSchema)
