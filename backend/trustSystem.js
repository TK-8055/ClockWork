/**
 * ClockWork Trust & Reliability Management System
 * ===============================================
 * A comprehensive trust meter system for gig-workers.
 * 
 * WORKERS START FULLY TRUSTED (100 points)
 * Every bad action reduces trust.
 * Good behavior over time can restore trust (but never above max).
 */

const mongoose = require('mongoose');

// ============================================
// TRUST SYSTEM CONFIGURATION
// ============================================

const TRUST_CONFIG = {
  // Initial state
  INITIAL_SCORE: 100,
  MAX_SCORE: 100,
  
  // Score thresholds for access levels
  ACCESS_LEVELS: {
    PREMIUM: { min: 90, max: 100, label: 'Premium Worker', color: '#10B981' },
    TRUSTED: { min: 70, max: 89, label: 'Trusted Worker', color: '#3B82F6' },
    STANDARD: { min: 50, max: 69, label: 'Standard Worker', color: '#F59E0B' },
    RESTRICTED: { min: 30, max: 49, label: 'Restricted Worker', color: '#F97316' },
    SUSPENDED: { min: 0, max: 29, label: 'Suspended', color: '#EF4444' }
  },
  
  // Suspension thresholds
  SUSPENSION: {
    TEMP_THRESHOLD: 20,      // Score below 20 = temp suspension
    PERM_THRESHOLD: 0,      // Score at 0 = permanent ban
    STRIKE_TEMP_LIMIT: 3    // 3 strikes = temp suspension
  },
  
  // Recovery settings
  RECOVERY: {
    GOOD_JOB_BONUS: 2,              // Points per successful job
    PERIODIC_BONUS: 5,              // Bonus for consistent good behavior (monthly)
    BONUS_THRESHOLD: 95,            // Minimum score to receive periodic bonus
    RECOVERY_COOLDOWN_DAYS: 30,    // Days between periodic bonuses
    MAX_RECOVERY_RATE: 10           // Max points recoverable per month
  },
  
  // Violation penalties
  VIOLATIONS: {
    NO_SHOW: { 
      points: 25, 
      strikes: 2, 
      description: 'Worker did not show up for the job',
      gracePeriodMinutes: 15
    },
    LATE_CANCELLATION: { 
      points: 15, 
      strikes: 1, 
      description: 'Worker cancelled less than 2 hours before job',
      gracePeriodMinutes: 0
    },
    EARLY_CANCELLATION: { 
      points: 5, 
      strikes: 0, 
      description: 'Worker cancelled more than 2 hours before job (reduced penalty)',
      gracePeriodMinutes: 0
    },
    MISCONDUCT: { 
      points: 30, 
      strikes: 3, 
      description: 'Worker misconduct or inappropriate behavior',
      gracePeriodMinutes: 0
    },
    POOR_WORK: { 
      points: 20, 
      strikes: 2, 
      description: 'Work quality was unsatisfactory',
      gracePeriodMinutes: 0
    },
    FALSE_DISPUTE: { 
      points: 15, 
      strikes: 1, 
      description: 'Worker raised false dispute',
      gracePercentage: 0
    },
    FALSE_REPORT: { 
      points: 10, 
      strikes: 1, 
      description: 'False work completion report',
      gracePeriodMinutes: 0
    },
    LATE_ARRIVAL: {
      points: 5,
      strikes: 0,
      description: 'Worker arrived more than 15 minutes late',
      gracePeriodMinutes: 15
    }
  },
  
  // Grace periods (in hours)
  GRACE_PERIODS: {
    CANCELLATION_BEFORE_JOB: 2,    // Hours before job to cancel without penalty
    LATE_ARRIVAL: 0.25             // 15 minutes = 0.25 hours
  }
};

// ============================================
// TRUST SCORE SCHEMA EXTENSION
// ============================================

const trustScoreSchema = new mongoose.Schema({
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  score: { type: Number, default: TRUST_CONFIG.INITIAL_SCORE, min: 0, max: TRUST_CONFIG.MAX_SCORE },
  strikes: { type: Number, default: 0, min: 0 },
  accessLevel: { 
    type: String, 
    enum: ['PREMIUM', 'TRUSTED', 'STANDARD', 'RESTRICTED', 'SUSPENDED'],
    default: 'PREMIUM'
  },
  isTemporarilySuspended: { type: Boolean, default: false },
  isPermanentlyBanned: { type: Boolean, default: false },
  suspensionExpiresAt: Date,
  lastBonusAt: Date,
  totalViolations: { type: Number, default: 0 },
  violationHistory: [{
    type: { type: String },
    pointsDeducted: Number,
    strikesAdded: Number,
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    description: String,
    createdAt: { type: Date, default: Date.now }
  }],
  recoveryHistory: [{
    pointsAdded: Number,
    reason: String,
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index for efficient queries
trustScoreSchema.index({ workerId: 1 });
trustScoreSchema.index({ score: -1 });
trustScoreSchema.index({ accessLevel: 1 });

const TrustScore = mongoose.model('TrustScore', trustScoreSchema);

// ============================================
// TRUST SYSTEM LOGIC
// ============================================

/**
 * Calculate the access level based on score
 */
function calculateAccessLevel(score) {
  if (score >= TRUST_CONFIG.ACCESS_LEVELS.PREMIUM.min) return 'PREMIUM';
  if (score >= TRUST_CONFIG.ACCESS_LEVELS.TRUSTED.min) return 'TRUSTED';
  if (score >= TRUST_CONFIG.ACCESS_LEVELS.STANDARD.min) return 'STANDARD';
  if (score >= TRUST_CONFIG.ACCESS_LEVELS.RESTRICTED.min) return 'RESTRICTED';
  return 'SUSPENDED';
}

/**
 * Apply a violation to a worker
 * @param {string} workerId - Worker's user ID
 * @param {string} violationType - Type of violation
 * @param {string} jobId - Related job ID
 * @param {string} description - Additional description
 * @returns {Object} Updated trust score object
 */
async function applyViolation(workerId, violationType, jobId = null, description = '') {
  const violation = TRUST_CONFIG.VIOLATIONS[violationType];
  if (!violation) {
    throw new Error(`Unknown violation type: ${violationType}`);
  }

  // Get or create trust score record
  let trustScore = await TrustScore.findOne({ workerId });
  if (!trustScore) {
    trustScore = new TrustScore({ workerId });
  }

  // Calculate new score (never go below 0)
  const newScore = Math.max(0, trustScore.score - violation.points);
  const newStrikes = trustScore.strikes + violation.strikes;
  
  // Determine suspension status
  let isTemporarilySuspended = trustScore.isTemporarilySuspended;
  let isPermanentlyBanned = trustScore.isPermanentlyBanned;
  let suspensionExpiresAt = trustScore.suspensionExpiresAt;

  // Check for suspension triggers
  if (newScore < TRUST_CONFIG.SUSPENSION.PERM_THRESHOLD || isPermanentlyBanned) {
    isPermanentlyBanned = true;
    isTemporarilySuspended = false;
    suspensionExpiresAt = null;
  } else if (newStrikes >= TRUST_CONFIG.SUSPENSION.STRIKE_TEMP_LIMIT || newScore < TRUST_CONFIG.SUSPENSION.TEMP_THRESHOLD) {
    isTemporarilySuspended = true;
    suspensionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 day suspension
  }

  // Update trust score
  trustScore.score = newScore;
  trustScore.strikes = newStrikes;
  trustScore.accessLevel = calculateAccessLevel(newScore);
  trustScore.isTemporarilySuspended = isTemporarilySuspended;
  trustScore.isPermanentlyBanned = isPermanentlyBanned;
  trustScore.suspensionExpiresAt = suspensionExpiresAt;
  trustScore.totalViolations += 1;
  trustScore.updatedAt = new Date();

  // Add to violation history
  trustScore.violationHistory.push({
    type: violationType,
    pointsDeducted: violation.points,
    strikesAdded: violation.strikes,
    jobId,
    description: description || violation.description
  });

  await trustScore.save();
  
  // Also update the User's creditScore field for compatibility
  const User = mongoose.model('User');
  await User.findByIdAndUpdate(workerId, { 
    creditScore: newScore,
    isActive: !isPermanentlyBanned
  });

  return trustScore;
}

/**
 * Reward a worker for completed job
 * @param {string} workerId - Worker's user ID
 * @param {string} jobId - Completed job ID
 * @returns {Object} Updated trust score object
 */
async function rewardCompletedJob(workerId, jobId = null) {
  let trustScore = await TrustScore.findOne({ workerId });
  if (!trustScore) {
    trustScore = new TrustScore({ workerId });
  }

  // Only reward if not banned and score is below max
  if (trustScore.isPermanentlyBanned || trustScore.score >= TRUST_CONFIG.MAX_SCORE) {
    return trustScore;
  }

  const bonusPoints = TRUST_CONFIG.RECOVERY.GOOD_JOB_BONUS;
  const newScore = Math.min(TRUST_CONFIG.MAX_SCORE, trustScore.score + bonusPoints);

  trustScore.score = newScore;
  trustScore.accessLevel = calculateAccessLevel(newScore);
  trustScore.updatedAt = new Date();

  // Add to recovery history
  trustScore.recoveryHistory.push({
    pointsAdded: bonusPoints,
    reason: 'Job completed successfully'
  });

  // Check if suspension should be lifted
  if (trustScore.isTemporarilySuspended && trustScore.score >= TRUST_CONFIG.SUSPENSION.TEMP_THRESHOLD) {
    trustScore.isTemporarilySuspended = false;
    trustScore.suspensionExpiresAt = null;
  }

  await trustScore.save();

  // Also update the User's creditScore field
  const User = mongoose.model('User');
  await User.findByIdAndUpdate(workerId, { creditScore: newScore });

  return trustScore;
}

/**
 * Apply periodic bonus for consistent good behavior
 * @param {string} workerId - Worker's user ID
 * @returns {Object} Updated trust score object or null if not eligible
 */
async function applyPeriodicBonus(workerId) {
  let trustScore = await TrustScore.findOne({ workerId });
  if (!trustScore) {
    return null;
  }

  // Check eligibility
  if (trustScore.isPermanentlyBanned) {
    return null;
  }

  if (trustScore.score < TRUST_CONFIG.RECOVERY.BONUS_THRESHOLD) {
    return null;
  }

  if (trustScore.score >= TRUST_CONFIG.MAX_SCORE) {
    return null;
  }

  // Check cooldown
  const lastBonus = trustScore.lastBonusAt;
  if (lastBonus) {
    const daysSinceLastBonus = (Date.now() - lastBonus.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceLastBonus < TRUST_CONFIG.RECOVERY.RECOVERY_COOLDOWN_DAYS) {
      return null;
    }
  }

  // Apply bonus (capped)
  const currentMonth = new Date().getMonth();
  const lastBonusMonth = lastBonus ? lastBonus.getMonth() : -1;
  
  // Only one bonus per month
  if (currentMonth === lastBonusMonth) {
    return null;
  }

  const bonusPoints = TRUST_CONFIG.RECOVERY.PERIODIC_BONUS;
  const newScore = Math.min(TRUST_CONFIG.MAX_SCORE, trustScore.score + bonusPoints);

  trustScore.score = newScore;
  trustScore.accessLevel = calculateAccessLevel(newScore);
  trustScore.lastBonusAt = new Date();
  trustScore.updatedAt = new Date();

  // Add to recovery history
  trustScore.recoveryHistory.push({
    pointsAdded: bonusPoints,
    reason: 'Monthly consistent behavior bonus'
  });

  await trustScore.save();

  // Also update the User's creditScore field
  const User = mongoose.model('User');
  await User.findByIdAndUpdate(workerId, { creditScore: newScore });

  return trustScore;
}

/**
 * Reduce strike after a period of good behavior
 * @param {string} workerId - Worker's user ID
 * @returns {Object} Updated trust score object
 */
async function reduceStrike(workerId) {
  let trustScore = await TrustScore.findOne({ workerId });
  if (!trustScore || trustScore.strikes === 0) {
    return trustScore;
  }

  // Reduce strike if score is improving
  if (trustScore.score >= 50) {
    trustScore.strikes = Math.max(0, trustScore.strikes - 1);
    trustScore.updatedAt = new Date();
    await trustScore.save();
  }

  return trustScore;
}

/**
 * Get worker's current trust status
 * @param {string} workerId - Worker's user ID
 * @returns {Object} Trust status object
 */
async function getTrustStatus(workerId) {
  let trustScore = await TrustScore.findOne({ workerId });
  
  if (!trustScore) {
    // Create default trust score for new workers
    trustScore = new TrustScore({ workerId });
    await trustScore.save();
  }

  // Check if temporary suspension has expired
  if (trustScore.isTemporarilySuspended && trustScore.suspensionExpiresAt) {
    if (new Date() > trustScore.suspensionExpiresAt) {
      trustScore.isTemporarilySuspended = false;
      trustScore.suspensionExpiresAt = null;
      trustScore.updatedAt = new Date();
      await trustScore.save();
    }
  }

  const accessLevelConfig = TRUST_CONFIG.ACCESS_LEVELS[trustScore.accessLevel];
  
  return {
    score: trustScore.score,
    maxScore: TRUST_CONFIG.MAX_SCORE,
    strikes: trustScore.strikes,
    accessLevel: trustScore.accessLevel,
    accessLevelLabel: accessLevelConfig?.label || 'Unknown',
    accessLevelColor: accessLevelConfig?.color || '#6B7280',
    isTemporarilySuspended: trustScore.isTemporarilySuspended,
    isPermanentlyBanned: trustScore.isPermanentlyBanned,
    suspensionExpiresAt: trustScore.suspensionExpiresAt,
    canApplyForJobs: !trustScore.isTemporarilySuspended && !trustScore.isPermanentlyBanned,
    totalViolations: trustScore.totalViolations,
    recentViolations: trustScore.violationHistory.slice(-5).reverse()
  };
}

/**
 * Check if worker can perform certain actions based on trust level
 * @param {string} workerId - Worker's user ID
 * @param {string} action - Action to check
 * @returns {Object} Permission result
 */
async function checkPermission(workerId, action) {
  const status = await getTrustStatus(workerId);
  
  if (status.isPermanentlyBanned) {
    return { allowed: false, reason: 'Account permanently banned due to repeated violations' };
  }

  if (status.isTemporarilySuspended) {
    return { 
      allowed: false, 
      reason: `Temporarily suspended. Suspension expires on ${status.suspensionExpiresAt?.toDateString()}` 
    };
  }

  // Action-specific permissions based on access level
  const permissions = {
    'apply_for_jobs': {
      'PREMIUM': true,
      'TRUSTED': true,
      'STANDARD': true,
      'RESTRICTED': true,
      'SUSPENDED': false
    },
    'priority_matching': {
      'PREMIUM': true,
      'TRUSTED': true,
      'STANDARD': false,
      'RESTRICTED': false,
      'SUSPENDED': false
    },
    'create_dispute': {
      'PREMIUM': true,
      'TRUSTED': true,
      'STANDARD': true,
      'RESTRICTED': true,
      'SUSPENDED': false
    },
    'view_ratings': {
      'PREMIUM': true,
      'TRUSTED': true,
      'STANDARD': true,
      'RESTRICTED': true,
      'SUSPENDED': false
    }
  };

  const allowed = permissions[action]?.[status.accessLevel] ?? false;
  
  return { 
    allowed, 
    reason: allowed ? null : `Action not available for ${status.accessLevelLabel} workers`,
    currentScore: status.score,
    accessLevel: status.accessLevel
  };
}

/**
 * Get trust leaderboard (workers with highest scores)
 * @param {number} limit - Number of workers to return
 * @returns {Array} Array of top workers
 */
async function getTrustLeaderboard(limit = 10) {
  return await TrustScore.find({ 
    isPermanentlyBanned: false,
    score: { $gt: 0 }
  })
  .sort({ score: -1, totalViolations: 1 })
  .limit(limit)
  .populate('workerId', 'name phoneNumber');
}

/**
 * Get workers requiring attention (low scores)
 * @param {number} threshold - Score threshold
 * @returns {Array} Array of workers below threshold
 */
async function getWorkersNeedingAttention(threshold = 50) {
  return await TrustScore.find({ 
    score: { $lt: threshold },
    isPermanentlyBanned: false
  })
  .sort({ score: 1 })
  .populate('workerId', 'name phoneNumber');
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
  TRUST_CONFIG,
  TrustScore,
  applyViolation,
  rewardCompletedJob,
  applyPeriodicBonus,
  reduceStrike,
  getTrustStatus,
  checkPermission,
  getTrustLeaderboard,
  getWorkersNeedingAttention,
  calculateAccessLevel
};
