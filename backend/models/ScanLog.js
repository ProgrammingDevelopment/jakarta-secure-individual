
const mongoose = require('mongoose');

const ScanLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    toolType: { type: String, required: true }, // e.g., 'NIK Analysis', 'Phone Fraud'
    target: { type: String }, // The input (phone number, nik, etc.)
    result: { type: Object }, // The full JSON output from Python
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ScanLog', ScanLogSchema);
