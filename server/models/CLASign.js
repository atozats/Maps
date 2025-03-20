import mongoose from 'mongoose';

const CLASignSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    signedAt: { type: Date, default: Date.now }
});

export default mongoose.model('CLASign', CLASignSchema);
