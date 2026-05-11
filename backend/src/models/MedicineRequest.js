import mongoose from 'mongoose';

const medicineRequestSchema = new mongoose.Schema({
  medicine: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Medicine', 
    required: true 
  },
  requester: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  donor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Accepted', 'Rejected', 'Completed'], 
    default: 'Pending' 
  },
  requestMessage: { 
    type: String, 
    default: '' 
  },
  requestedAt: { 
    type: Date, 
    default: Date.now 
  },
  respondedAt: { 
    type: Date, 
    default: null 
  }
}, { timestamps: true });

// MedicineRequest model removed — placeholder to avoid import errors.
export default {};
