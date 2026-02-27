# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- Expo CLI
- Android/iOS device or emulator

### 1. Clone & Install

```bash
# Backend
cd ClockWork/backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Backend

Create `backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/clockwork
JWT_SECRET=your-secret-key-change-this
PORT=3000
```

### 3. Start Backend

```bash
cd backend
node server.js
```

You should see:
```
Server running on port 3000
Platform fee: 10% | Job posting reward: 10 credits
Connected to MongoDB - using real data only
```

### 4. Configure Frontend

Find your computer's IP address:

**Windows**: `ipconfig` → Look for IPv4 Address
**Mac/Linux**: `ifconfig` → Look for inet

Update `frontend/config.js`:
```javascript
export const API_URL = 'http://YOUR_IP:3000/api';
// Example: 'http://192.168.1.100:3000/api'
```

### 5. Start Frontend

```bash
cd frontend
npx expo start
```

Scan QR code with Expo Go app (same WiFi network)

### 6. Test the App

#### First User Registration
1. Open app → Enter phone number (any 10 digits)
2. Click "Send OTP"
3. Check backend console for OTP code
4. Enter OTP → Select "User" role → Login
5. Allow location permissions

#### Post a Job
1. Go to "Post" tab
2. Fill job details
3. Submit → Earn 10 credits!

#### Second User (Worker)
1. Use different phone number
2. Select "Worker" role
3. Apply to jobs from "Search" tab

## 🔍 Troubleshooting

### "Network request failed"
- Check if backend is running
- Verify API_URL has correct IP address
- Ensure phone and computer on same WiFi

### "Cannot connect to MongoDB"
- Start MongoDB: `mongod`
- Or use MongoDB Atlas cloud database

### OTP not working
- Check backend console for OTP code
- OTP expires in 5 minutes
- For production, integrate SMS service

### Location not working
- Grant location permissions
- Enable GPS on device
- Check expo-location is installed

## 📱 App Features

### For Users (Job Posters)
- Post jobs (FREE + earn 10 credits)
- View applicants
- Select workers
- Verify completed work
- Release payment

### For Workers
- Browse nearby jobs
- Apply to jobs
- Chat with users
- Submit work completion
- Receive payment (minus 10% platform fee)

### Credit System
- New users: 100 credits
- Post job: +10 credits
- Complete job: Payment - 10% fee
- Penalties: -25 credits

## 🛠️ Development Tips

### Reset Database
```javascript
// In MongoDB shell or Compass
use clockwork
db.dropDatabase()
```

### View API Logs
Backend logs all requests. Check console for:
- OTP codes
- API calls
- Errors

### Test Different Roles
Use multiple phone numbers to test:
- User posting jobs
- Worker applying
- Job completion flow

### Debug Mode
```bash
# Frontend with detailed logs
npx expo start --dev-client

# Backend with nodemon (auto-restart)
npm install -g nodemon
nodemon server.js
```

## 📚 Key Files

- `backend/server.js` - Main API server
- `frontend/config.js` - API URL configuration
- `frontend/screens/LoginScreen.js` - Authentication
- `frontend/screens/HomeScreen.js` - Map & jobs
- `frontend/screens/PostWorkScreen.js` - Job posting

## 🔐 Security Notes

**Development**:
- OTP logged to console (OK for testing)
- Any phone number works (no validation)

**Production**:
- Integrate real SMS service (MSG91, Twilio)
- Validate phone numbers
- Use HTTPS
- Secure JWT_SECRET

## 📞 Need Help?

1. Check `PRODUCTION_CHECKLIST.md` for deployment
2. Check `CHANGES.md` for recent updates
3. Check `README.md` for full documentation

## 🎯 Next Steps

1. ✅ Test basic flow (register, post job, apply)
2. ✅ Test complete job workflow
3. ✅ Test messaging between users
4. 📱 Integrate SMS service for production
5. 🚀 Deploy to production server
6. 📦 Build APK/IPA for app stores

Happy coding! 🎉
