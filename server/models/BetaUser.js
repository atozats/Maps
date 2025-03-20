import mongoose from 'mongoose';

const BetaUserSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  otp: { type: String, required: false },
  otpExpiresAt: { type: Date, required: false },
});

export default mongoose.model('BetaUser', BetaUserSchema);
