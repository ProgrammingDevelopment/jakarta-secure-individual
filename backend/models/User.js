
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // Role can be 'user' (Internal Staff) or 'client' (External Customer)
    role: {
        type: String,
        enum: ['user', 'client', 'admin', 'staff'],
        default: 'user'
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
