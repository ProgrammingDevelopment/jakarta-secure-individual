
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { spawn } = require('child_process');
const path = require('path');
const User = require('./models/User');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'pegasus-secret-key-change-me';

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
// Note: User needs to provide password in .env or connection string
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://user0:REPLACE_WITH_PASSWORD@digitalprintcluster.lkktxl7.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// --- Authentication Routes ---

app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password, role } = req.body;
        if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ error: 'Username already exists' });

        const userRole = role && ['user', 'client', 'staff'].includes(role) ? role : 'user';

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword, role: userRole });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Registration failed', details: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        // Include role in token
        const token = jwt.sign(
            { id: user._id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '1h' }
        );
        res.json({ token, username: user.username, role: user.role });
    } catch (err) {
        res.status(500).json({ error: 'Login failed', details: err.message });
    }
});

// Middleware to verify Token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// --- Tool Routes ---

const ScanLog = require('./models/ScanLog');

const runPythonBridge = (command, payload, res, req) => {
    const scriptPath = path.join(__dirname, 'bridge.py');
    const inputJson = JSON.stringify({ command, payload });
    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';

    const pyProcess = spawn(pythonCmd, [scriptPath, inputJson]);

    let dataString = '';
    let errorString = '';

    pyProcess.stdout.on('data', (data) => {
        dataString += data.toString();
    });

    pyProcess.stderr.on('data', (data) => {
        errorString += data.toString();
    });

    pyProcess.on('close', async (code) => {
        if (code !== 0) {
            console.error(`Python Error (${code}):`, errorString);
            return res.status(500).json({ error: 'Processing failed', details: errorString });
        }
        try {
            const lines = dataString.trim().split('\n');
            let jsonResult = null;
            for (let i = lines.length - 1; i >= 0; i--) {
                try {
                    const parsed = JSON.parse(lines[i]);
                    // Heuristics to identify valid result json
                    if (parsed && (parsed.target || parsed.nik || parsed.phone_number || parsed.imei || parsed.error || parsed.ml_analysis || parsed.status)) {
                        jsonResult = parsed;
                        break;
                    }
                } catch (e) { }
            }

            if (!jsonResult) {
                try { jsonResult = JSON.parse(dataString); } catch (e) { jsonResult = { raw_output: dataString } }
            }

            res.json(jsonResult);

            // --- REAL-TIME LOGGING TO CLUSTER ---
            if (req && req.user) {
                try {
                    let target = '';
                    if (payload.nik) target = payload.nik;
                    else if (payload.phone) target = payload.phone;
                    else if (payload.imei) target = payload.imei;
                    else if (payload.name) target = payload.name;

                    const newLog = new ScanLog({
                        userId: req.user.id,
                        username: req.user.username,
                        toolType: command,
                        target: target,
                        result: jsonResult
                    });

                    await newLog.save();
                    console.log(`[LOG] Saved ${command} execution for user ${req.user.username} to MongoDB Cluster`);
                } catch (logErr) {
                    console.error('[LOG ERROR] Failed to save log to cluster:', logErr);
                }
            }

        } catch (e) {
            console.error(e);
            res.json({ error: 'Failed to parse output', raw: dataString });
        }
    });
};

// Tool Endpoints (Protected)

app.post('/api/tools/nik', authenticateToken, (req, res) => {
    runPythonBridge('analyze_nik', { nik: req.body.nik }, res, req);
});

app.post('/api/tools/slik', authenticateToken, (req, res) => {
    runPythonBridge('check_slik', { nik: req.body.nik }, res, req);
});

app.post('/api/tools/phone', authenticateToken, (req, res) => {
    runPythonBridge('analyze_phone', { phone: req.body.phone }, res, req);
});

app.post('/api/tools/fraud/imei', authenticateToken, (req, res) => {
    runPythonBridge('fraud_check_imei', { imei: req.body.imei }, res, req);
});

app.post('/api/tools/fraud/phone', authenticateToken, (req, res) => {
    runPythonBridge('fraud_check_phone', { phone: req.body.phone }, res, req);
});

app.post('/api/tools/persona', authenticateToken, (req, res) => {
    runPythonBridge('analyze_persona', req.body, res, req);
});

app.post('/api/tools/track', authenticateToken, (req, res) => {
    runPythonBridge('track_device', { phone: req.body.phone }, res, req);
});

app.get('/', (req, res) => {
    res.send({ status: 'Pegasus Backend (Auth + Tools) Running' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
