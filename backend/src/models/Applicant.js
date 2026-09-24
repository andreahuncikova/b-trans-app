import mongoose from 'mongoose'

const applicantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
)

export default mongoose.model('Applicant', applicantSchema)
