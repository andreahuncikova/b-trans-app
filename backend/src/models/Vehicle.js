import mongoose from 'mongoose'

const vehicleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    plate: { type: String, required: true, unique: true, trim: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', default: null },
    lastStk: { type: Date, default: null },
    stkIntervalYears: { type: Number, enum: [1, 2], default: 1 },
    inService: { type: Boolean, default: false },
    serviceReason: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
)

export default mongoose.model('Vehicle', vehicleSchema)
