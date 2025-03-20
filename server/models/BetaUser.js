

import mongoose from 'mongoose';

const BetaUserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  otp: { type: String, required: false },
  otpExpiresAt: { type: Date, required: false },
  registeredAt: { type: Date, default: Date.now },
  lastLogin: { type: Date }
});

export default mongoose.model('BetaUser', BetaUserSchema);