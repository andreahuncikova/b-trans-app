import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IVehicle extends Document {
  name: string
  plate: string
  driver: Types.ObjectId | null
  lastStk: Date | null
  stkIntervalYears: 1 | 2
  inService: boolean
  serviceReason: string
  createdAt: Date
  updatedAt: Date
}

const vehicleSchema = new Schema<IVehicle>(
  {
    name: { type: String, required: true, trim: true },
    plate: { type: String, required: true, unique: true, trim: true },
    driver: { type: Schema.Types.ObjectId, ref: 'Driver', default: null },
    lastStk: { type: Date, default: null },
    stkIntervalYears: { type: Number, enum: [1, 2], default: 1 },
    inService: { type: Boolean, default: false },
    serviceReason: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
)

export default mongoose.model<IVehicle>('Vehicle', vehicleSchema)
