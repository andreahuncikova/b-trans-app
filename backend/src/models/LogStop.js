import mongoose from 'mongoose'

const logStopSchema = new mongoose.Schema(
  {
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
    date: { type: Date, required: true },
    stops: { type: Number, min: 0, default: 0 },
    hours: { type: Number, min: 0, default: null },
  },
  { timestamps: true }
)

logStopSchema.index({ driver: 1, date: 1 }, { unique: true })

export default mongoose.model('LogStop', logStopSchema)
