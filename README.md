<div align="center">

# ⏰ ClockWork

### *Find Local Work. Get It Done.*

[![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-~54.0-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**A production-ready mobile platform connecting users with local blue-collar workers in Coimbatore, India**

[Features](#-features) • [Quick Start](#-quick-start) • [Tech Stack](#-tech-stack) • [API Docs](#-api-endpoints) • [Contributing](#-contributors)

</div>

---

## 📱 About

ClockWork is a gig-economy platform designed for India's blue-collar workforce. Users post jobs, workers apply, and payments are processed through a credit-based system with built-in trust management.

### 🎯 Target Audience
- **Users**: Homeowners and businesses in Coimbatore needing quick services
- **Workers**: Plumbers, electricians, cleaners, carpenters, and other skilled workers

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 👤 For Users
- 📝 **Post Jobs** - Earn 10 credits per post (FREE!)
- 🔍 **Browse Workers** - View profiles & ratings
- ✅ **Verify Work** - Approve before payment
- 💬 **Direct Chat** - Message workers
- 📍 **GPS Tracking** - Location-based job posting

</td>
<td width="50%">

### 🔧 For Workers
- 🎯 **Find Jobs** - Apply to nearby opportunities
- 💰 **Earn Money** - Get paid in credits (90% of job value)
- ⭐ **Build Reputation** - Trust score system
- 📊 **Track Stats** - Jobs completed, earnings, ratings
- 🔔 **Notifications** - Real-time job alerts

</td>
</tr>
</table>

### 💳 Credit System
- 🎁 **100 free credits** for new users
- 💵 **Users EARN 10 credits** for posting jobs
- 🏦 **Platform fee: 10%** (workers receive 90%)
- ⚖️ **Penalty system** for violations (25 credits)
- 📈 **Credit score** tracks reliability (0-100)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Expo Go app on your phone
- Same WiFi network for testing

### 1️⃣ Backend Setup

```bash
cd backend
npm install

# Create .env file
echo "MONGODB_URI=mongodb://localhost:27017/testdb3
JWT_SECRET=your-secret-key-here
DEV_MODE=true
PORT=3000" > .env

# Start server
node server.js
```

### 2️⃣ Frontend Setup

```bash
cd frontend
npm install

# Find your IP address
# Windows: ipconfig
# Mac/Linux: ifconfig

# Update config.js with your IP
echo "export const API_URL = 'http://YOUR_IP:3000/api';" > config.js

# Start Expo
npx expo start
```

### 3️⃣ Run on Phone
1. Install **Expo Go** from Play Store/App Store
2. Scan QR code from terminal
3. Login with any 10-digit phone number
4. Select role: **User** or **Worker**

> **Note**: DEV_MODE=true bypasses OTP verification for demo purposes

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React Native 0.81 with Expo ~54.0
- **Navigation**: React Navigation 6
- **Maps**: react-native-maps + expo-location
- **Storage**: AsyncStorage
- **UI**: Custom components with native styling

### Backend
- **Runtime**: Node.js with Express 5
- **Database**: MongoDB with Mongoose
- **Auth**: JWT + OTP verification
- **Real-time**: REST API (Socket.IO removed)

---

## 📡 API Endpoints

### 🔐 Authentication
```
POST   /api/auth/send-otp          Send OTP to phone
POST   /api/auth/verify-otp        Verify OTP & login
POST   /api/user/set-role          Set USER/WORKER role
GET    /api/auth/validate          Validate JWT token
PUT    /api/user/profile           Update profile
```

### 💼 Jobs
```
GET    /api/jobs                   List all jobs
GET    /api/jobs/my-jobs           User's posted jobs
GET    /api/jobs/:id               Job details
POST   /api/jobs                   Create job (+10 credits)
POST   /api/jobs/:id/apply         Apply for job
POST   /api/jobs/:id/select-worker Select applicant
POST   /api/jobs/:id/start-work    Start work
POST   /api/jobs/:id/submit-completion Submit proof
POST   /api/jobs/:id/verify        Verify & release payment
```

### 📋 Applications & Workers
```
GET    /api/applications           Worker's applications
GET    /api/jobs/:id/applications  Job applicants
GET    /api/worker/profile         Worker profile
PUT    /api/worker/profile         Update profile
```

### 💰 Credits & Notifications
```
GET    /api/credits                Balance & transactions
POST   /api/credits/top-up         Add credits
GET    /api/notifications          Get notifications
PUT    /api/notifications/read-all Mark all read
```

### 💬 Messaging
```
GET    /api/chats                  All chats
POST   /api/chats                  Create chat
GET    /api/chats/:id/messages     Get messages
POST   /api/chats/:id/messages     Send message
GET    /api/chats/job/:jobId       Job-specific chat
```

### ⚖️ Penalties & Disputes
```
POST   /api/penalty/report         Report violation
GET    /api/penalties              User penalties
POST   /api/disputes               Raise dispute
GET    /api/disputes               Get disputes
```

---

## 📂 Project Structure

```
ClockWork/
├── backend/
│   ├── server.js           # Express server + all routes
│   ├── .env                # Environment variables
│   └── package.json
├── frontend/
│   ├── screens/            # All app screens
│   ├── navigation/         # Tab & stack navigators
│   ├── services/           # API service layer
│   ├── utils/              # Helper functions
│   ├── config.js           # API URL configuration
│   └── App.js              # Root component
├── docs/
│   ├── TRUST_SYSTEM.md     # Trust system documentation
│   └── LOGICAL_ISSUES.md   # Known issues & fixes
└── README.md
```

---

## 🎨 Screenshots

<div align="center">

| Home Screen | Job Details | Post Job | Worker Profile |
|------------|-------------|----------|----------------|
| 🏠 Browse jobs | 📋 View details | ➕ Create job | 👷 Stats & ratings |

</div>

---

## 🔧 Configuration

### Environment Variables (.env)
```env
MONGODB_URI=mongodb://localhost:27017/testdb3
JWT_SECRET=your-secret-key-change-in-production
DEV_MODE=true
PORT=3000
INITIAL_CREDITS=100
JOB_POSTING_REWARD=10
PLATFORM_FEE_PERCENTAGE=10
PENALTY_AMOUNT=25
```

### Frontend Config (config.js)
```javascript
export const API_URL = 'http://YOUR_IP_ADDRESS:3000/api';
```

---

## 🐛 Known Issues

See [COMPLETE_LOGICAL_ISSUES.md](COMPLETE_LOGICAL_ISSUES.md) for detailed analysis of 30 identified issues:
- 🔴 10 Critical issues
- 🟡 10 Medium issues  
- 🟢 10 Minor issues

---

## 🗺️ Roadmap

- [ ] Implement full trust system (violations, strikes, suspensions)
- [ ] Add image upload for job posts & completion proof
- [ ] Build chat UI (backend ready)
- [ ] Add Tamil language support
- [ ] Implement push notifications
- [ ] Add payment gateway integration
- [ ] Create admin dashboard
- [ ] Add job categories filtering
- [ ] Implement worker availability calendar
- [ ] Add dispute resolution workflow

---

## 🤝 Contributors

[![Contributors](https://contrib.rocks/image?repo=Amanps1/ClockWork)](https://github.com/Amanps1/ClockWork/graphs/contributors)

Made with ❤️ by the ClockWork team

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support

- 🐛 Issues: [GitHub Issues](https://github.com/Amanps1/ClockWork/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/Amanps1/ClockWork/discussions)

---

<div align="center">

**⭐ Star this repo if you find it useful!**

Made for India's blue-collar workforce 🇮🇳

</div>
