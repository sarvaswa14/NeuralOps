const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, default: 'User' },
    email: { type: String, unique: true, sparse: true, lowercase: true },
    passwordHash: { type: String },
    role: { type: String, enum: ['admin', 'viewer'], default: 'viewer' },
    createdAt: { type: Date, default: Date.now },
    googleId: { type: String },
    githubId: { type: String },
})

module.exports = mongoose.models.User || mongoose.model('User', userSchema)