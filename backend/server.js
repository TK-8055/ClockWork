const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quickworker');

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  phoneNumber: { type: String, unique: true, required: true },
  role: { type: String, enum: ['USER', 'WORKER'], required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// WorkerProfile Schema
const workerProfileSchema = new mongoose.Schema({
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  skills: [String],
  availabilityStatus: { type: String, enum: ['AVAILABLE', 'BUSY'], default: 'AVAILABLE' },
  totalJobsCompleted: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  rating: Number
});

const WorkerProfile = mongoose.model('WorkerProfile', workerProfileSchema);

// Location Schema (embedded)
const locationSchema = new mongoose.Schema({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  address: String
}, { _id: false });

// Job Schema
const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  description: String,
  paymentAmount: { type: Number, required: true },
  images: [String],
  status: { type: String, enum: ['POSTED', 'APPLIED', 'SELECTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], default: 'POSTED' },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  location: { type: locationSchema, required: true },
  createdAt: { type: Date, default: Date.now },
  completedAt: Date
});

const Job = mongoose.model('Job', jobSchema);

// Application Schema
const applicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  appliedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['PENDING', 'ACCEPTED', 'REJECTED'], default: 'PENDING' }
});

const Application = mongoose.model('Application', applicationSchema);

// OTP Schema
const otpSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true },
  otpHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 }
});

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTP = mongoose.model('OTP', otpSchema);

// AuthSession Schema
const authSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jwtToken: { type: String, required: true },
  deviceType: String,
  expiresAt: { type: Date, required: true }
});

authSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const AuthSession = mongoose.model('AuthSession', authSessionSchema);

// Notification Schema
const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Notification = mongoose.model('Notification', notificationSchema);

// Auth Routes
app.post('/api/auth/send-otp', async (req, res) => {
  const { phone } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  
  await OTP.deleteMany({ phoneNumber: phone });
  await OTP.create({ phoneNumber: phone, otpHash: otp, expiresAt });
  
  console.log(`OTP for ${phone}: ${otp}`);
  res.json({ success: true, message: 'OTP sent successfully' });
});

app.post('/api/auth/verify-otp', async (req, res) => {
  const { phone, otp } = req.body;
  const otpDoc = await OTP.findOne({ phoneNumber: phone, otpHash: otp });
  
  if (!otpDoc || otpDoc.expiresAt < new Date()) {
    return res.json({ success: false, message: 'Invalid or expired OTP' });
  }
  
  await OTP.deleteOne({ _id: otpDoc._id });
  
  let user = await User.findOne({ phoneNumber: phone });
  if (!user) {
    user = await User.create({ phoneNumber: phone, role: 'USER' });
  }
  
  const token = jwt.sign({ userId: user._id, phoneNumber: user.phoneNumber }, JWT_SECRET, { expiresIn: '30d' });
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  
  await AuthSession.create({ userId: user._id, jwtToken: token, expiresAt });
  
  res.json({ success: true, token, user: { id: user._id, phoneNumber: user.phoneNumber, role: user.role } });
});

app.post('/api/user/set-role', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = jwt.verify(token, JWT_SECRET);
  const user = await User.findByIdAndUpdate(decoded.userId, { role: req.body.role, updatedAt: new Date() }, { new: true });
  
  if (req.body.role === 'WORKER') {
    await WorkerProfile.findOneAndUpdate(
      { workerId: user._id },
      { workerId: user._id },
      { upsert: true, new: true }
    );
  }
  
  res.json({ success: true, user: { id: user._id, phoneNumber: user.phoneNumber, role: user.role } });
});

app.get('/api/auth/validate', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    res.json({ id: user._id, phoneNumber: user.phoneNumber, role: user.role });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Job Routes
app.get('/api/jobs', async (req, res) => {
  const jobs = await Job.find({ status: { $in: ['POSTED', 'APPLIED'] } }).populate('postedBy', 'name phoneNumber');
  res.json(jobs);
});

app.get('/api/jobs/:id', async (req, res) => {
  const job = await Job.findById(req.params.id).populate('postedBy', 'name phoneNumber');
  res.json(job);
});

app.post('/api/jobs', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = jwt.verify(token, JWT_SECRET);
  
  const job = await Job.create({
    ...req.body,
    postedBy: decoded.userId
  });
  
  res.json(job);
});

app.post('/api/jobs/:id/apply', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = jwt.verify(token, JWT_SECRET);
  
  const existing = await Application.findOne({ jobId: req.params.id, workerId: decoded.userId });
  if (existing) {
    return res.json({ success: false, message: 'Already applied' });
  }
  
  const application = await Application.create({
    jobId: req.params.id,
    workerId: decoded.userId
  });
  
  await Job.findByIdAndUpdate(req.params.id, { status: 'APPLIED' });
  
  const job = await Job.findById(req.params.id);
  await Notification.create({
    userId: job.postedBy,
    title: 'New Application',
    message: 'Someone applied to your job',
    type: 'applied'
  });
  
  res.json({ success: true, application });
});

// Worker Profile Routes
app.get('/api/worker/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.json(null);
    const decoded = jwt.verify(token, JWT_SECRET);
    const profile = await WorkerProfile.findOne({ workerId: decoded.userId });
    res.json(profile);
  } catch (error) {
    res.json(null);
  }
});

app.put('/api/worker/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    const decoded = jwt.verify(token, JWT_SECRET);
    const profile = await WorkerProfile.findOneAndUpdate(
      { workerId: decoded.userId },
      req.body,
      { new: true, upsert: true }
    );
    res.json(profile);
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Application Routes
app.get('/api/applications', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.json([]);
    const decoded = jwt.verify(token, JWT_SECRET);
    const applications = await Application.find({ workerId: decoded.userId }).populate('jobId');
    res.json(applications);
  } catch (error) {
    res.json([]);
  }
});

// Notification Routes
app.get('/api/notifications', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = jwt.verify(token, JWT_SECRET);
  const notifications = await Notification.find({ userId: decoded.userId }).sort({ createdAt: -1 });
  res.json(notifications);
});

app.put('/api/notifications/:id/read', async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
  res.json({ success: true });
});

// Seed Database with Fake Data
async function seedDatabase() {
  try {
    await mongoose.connection.db.dropDatabase();
    console.log('Database cleared. Seeding...');
  } catch (err) {
    console.log('Seeding database...');
  }

  // Create Users
  const users = await User.insertMany([
    { name: 'Murugan', phoneNumber: '+919876543210', role: 'USER', isActive: true },
    { name: 'Lakshmi', phoneNumber: '+919876543211', role: 'USER', isActive: true },
    { name: 'Karthik', phoneNumber: '+919876543212', role: 'WORKER', isActive: true },
    { name: 'Selvi', phoneNumber: '+919876543213', role: 'WORKER', isActive: true },
    { name: 'Ravi', phoneNumber: '+919876543214', role: 'WORKER', isActive: true },
    { name: 'Priya', phoneNumber: '+919876543215', role: 'USER', isActive: true }
  ]);

  // Create Worker Profiles
  await WorkerProfile.insertMany([
    { workerId: users[2]._id, skills: ['Plumbing', 'Electrical'], availabilityStatus: 'AVAILABLE', totalJobsCompleted: 45, totalEarnings: 67500, rating: 4.5 },
    { workerId: users[3]._id, skills: ['Cleaning', 'Cooking'], availabilityStatus: 'AVAILABLE', totalJobsCompleted: 120, totalEarnings: 180000, rating: 4.8 },
    { workerId: users[4]._id, skills: ['Carpentry', 'Painting'], availabilityStatus: 'BUSY', totalJobsCompleted: 78, totalEarnings: 156000, rating: 4.6 }
  ]);

  // Create Jobs (Kuniyamuthur, Coimbatore area)
  const jobs = await Job.insertMany([
    {
      title: 'Plumber needed for bathroom repair',
      category: 'Plumbing',
      description: 'Need to fix leaking tap and replace bathroom fittings',
      paymentAmount: 800,
      images: [],
      status: 'POSTED',
      postedBy: users[0]._id,
      location: { latitude: 11.0510, longitude: 76.9010, address: 'Kuniyamuthur, Coimbatore' }
    },
    {
      title: 'House cleaning required',
      category: 'Cleaning',
      description: '2BHK apartment deep cleaning needed',
      paymentAmount: 600,
      images: [],
      status: 'APPLIED',
      postedBy: users[1]._id,
      location: { latitude: 11.0480, longitude: 76.9050, address: 'Vellalore Road, Coimbatore' }
    },
    {
      title: 'Carpenter for furniture assembly',
      category: 'Carpentry',
      description: 'Need to assemble new wardrobe and bed',
      paymentAmount: 1200,
      images: [],
      status: 'POSTED',
      postedBy: users[5]._id,
      location: { latitude: 11.0540, longitude: 76.8980, address: 'Thudiyalur Road, Coimbatore' }
    },
    {
      title: 'Electrician for wiring work',
      category: 'Electrical',
      description: 'Install new electrical points and fix switches',
      paymentAmount: 1500,
      images: [],
      status: 'POSTED',
      postedBy: users[0]._id,
      location: { latitude: 11.0495, longitude: 76.9025, address: 'Neelambur, Coimbatore' }
    },
    {
      title: 'Painting work for 2 rooms',
      category: 'Painting',
      description: 'Need professional painter for bedroom and living room',
      paymentAmount: 3000,
      images: [],
      status: 'IN_PROGRESS',
      postedBy: users[1]._id,
      location: { latitude: 11.0525, longitude: 76.9040, address: 'Saravanampatti, Coimbatore' }
    },
    {
      title: 'Cook needed for function',
      category: 'Cooking',
      description: 'Need cook for 30 people house warming function',
      paymentAmount: 2500,
      images: [],
      status: 'COMPLETED',
      postedBy: users[5]._id,
      location: { latitude: 11.0505, longitude: 76.9000, address: 'Vadavalli, Coimbatore' },
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      title: 'Bike mechanic needed',
      category: 'Mechanic',
      description: 'Two wheeler service and repair',
      paymentAmount: 500,
      images: [],
      status: 'POSTED',
      postedBy: users[0]._id,
      location: { latitude: 11.0515, longitude: 76.9015, address: 'Kuniyamuthur Main Road, Coimbatore' }
    },
    {
      title: 'AC repair and service',
      category: 'AC Repair',
      description: 'Split AC not cooling properly, need urgent repair',
      paymentAmount: 700,
      images: [],
      status: 'POSTED',
      postedBy: users[1]._id,
      location: { latitude: 11.0490, longitude: 76.9020, address: 'Sowripalayam, Coimbatore' }
    }
  ]);

  // Create Applications
  await Application.insertMany([
    { jobId: jobs[1]._id, workerId: users[3]._id, status: 'PENDING' },
    { jobId: jobs[4]._id, workerId: users[4]._id, status: 'ACCEPTED' },
    { jobId: jobs[5]._id, workerId: users[3]._id, status: 'ACCEPTED' }
  ]);

  // Create Notifications
  await Notification.insertMany([
    { userId: users[1]._id, title: 'New Application', message: 'Selvi applied to your cleaning job', type: 'applied', isRead: false },
    { userId: users[3]._id, title: 'Application Accepted', message: 'Your application for cooking job was accepted', type: 'selected', isRead: true },
    { userId: users[5]._id, title: 'Job Completed', message: 'Your cooking job has been completed', type: 'completed', isRead: true },
    { userId: users[0]._id, title: 'Welcome', message: 'Welcome to Quick Worker! Start posting jobs now', type: 'system', isRead: false }
  ]);

  console.log('Database seeded successfully!');
}

mongoose.connection.once('open', () => {
  seedDatabase();
});

app.listen(3000, () => console.log('Server running on port 3000'));
