import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['user', 'ngo', 'admin'], 
    default: 'user' 
  },
  // Specific for NGOs or Users
  address: { type: String, required: true },
  phone: { type: String, required: true },
  ngoDetails: {
    registrationNumber: { type: String }, // Only for NGOs
    isVerified: { type: Boolean, default: false } // Admin verifies the NGO
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;