
# Jakarta Secure Individual - Backend API

Node.js + Express backend with MongoDB integration.

## Deploy Options

### Option 1: Render.com
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

### Option 2: Railway.app
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)

## Environment Variables

Set these in your deployment platform:

```
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/
JWT_SECRET=your-secure-secret-key
PORT=3001
```

## Local Development

```bash
npm install
node server.js
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Tools (Protected - Requires JWT)
- `POST /api/tools/nik` - NIK Analysis
- `POST /api/tools/phone` - Phone Analysis
- `POST /api/tools/fraud/imei` - IMEI Fraud Check
- `POST /api/tools/fraud/phone` - Phone Fraud Analysis
- `POST /api/tools/persona` - Full Persona Analysis
- `POST /api/tools/track` - Device Tracking

## Database

Uses MongoDB Atlas. All scan results are logged to `ScanLog` collection.

## Security

- JWT Authentication
- Password hashing with bcrypt
- CORS enabled
- Role-based access (user, staff, client, admin)
