import mongoose, { Schema, Document, Types } from 'mongoose'

export interface ILogStop extends Document {
  driver: Types.ObjectId
  date: Date
  stops: number
  hours: number | null
  createdAt: Date
  updatedAt: Date
}

const logStopSchema = new Schema<ILogStop>(
  {
    driver: { type: Schema.Types.ObjectId, ref: 'Driver', required: true },
    date: { type: Date, required: true },
    stops: { type: Number, min: 0, default: 0 },
    hours: { type: Number, min: 0, default: null },
  },
  { timestamps: true }
)

logStopSchema.index({ driver: 1, date: 1 }, { unique: true })

export default mongoose.model<ILogStop>('LogStop', logStopSchema)
