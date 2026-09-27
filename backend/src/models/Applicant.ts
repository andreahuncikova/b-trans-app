import mongoose, { Schema, Document } from 'mongoose'

export interface IApplicant extends Document {
  name: string
  phone: string
  email: string
  createdAt: Date
  updatedAt: Date
}

const applicantSchema = new Schema<IApplicant>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
)

export default mongoose.model<IApplicant>('Applicant', applicantSchema)
