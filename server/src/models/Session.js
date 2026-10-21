import mongoose from "mongoose";

const sesionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    refreshToken: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true }
}, { timestamps: true });

// auto xóa khi hết hạn
sesionSchema.index({expiresAt: 1}, {expireAfterSeconds: 0});

export default mongoose.model('Session', sesionSchema);