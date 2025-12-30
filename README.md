
# Jakarta Secure Individual

Advanced OSINT & Security Analysis Platform for Indonesian Identity Verification.

## 📦 Repository Structure

```
jakarta-secure-deploy/
├── frontend/           # React + Vite Frontend (Deploy to Vercel)
│   ├── src/
│   ├── public/
│   ├── vercel.json
│   └── README.md
│
└── backend/            # Node.js + Express API (Deploy to Render/Railway)
    ├── models/
    ├── server.js
    ├── bridge.py
    ├── render.yaml
    ├── railway.toml
    └── README.md
```

## 🚀 Quick Deploy

### Frontend (Vercel)
1. Fork this repository
2. Go to [Vercel Dashboard](https://vercel.com/new)
3. Import `frontend` folder
4. Set environment variable: `VITE_API_URL`
5. Deploy!

### Backend (Render.com)
1. Go to [Render Dashboard](https://dashboard.render.com/new)
2. Create new Web Service
3. Connect to `backend` folder
4. Set environment variables (see `.env.example`)
5. Deploy!

## 🔐 Features

- ✅ User Authentication (Login/Register with Roles)
- ✅ NIK Scanner (Indonesian ID Verification)
- ✅ Phone Number Analysis
- ✅ Device Tracking (Jabodetabek Detection)
- ✅ Fraud Detection (IMEI/Phone)
- ✅ ML Security Analysis (DO/DON'T Recommendations)
- ✅ Real-time Notifications with DNS Routing
- ✅ Export Data (JSON/CSV/TXT/Embed Code)
- ✅ Dark/Light Theme
- ✅ Responsive Mobile Design

## 📋 Environment Variables

### Frontend
```
VITE_API_URL=https://your-backend-url.com
```

### Backend
```
MONGO_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
PORT=3001
```

## 📄 License

MIT License - © 2024 Jakarta Secure Individual
