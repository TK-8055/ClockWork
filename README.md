# ClockWork - Quick Worker App

A production-ready mobile app for connecting users who need work done with local workers in India.

## Features

- **OTP Authentication**: Secure phone-based login with role selection (User/Worker)
- **Job Posting**: Post jobs and find local workers
- **Credit System**: 
  - New users get 100 free credits
  - Users EARN 10 credits for posting jobs (FREE to post!)
  - Workers receive payment minus 10% platform fee
  - Platform profits from convenience fee
- **Penalty System**:
  - False work reports: 25 credit penalty
  - Credit score tracks reliability (0-100)
- **Job Verification**: Users verify completed work before payment
- **Real-time Messaging**: Chat between users and workers
- **Map Integration**: GPS-based job location tracking
- **Worker Selection**: Users choose from applicants
- **Dispute Resolution**: Built-in dispute management

## Setup

### Backend

```bash
cd ClockWork/backend
npm install
# Create .env file
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
node server.js
```

### Frontend (Expo)

```bash
cd ClockWork/frontend
npm install
npx expo start
```

## Network Access (Important!)

### Finding Your Computer's IP Address

**Windows:**
```cmd
ipconfig
```
Look for "IPv4 Address" under your active network adapter (e.g., 192.168.1.100)

**Mac/Linux:**
```bash
ifconfig
```
Look for "inet" under your active network adapter (e.g., 192.168.1.100)

### Updating API URL

Edit `ClockWork/frontend/config.js`:
```javascript
export const API_URL = 'http://YOUR_IP_ADDRESS:3000/api';
```

Replace `YOUR_IP_ADDRESS` with your computer's IP address.

### Running on Same Network

1. Start backend: `node server.js`
2. Update config.js with your IP
3. Start Expo: `npx expo start`
4. Scan QR code with your phone (same WiFi)

### Port Forwarding (For Remote Access)

If you want to access from outside your local network:
- Set up port forwarding on your router
- Or use ngrok: `ngrok http 3000`

## Tech Stack

- **Backend**: Node.js, Express, MongoDB
- **Frontend**: React Native (Expo)
- **Authentication**: JWT with OTP verification
- **Maps**: react-native-maps with expo-location

## Production Ready

✅ No fake/seed data - uses real user data only
✅ OTP authentication enabled
✅ Complete job lifecycle (post → apply → select → complete → verify → payment)
✅ Credit system with platform fee (10%)
✅ Messaging/chat system
✅ Penalty and dispute management
✅ GPS location tracking

## API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to phone
- `POST /api/auth/verify-otp` - Verify OTP & login
- `POST /api/user/set-role` - Set user role (USER/WORKER)
- `GET /api/auth/validate` - Validate JWT token

### Jobs
- `GET /api/jobs` - List jobs
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs` - Create job (earn 10 credits!)
- `POST /api/jobs/:id/apply` - Apply for job
- `POST /api/jobs/:id/select-worker` - Select worker from applicants
- `POST /api/jobs/:id/start-work` - Start work
- `POST /api/jobs/:id/submit-completion` - Submit completed work
- `POST /api/jobs/:id/verify` - Verify job completion & release payment

### Applications
- `GET /api/applications` - Get user's applications
- `GET /api/jobs/:id/applications` - Get job applicants

### Worker Profile
- `GET /api/worker/profile` - Get worker profile
- `PUT /api/worker/profile` - Update worker profile

### Credits
- `GET /api/credits` - Get credit balance & transactions

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read

### Messaging
- `GET /api/chats` - Get all chats
- `POST /api/chats` - Create chat
- `GET /api/chats/:chatId/messages` - Get messages
- `POST /api/chats/:chatId/messages` - Send message
- `GET /api/chats/job/:jobId` - Get chat for specific job

### Penalties & Disputes
- `POST /api/penalty/report` - Report penalty
- `POST /api/disputes` - Raise dispute
- `GET /api/disputes` - Get disputes