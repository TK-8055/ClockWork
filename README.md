# Quick Worker 🚀

A React Native mobile application for connecting blue-collar workers with customers in India. Built for daily wage workers in Coimbatore, Tamil Nadu.

## 📱 Features

- **Map-First Design**: Uber-style interface with job pins on map
- **Real-time Job Listings**: Browse nearby jobs with GPS location
- **OTP Authentication**: Secure phone-based login
- **Dual Roles**: User (post jobs) and Worker (apply to jobs)
- **Job Categories**: Plumbing, Electrical, Cleaning, Carpentry, Painting, Cooking, Mechanic, AC Repair
- **Application Tracking**: View applied and completed jobs
- **Worker Profiles**: Skills, ratings, earnings, and availability status
- **Indian Rupees (₹)**: Local currency support

## 🛠️ Tech Stack

### Frontend
- React Native
- Expo
- React Navigation
- React Native Maps
- Expo Location
- AsyncStorage

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs

## 📂 Project Structure

```
cap/
├── ClockWork/
│   ├── frontend/          # React Native app
│   │   ├── screens/       # App screens
│   │   ├── services/      # API services
│   │   ├── navigation/    # Navigation setup
│   │   └── config.js      # Configuration
│   └── backend/           # Express server
│       ├── server.js      # Main server file
│       └── .env           # Environment variables
├── .gitignore
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB
- Expo CLI
- Android Studio / Xcode

### Backend Setup
```bash
cd ClockWork/backend
npm install
node server.js
```

### Frontend Setup
```bash
cd ClockWork/frontend
npm install
npx expo start
```

### Configuration
Update `frontend/config.js` with your IP address:
```javascript
export const API_URL = 'http://YOUR_IP:3000/api';
```

## 📊 Database Schema

- **User**: name, phoneNumber, role (USER/WORKER)
- **WorkerProfile**: skills, availability, rating, earnings
- **Job**: title, category, description, payment, location, status
- **Application**: jobId, workerId, status (PENDING/ACCEPTED/REJECTED)
- **Notification**: userId, title, message, type

## 🎨 Design System

- **Primary Color**: Green (#10B981)
- **Currency**: Indian Rupees (₹)
- **Location**: Kuniyamuthur, Coimbatore, Tamil Nadu
- **Target Audience**: Blue-collar workers and local customers

## 🤝 Contributors

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/YOUR_USERNAME">
        <img src="https://github.com/YOUR_USERNAME.png" width="100px;" alt=""/>
        <br />
        <sub><b>Your Name</b></sub>
      </a>
      <br />
      <sub>Full Stack Developer</sub>
    </td>
  </tr>
</table>

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with Amazon Q Developer
- Designed for Indian blue-collar workers
- Inspired by Uber's map-first approach

---

Made with ❤️ in India
