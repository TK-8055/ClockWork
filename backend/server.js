const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Environment variables with defaults
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/clockwork';
const DEV_MODE = process.env.DEV_MODE === 'true';

// Credit System Configuration:
// - Users GET credits for posting jobs (FREE to post + bonus!)
// - Workers earn payment MINUS platform convenience fee
const INITIAL_CREDITS = parseInt(process.env.INITIAL_CREDITS) || 100;
const JOB_POSTING_REWARD = parseInt(process.env.JOB_POSTING_REWARD) || 10;
const PLATFORM_FEE_PERCENTAGE = parseFloat(process.env.PLATFORM_FEE_PERCENTAGE) || 10;
const PENALTY_AMOUNT = parseInt(process.env.PENALTY_AMOUNT) || 25;

mongoose.connect(MONGODB_URI);

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  phoneNumber: { type: String, unique: true, required: true },
  address: String,
  role: { type: String, enum: ['USER', 'WORKER'], required: true },
  isActive: { type: Boolean, default: true },
  credits: { type: Number, default: INITIAL_CREDITS },
  creditScore: { type: Number, default: 100 },
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
  rating: { type: Number, default: 5 }
});

const WorkerProfile = mongoose.model('WorkerProfile', workerProfileSchema);

// Location Schema
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
  platformFee: { type: Number, default: 0 },
  workerPayment: { type: Number, default: 0 },
  images: [String],
  status: { 
    type: String, 
    enum: ['POSTED', 'APPLIED', 'SELECTED', 'IN_PROGRESS', 'PENDING_VERIFICATION', 'COMPLETED', 'CANCELLED', 'DISPUTED'], 
    default: 'POSTED' 
  },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  location: { type: locationSchema, required: true },
  createdAt: { type: Date, default: Date.now },
  completedAt: Date,
  startedAt: Date
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

// Credit Transaction Schema
const creditTransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['JOB_POSTING', 'JOB_COMPLETION', 'PENALTY', 'BONUS', 'TOP_UP', 'PLATFORM_FEE'], required: true },
  amount: { type: Number, required: true },
  balance: { type: Number, required: true },
  description: String,
  relatedJobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  createdAt: { type: Date, default: Date.now }
});

const CreditTransaction = mongoose.model('CreditTransaction', creditTransactionSchema);

// Penalty Schema
const penaltySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['FALSE_WORK_REPORT', 'NO_SHOW', 'POOR_WORK', 'FALSE_DISPUTE'], required: true },
  amount: { type: Number, default: PENALTY_AMOUNT },
  description: String,
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  relatedJobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  status: { type: String, enum: ['PENDING', 'RESOLVED', 'DISMISSED'], default: 'PENDING' },
  createdAt: { type: Date, default: Date.now }
});

const Penalty = mongoose.model('Penalty', penaltySchema);

// Job Completion Schema
const jobCompletionSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  submittedAt: { type: Date, default: Date.now },
  completionProof: { images: [String], description: String },
  userVerified: { type: Boolean, default: false },
  userVerifiedAt: Date,
  rating: { type: Number, min: 1, max: 5 }
});

const JobCompletion = mongoose.model('JobCompletion', jobCompletionSchema);

// Dispute Schema
const disputeSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  raisedAgainst: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['WORK_NOT_DONE', 'POOR_WORK', 'NO_SHOW', 'OTHER'], required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['OPEN', 'RESOLVED', 'REJECTED'], default: 'OPEN' },
  createdAt: { type: Date, default: Date.now }
});

const Dispute = mongoose.model('Dispute', disputeSchema);

// OTP Schema
const otpSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true },
  otpHash: { type: String, required: true },
  expiresAt: { type: Date, required: true }
});
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
const OTP = mongoose.model('OTP', otpSchema);

// AuthSession Schema
const authSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jwtToken: { type: String, required: true },
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

// Chat/Message Schema
const chatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  lastMessage: { type: String },
  lastMessageAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});
const Chat = mongoose.model('Chat', chatSchema);

// Message Schema
const messageSchema = new mongoose.Schema({
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

// Middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ error: 'User not found' });
    if (!user.isActive) return res.status(403).json({ error: 'Account deactivated' });
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Auth Routes
app.post('/api/auth/send-otp', async (req, res) => {
  const { phone } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  await OTP.deleteMany({ phoneNumber: phone });
  await OTP.create({ phoneNumber: phone, otpHash: otp, expiresAt });
  console.log(`OTP for ${phone}: ${otp}`);
  res.json({ success: true, message: 'OTP sent' });
});

app.post('/api/auth/verify-otp', async (req, res) => {
  const { phone, otp } = req.body;
  
  // DEV MODE: Skip OTP verification
  if (DEV_MODE) {
    let user = await User.findOne({ phoneNumber: phone });
    if (!user) {
      user = await User.create({ phoneNumber: phone, role: 'USER', credits: INITIAL_CREDITS });
      await CreditTransaction.create({ userId: user._id, type: 'BONUS', amount: INITIAL_CREDITS, balance: INITIAL_CREDITS, description: 'Welcome bonus - 100 credits!' });
    }
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '30d' });
    await AuthSession.create({ userId: user._id, jwtToken: token, expiresAt: new Date(Date.now() + 30*24*60*60*1000) });
    return res.json({ success: true, token, user: { id: user._id, phoneNumber: user.phoneNumber, role: user.role, credits: user.credits, creditScore: user.creditScore } });
  }
  
  // PRODUCTION: Verify OTP
  const otpDoc = await OTP.findOne({ phoneNumber: phone, otpHash: otp });
  if (!otpDoc || otpDoc.expiresAt < new Date()) {
    return res.json({ success: false, message: 'Invalid OTP' });
  }
  await OTP.deleteOne({ _id: otpDoc._id });
  
  let user = await User.findOne({ phoneNumber: phone });
  if (!user) {
    user = await User.create({ phoneNumber: phone, role: 'USER', credits: INITIAL_CREDITS });
    await CreditTransaction.create({ userId: user._id, type: 'BONUS', amount: INITIAL_CREDITS, balance: INITIAL_CREDITS, description: 'Welcome bonus - 100 credits!' });
  }
  
  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '30d' });
  await AuthSession.create({ userId: user._id, jwtToken: token, expiresAt: new Date(Date.now() + 30*24*60*60*1000) });
  
  res.json({ success: true, token, user: { id: user._id, phoneNumber: user.phoneNumber, role: user.role, credits: user.credits, creditScore: user.creditScore } });
});

app.post('/api/user/set-role', authenticate, async (req, res) => {
  const { role } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { role, updatedAt: new Date() },
    { returnDocument: 'after' }
  );
  if (role === 'WORKER') {
    await WorkerProfile.findOneAndUpdate({ workerId: user._id }, { workerId: user._id }, { upsert: true });
  }
  res.json({ success: true, user: { id: user._id, phoneNumber: user.phoneNumber, role: user.role, credits: user.credits, creditScore: user.creditScore } });
});

app.put('/api/user/profile', authenticate, async (req, res) => {
  const { name, phoneNumber, address } = req.body;
  const updateData = { updatedAt: new Date() };

  if (name !== undefined) updateData.name = name;
  if (address !== undefined) updateData.address = address;

  if (phoneNumber !== undefined && phoneNumber !== req.user.phoneNumber) {
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) return res.status(400).json({ error: 'Phone number already in use' });
    updateData.phoneNumber = phoneNumber;
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updateData,
    { returnDocument: 'after' }
  );
  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      phoneNumber: user.phoneNumber,
      address: user.address,
      role: user.role,
      credits: user.credits,
      creditScore: user.creditScore
    }
  });
});

app.get('/api/auth/validate', authenticate, async (req, res) => {
  res.json({ id: req.user._id, phoneNumber: req.user.phoneNumber, role: req.user.role, credits: req.user.credits, creditScore: req.user.creditScore });
});

// Credit Routes
app.get('/api/credits', authenticate, async (req, res) => {
  const user = await User.findById(req.user._id);
  const transactions = await CreditTransaction.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50);
  res.json({ credits: user.credits, creditScore: user.creditScore, transactions });
});

app.post('/api/credits/top-up', authenticate, async (req, res) => {
  const amount = parseInt(req.body.amount, 10);
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  const user = await User.findById(req.user._id);
  const newBalance = user.credits + amount;
  await User.findByIdAndUpdate(req.user._id, { credits: newBalance });
  await CreditTransaction.create({
    userId: req.user._id,
    type: 'TOP_UP',
    amount,
    balance: newBalance,
    description: `Credit top-up: ${amount}`
  });

  res.json({ success: true, credits: newBalance });
});

// Job Routes
app.get('/api/jobs', async (req, res) => {
  const query = req.query.status ? { status: req.query.status } : { status: { $in: ['POSTED', 'APPLIED'] } };
  const jobs = await Job.find(query).populate('postedBy', 'name phoneNumber').populate('assignedTo', 'name').sort({ createdAt: -1 });
  res.json(jobs);
});

app.get('/api/jobs/my-jobs', authenticate, async (req, res) => {
  const jobs = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
  const jobsWithCount = await Promise.all(jobs.map(async (job) => {
    const applicantCount = await Application.countDocuments({ jobId: job._id });
    return { ...job.toObject(), applicantCount };
  }));
  res.json(jobsWithCount);
});

app.get('/api/jobs/:id', async (req, res) => {
  const job = await Job.findById(req.params.id).populate('postedBy', 'name phoneNumber').populate('assignedTo', 'name');
  res.json(job);
});

// POST JOB - Users GET credits for posting (FREE!)
app.post('/api/jobs', authenticate, async (req, res) => {
  if (req.user.role !== 'USER') return res.status(403).json({ error: 'Only users can post jobs' });
  const user = await User.findById(req.user._id);
  
  const jobPayment = req.body.paymentAmount || 0;
  const platformFee = Math.round(jobPayment * (PLATFORM_FEE_PERCENTAGE / 100));
  const workerPayment = jobPayment - platformFee;
  
  const newBalance = user.credits + JOB_POSTING_REWARD;
  await User.findByIdAndUpdate(req.user._id, { credits: newBalance });
  await CreditTransaction.create({ 
    userId: req.user._id, 
    type: 'JOB_POSTING', 
    amount: JOB_POSTING_REWARD, 
    balance: newBalance, 
    description: `Job posted - you earned ${JOB_POSTING_REWARD} credits!` 
  });
  
  const job = await Job.create({ 
    ...req.body, 
    postedBy: req.user._id,
    platformFee,
    workerPayment
  });
  
  res.json({ 
    success: true, 
    job,
    message: `Job posted! You earned ${JOB_POSTING_REWARD} credits. Platform fee: ${PLATFORM_FEE_PERCENTAGE}%`
  });
});

app.post('/api/jobs/:id/apply', authenticate, async (req, res) => {
  if (req.user.role !== 'WORKER') return res.status(403).json({ error: 'Only workers can apply' });
  const job = await Job.findById(req.params.id);
  if (!job || job.status !== 'POSTED') return res.status(400).json({ error: 'Job not available' });
  if (job.postedBy.toString() === req.user._id.toString()) return res.status(400).json({ error: 'Cannot apply to own job' });
  const existing = await Application.findOne({ jobId: req.params.id, workerId: req.user._id });
  if (existing) return res.status(400).json({ error: 'Already applied' });
  
  const application = await Application.create({ jobId: req.params.id, workerId: req.user._id });
  await Job.findByIdAndUpdate(req.params.id, { status: 'APPLIED' });
  await Notification.create({ userId: job.postedBy, title: 'New Application', message: 'Someone applied to your job', type: 'applied' });
  res.json({ success: true, application });
});

app.post('/api/jobs/:id/select-worker', authenticate, async (req, res) => {
  if (req.user.role !== 'USER') return res.status(403).json({ error: 'Only users can select workers' });
  const { workerId } = req.body;
  const job = await Job.findById(req.params.id);
  if (!job || job.postedBy.toString() !== req.user._id.toString()) return res.status(403).json({ error: 'Not authorized' });
  
  job.assignedTo = workerId;
  job.status = 'SELECTED';
  job.startedAt = new Date();
  await job.save();
  
  await Application.updateMany({ jobId: job._id, workerId: { $ne: workerId } }, { status: 'REJECTED' });
  await Application.findOneAndUpdate({ jobId: job._id, workerId }, { status: 'ACCEPTED' });
  await Notification.create({ userId: workerId, title: 'Worker Selected', message: `You have been selected! Payment: ${job.workerPayment} credits (after ${PLATFORM_FEE_PERCENTAGE}% platform fee)`, type: 'selected' });
  
  res.json({ success: true, job });
});

app.post('/api/jobs/:id/start-work', authenticate, async (req, res) => {
  if (req.user.role !== 'WORKER') return res.status(403).json({ error: 'Only workers can start work' });
  const job = await Job.findById(req.params.id);
  if (!job || job.assignedTo.toString() !== req.user._id.toString()) return res.status(403).json({ error: 'Not authorized' });
  job.status = 'IN_PROGRESS';
  job.startedAt = new Date();
  await job.save();
  res.json({ success: true, job });
});

app.post('/api/jobs/:id/submit-completion', authenticate, async (req, res) => {
  if (req.user.role !== 'WORKER') return res.status(403).json({ error: 'Only workers can submit completion' });
  const { images, description } = req.body;
  const job = await Job.findById(req.params.id);
  if (!job || job.assignedTo.toString() !== req.user._id.toString()) return res.status(403).json({ error: 'Not authorized' });
  
  job.status = 'PENDING_VERIFICATION';
  await job.save();
  
  const completion = await JobCompletion.create({ jobId: job._id, workerId: req.user._id, completionProof: { images: images || [], description } });
  await Notification.create({ userId: job.postedBy, title: 'Work Submitted', message: `Worker submitted work. Payment: ${job.workerPayment} credits`, type: 'verification' });
  res.json({ success: true, completion });
});

app.post('/api/jobs/:id/verify', authenticate, async (req, res) => {
  if (req.user.role !== 'USER') return res.status(403).json({ error: 'Only users can verify jobs' });
  const { verified, feedback, rating } = req.body;
  const job = await Job.findById(req.params.id);
  if (!job || job.postedBy.toString() !== req.user._id.toString()) return res.status(403).json({ error: 'Not authorized' });
  
  const completion = await JobCompletion.findOne({ jobId: job._id });
  if (!completion) return res.status(400).json({ error: 'No completion submitted for this job' });
  completion.userVerified = verified;
  completion.userVerifiedAt = new Date();
  completion.rating = rating;
  await completion.save();
  
  if (verified) {
    job.status = 'COMPLETED';
    job.completedAt = new Date();
    await job.save();
    
    const worker = await User.findById(job.assignedTo);
    const workerNewBalance = worker.credits + job.workerPayment;
    await User.findByIdAndUpdate(job.assignedTo, { credits: workerNewBalance, creditScore: Math.min(100, worker.creditScore + 2) });
    
    await CreditTransaction.create({ 
      userId: job.assignedTo, 
      type: 'JOB_COMPLETION', 
      amount: job.workerPayment, 
      balance: workerNewBalance, 
      description: `Payment for: ${job.title} (Job: ₹${job.paymentAmount}, Platform fee: ₹${job.platformFee})`, 
      relatedJobId: job._id 
    });
    await WorkerProfile.findOneAndUpdate({ workerId: job.assignedTo }, { $inc: { totalJobsCompleted: 1, totalEarnings: job.workerPayment }, rating });
    
    await Notification.create({ userId: job.assignedTo, title: 'Job Completed', message: `You earned ${job.workerPayment} credits! (₹${job.paymentAmount} job - ₹${job.platformFee} platform fee)`, type: 'completed' });
  } else {
    job.status = 'DISPUTED';
    await job.save();
  }
  
  res.json({ success: true, job });
});

// Application Routes
app.get('/api/applications', authenticate, async (req, res) => {
  const query = req.query.jobId ? { jobId: req.query.jobId } : { workerId: req.user._id };
  const applications = await Application.find(query).populate('jobId').populate('workerId', 'name phoneNumber rating');
  res.json(applications);
});

app.get('/api/jobs/:id/applications', authenticate, async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  if (job.postedBy.toString() !== req.user._id.toString()) return res.status(403).json({ error: 'Not authorized' });
  const applications = await Application.find({ jobId: req.params.id }).populate('workerId', 'name phoneNumber rating');
  res.json(applications);
});

// Worker Profile Routes
app.get('/api/worker/profile', authenticate, async (req, res) => {
  const profile = await WorkerProfile.findOne({ workerId: req.user._id });
  res.json(profile);
});

app.put('/api/worker/profile', authenticate, async (req, res) => {
  const profile = await WorkerProfile.findOneAndUpdate(
    { workerId: req.user._id },
    req.body,
    { returnDocument: 'after', upsert: true }
  );
  res.json(profile);
});

// Notification Routes
app.get('/api/notifications', authenticate, async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50);
  res.json(notifications);
});

app.put('/api/notifications/:id/read', authenticate, async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
  res.json({ success: true });
});

app.put('/api/notifications/read-all', authenticate, async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
  res.json({ success: true });
});

app.post('/api/notifications/clear', authenticate, async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
  res.json({ success: true });
});

// Penalty Routes
app.post('/api/penalty/report', authenticate, async (req, res) => {
  const { jobId, type, description } = req.body;
  const job = await Job.findById(jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  
  let penalizeUserId = req.user._id.toString() === job.postedBy.toString() ? job.assignedTo : job.postedBy;
  const penalizeUser = await User.findById(penalizeUserId);
  const newCreditScore = Math.max(0, penalizeUser.creditScore - 10);
  const newBalance = Math.max(0, penalizeUser.credits - PENALTY_AMOUNT);
  
  await User.findByIdAndUpdate(penalizeUserId, { credits: newBalance, creditScore: newCreditScore });
  await Penalty.create({ userId: penalizeUserId, type, description, amount: PENALTY_AMOUNT, reportedBy: req.user._id, relatedJobId: jobId });
  await CreditTransaction.create({ userId: penalizeUserId, type: 'PENALTY', amount: -PENALTY_AMOUNT, balance: newBalance, description: `Penalty: ${type}`, relatedJobId: jobId });
  
  res.json({ success: true });
});

app.get('/api/penalties', authenticate, async (req, res) => {
  const penalties = await Penalty.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json(penalties);
});

// Dispute Routes
app.post('/api/disputes', authenticate, async (req, res) => {
  const { jobId, type, description } = req.body;
  const job = await Job.findById(jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  
  const raisedAgainst = req.user._id.toString() === job.postedBy.toString() ? job.assignedTo : job.postedBy;
  await Dispute.create({ jobId, raisedBy: req.user._id, raisedAgainst, type, description });
  job.status = 'DISPUTED';
  await job.save();
  
  res.json({ success: true });
});

app.get('/api/disputes', authenticate, async (req, res) => {
  const disputes = await Dispute.find({ $or: [{ raisedBy: req.user._id }, { raisedAgainst: req.user._id }] })
    .populate('jobId', 'title status paymentAmount').populate('raisedBy', 'name').populate('raisedAgainst', 'name');
  res.json(disputes);
});

// Chat/Messaging Routes
app.get('/api/chats', authenticate, async (req, res) => {
  const chats = await Chat.find({ participants: req.user._id })
    .populate('participants', 'name phoneNumber')
    .populate('jobId', 'title status')
    .sort({ lastMessageAt: -1 });
  res.json(chats);
});

app.post('/api/chats', authenticate, async (req, res) => {
  const { participantId, jobId } = req.body;
  let chat = await Chat.findOne({ participants: { $all: [req.user._id, participantId] }, jobId });
  if (!chat) {
    chat = await Chat.create({ participants: [req.user._id, participantId], jobId });
  }
  chat = await Chat.findById(chat._id).populate('participants', 'name phoneNumber').populate('jobId', 'title status');
  res.json(chat);
});

app.get('/api/chats/:chatId/messages', authenticate, async (req, res) => {
  const messages = await Message.find({ chatId: req.params.chatId }).populate('senderId', 'name').sort({ createdAt: 1 });
  res.json(messages);
});

app.post('/api/chats/:chatId/messages', authenticate, async (req, res) => {
  const { message } = req.body;
  const chat = await Chat.findById(req.params.chatId);
  if (!chat) return res.status(404).json({ error: 'Chat not found' });
  const isParticipant = chat.participants.some(p => p.toString() === req.user._id.toString());
  if (!isParticipant) return res.status(403).json({ error: 'Not authorized' });
  
  const newMessage = await Message.create({ chatId: req.params.chatId, senderId: req.user._id, message });
  chat.lastMessage = message;
  chat.lastMessageAt = new Date();
  await chat.save();
  await Message.updateMany({ chatId: req.params.chatId, senderId: { $ne: req.user._id }, isRead: false }, { isRead: true });
  
  const populatedMessage = await Message.findById(newMessage._id).populate('senderId', 'name');
  res.json(populatedMessage);
});

app.get('/api/chats/job/:jobId', authenticate, async (req, res) => {
  const job = await Job.findById(req.params.jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  
  let otherUserId;
  if (job.postedBy.toString() === req.user._id.toString()) otherUserId = job.assignedTo;
  else if (job.assignedTo && job.assignedTo.toString() === req.user._id.toString()) otherUserId = job.postedBy;
  else return res.status(403).json({ error: 'Not authorized' });
  
  let chat = await Chat.findOne({ participants: { $all: [req.user._id, otherUserId] }, jobId: req.params.jobId });
  if (!chat) chat = await Chat.create({ participants: [req.user._id, otherUserId], jobId: req.params.jobId });
  chat = await Chat.findById(chat._id).populate('participants', 'name phoneNumber').populate('jobId', 'title status paymentAmount');
  res.json(chat);
});

// Connect to MongoDB - no seed data
mongoose.connection.once('open', () => { 
  console.log('Connected to MongoDB - using real data only');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Platform fee: ${PLATFORM_FEE_PERCENTAGE}% | Job posting reward: ${JOB_POSTING_REWARD} credits`);
  console.log(`DEV MODE: ${DEV_MODE ? 'ON (OTP bypass enabled)' : 'OFF (OTP required)'}`);
  console.log(`Access from: http://localhost:${PORT} or http://YOUR_IP:${PORT}`);
});
