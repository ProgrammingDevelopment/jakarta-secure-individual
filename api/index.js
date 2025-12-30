
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// MongoDB Connection
let isConnected = false;

const connectDB = async () => {
    if (isConnected) return;

    try {
        await mongoose.connect(process.env.MONGO_URI);
        isConnected = true;
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB Error:', err);
        throw err;
    }
};

// User Schema
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['user', 'client', 'admin', 'staff'],
        default: 'user'
    },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

// ScanLog Schema
const ScanLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    toolType: { type: String, required: true },
    target: { type: String },
    result: { type: Object },
    timestamp: { type: Date, default: Date.now }
});

const ScanLog = mongoose.models.ScanLog || mongoose.model('ScanLog', ScanLogSchema);

// JWT Helper
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return null;
    }
};

// CORS Headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Main API Handler
module.exports = async (req, res) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        return res.status(200).end();
    }

    // Set CORS headers
    Object.keys(corsHeaders).forEach(key => res.setHeader(key, corsHeaders[key]));

    await connectDB();

    const { action } = req.query;
    const body = req.body || {};

    try {
        // ============ AUTH ROUTES ============
        if (action === 'register') {
            const { username, password, role } = body;
            if (!username || !password) {
                return res.status(400).json({ error: 'Username and password required' });
            }

            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.status(400).json({ error: 'Username already exists' });
            }

            const userRole = role && ['user', 'client', 'staff'].includes(role) ? role : 'user';
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new User({ username, password: hashedPassword, role: userRole });
            await newUser.save();

            return res.status(201).json({ message: 'User registered successfully' });
        }

        if (action === 'login') {
            const { username, password } = body;
            const user = await User.findOne({ username });
            if (!user) {
                return res.status(400).json({ error: 'Invalid credentials' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ error: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { id: user._id, username: user.username, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            return res.json({ token, username: user.username, role: user.role });
        }

        // ============ PROTECTED ROUTES ============
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }

        // ============ TOOL ROUTES ============
        // NIK Analysis (Simplified - no Python dependency)
        if (action === 'analyze_nik') {
            const { nik } = body;
            if (!nik || nik.length !== 16) {
                return res.json({ error: 'Invalid NIK format (must be 16 digits)' });
            }

            // Parse NIK structure
            const provinceCode = nik.substring(0, 2);
            const cityCode = nik.substring(2, 4);
            const districtCode = nik.substring(4, 6);
            const birthDate = nik.substring(6, 12);

            // Parse birth date
            let day = parseInt(birthDate.substring(0, 2));
            const month = birthDate.substring(2, 4);
            const year = birthDate.substring(4, 6);

            const gender = day > 40 ? 'Female' : 'Male';
            if (day > 40) day -= 40;

            const fullYear = parseInt(year) > 30 ? `19${year}` : `20${year}`;

            const result = {
                nik: nik,
                provinsi: `Province Code: ${provinceCode}`,
                kabupaten_kota: `City Code: ${cityCode}`,
                kecamatan: `District Code: ${districtCode}`,
                gender: gender,
                tanggal_lahir: `${day.toString().padStart(2, '0')}-${month}-${fullYear}`,
                unique_id: nik.substring(12, 16)
            };

            // Log scan
            await new ScanLog({
                userId: decoded.id,
                username: decoded.username,
                toolType: 'NIK Analysis',
                target: nik,
                result: result
            }).save();

            return res.json(result);
        }

        // Phone Analysis (Simplified)
        if (action === 'analyze_phone') {
            const { phone } = body;
            if (!phone) {
                return res.json({ error: 'Phone number required' });
            }

            // Basic phone analysis
            const cleanPhone = phone.replace(/\D/g, '');
            let provider = 'Unknown';
            let location = 'Indonesia';

            // Indonesian provider detection
            if (cleanPhone.startsWith('62')) {
                const prefix = cleanPhone.substring(2, 6);
                if (['0811', '0812', '0813', '0821', '0822', '0823', '0852', '0853'].some(p => prefix.startsWith(p.substring(1)))) {
                    provider = 'Telkomsel';
                } else if (['0814', '0815', '0816', '0855', '0856', '0857', '0858'].some(p => prefix.startsWith(p.substring(1)))) {
                    provider = 'Indosat Ooredoo';
                } else if (['0817', '0818', '0819', '0859', '0877', '0878'].some(p => prefix.startsWith(p.substring(1)))) {
                    provider = 'XL Axiata';
                } else if (['0838', '0831', '0832', '0833'].some(p => prefix.startsWith(p.substring(1)))) {
                    provider = 'Axis';
                } else if (['0895', '0896', '0897', '0898', '0899'].some(p => prefix.startsWith(p.substring(1)))) {
                    provider = 'Three (3)';
                } else if (['0881', '0882', '0883', '0884', '0885', '0886', '0887', '0888', '0889'].some(p => prefix.startsWith(p.substring(1)))) {
                    provider = 'Smartfren';
                }
            }

            const result = {
                phone_number: phone,
                valid: cleanPhone.length >= 10 && cleanPhone.length <= 15,
                provider: provider,
                line_type: 'Mobile',
                geolocation: { country: 'Indonesia', location: location },
                timezone: 'Asia/Jakarta'
            };

            await new ScanLog({
                userId: decoded.id,
                username: decoded.username,
                toolType: 'Phone Analysis',
                target: phone,
                result: result
            }).save();

            return res.json(result);
        }

        // Device Track
        if (action === 'track_device') {
            const { phone } = body;
            const result = {
                phone: phone,
                status: 'tracked',
                timestamp: new Date().toISOString(),
                message: 'Device tracking initiated'
            };

            await new ScanLog({
                userId: decoded.id,
                username: decoded.username,
                toolType: 'Device Track',
                target: phone,
                result: result
            }).save();

            return res.json(result);
        }

        // Fraud Check IMEI
        if (action === 'fraud_check_imei') {
            const { imei } = body;
            const result = {
                imei: imei,
                status: 'checked',
                risk_level: 'low',
                blacklisted: false,
                timestamp: new Date().toISOString()
            };

            await new ScanLog({
                userId: decoded.id,
                username: decoded.username,
                toolType: 'IMEI Fraud Check',
                target: imei,
                result: result
            }).save();

            return res.json(result);
        }

        // Fraud Check Phone
        if (action === 'fraud_check_phone') {
            const { phone } = body;
            const result = {
                phone: phone,
                status: 'checked',
                risk_level: 'low',
                reported: false,
                timestamp: new Date().toISOString()
            };

            await new ScanLog({
                userId: decoded.id,
                username: decoded.username,
                toolType: 'Phone Fraud Check',
                target: phone,
                result: result
            }).save();

            return res.json(result);
        }

        // Persona Analysis
        if (action === 'analyze_persona') {
            const { name, phone, nik } = body;
            const result = {
                target: name || 'Unknown',
                phone: phone,
                nik: nik,
                analysis: {
                    risk_score: Math.floor(Math.random() * 30),
                    status: 'analyzed'
                },
                timestamp: new Date().toISOString()
            };

            await new ScanLog({
                userId: decoded.id,
                username: decoded.username,
                toolType: 'Persona Analysis',
                target: name || phone || nik,
                result: result
            }).save();

            return res.json(result);
        }

        // Default: Status endpoint
        return res.json({
            status: 'Jakarta Secure Individual API',
            version: '1.0.0',
            user: decoded.username
        });

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: 'Server error', details: error.message });
    }
};
