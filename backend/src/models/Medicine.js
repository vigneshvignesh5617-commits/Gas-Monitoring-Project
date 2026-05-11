import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  saltName: { type: String, required: true },
  expiryDate: { type: Date, required: true },
  quantity: { type: Number, required: true },
  medicineType: { type: String, enum: ['Tablet', 'Syrup', 'Capsule', 'Other'], default: 'Tablet' },
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  image: { type: String },
  status: { type: String, default: 'Available' },
  isNGOVerified: { type: Boolean, default: false },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
  
  // Medicine model removed — project converted to Gas monitoring.
  // Keep placeholder to avoid import errors.
  export default {};