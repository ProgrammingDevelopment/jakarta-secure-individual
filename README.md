
# Jakarta Secure Individual

Unified full-stack deployment on Vercel - Frontend + Serverless API

## 📁 Structure

```
jakarta-secure-deploy/
├── api/                    # Serverless API Functions
│   ├── index.js            # Main API handler
│   └── package.json        # API dependencies
├── frontend/               # React + Vite Frontend
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/                # Legacy (for reference)
├── vercel.json             # Unified Vercel config
└── README.md
```

## 🚀 Deploy to Vercel

### One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ProgrammingDevelopment/jakarta-secure-individual)

### Manual Steps

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Import: `ProgrammingDevelopment/jakarta-secure-individual`
3. **Root Directory**: Leave empty (.)
4. Add Environment Variables:
   - `MONGO_URI` = Your MongoDB connection string
   - `JWT_SECRET` = Your secret key
5. Deploy!

## 🔧 Environment Variables

```
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/
JWT_SECRET=your-secure-secret-key
```

## 📡 API Endpoints

All API calls go to `/api?action=<action_name>`

### Authentication
- `POST /api?action=register` - Register user
- `POST /api?action=login` - Login user

### Protected Tools (Requires Bearer Token)
- `POST /api?action=analyze_nik` - NIK Analysis
- `POST /api?action=analyze_phone` - Phone Analysis
- `POST /api?action=track_device` - Device Tracking
- `POST /api?action=fraud_check_imei` - IMEI Check
- `POST /api?action=fraud_check_phone` - Phone Fraud Check
- `POST /api?action=analyze_persona` - Persona Analysis

## ✨ Features

- 🔐 JWT Authentication
- 📱 Device Tracker (Jabodetabek)
- 🪪 NIK Scanner
- 📞 Phone Analysis
- 🛡️ Fraud Detection
- 🤖 ML Security Analysis
- 📊 Data Export (JSON/CSV/TXT/Embed)
- 🌓 Dark/Light Theme
- 📱 Mobile Responsive

## 📄 License

MIT © 2024 Jakarta Secure Individual
