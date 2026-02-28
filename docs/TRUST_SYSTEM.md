# ClockWork Trust & Reliability Management System

## Overview

The Trust System is designed to manage worker reliability in a gig-worker platform. Workers start with full trust (100 points) and can earn or lose points based on their behavior.

---

## Core Principles

1. **Workers begin fully trusted** - Every worker starts with 100 trust points
2. **Bad actions reduce trust** - Violations like no-shows, cancellations, and misconduct deduct points
3. **Worse actions deduct more** - More severe violations result in larger point deductions and strikes
4. **Trust limits opportunities** - As trust drops, access to jobs and features is progressively restricted
5. **Very low trust = suspension** - Workers with extremely low scores face temporary or permanent suspension
6. **Good behavior restores trust** - Consistent good performance can recover points (but never above max)

---

## Trust Score Configuration

### Initial State
```
INITIAL_SCORE: 100
MAX_SCORE: 100
```

### Access Levels (Score Ranges)

| Level | Score Range | Label | Color | Description |
|-------|-------------|-------|-------|-------------|
| PREMIUM | 90-100 | Premium Worker | Green | Highest trust, priority access |
| TRUSTED | 70-89 | Trusted Worker | Blue | Good standing, full access |
| STANDARD | 50-69 | Standard Worker | Yellow | Normal access |
| RESTRICTED | 30-49 | Restricted Worker | Orange | Limited access |
| SUSPENDED | 0-29 | Suspended | Red | No access, under review |

---

## Violations & Penalties

### Penalty Schedule

| Violation | Points Deducted | Strikes Added | Description |
|-----------|-----------------|---------------|-------------|
| NO_SHOW | 25 | 2 | Worker did not show up for the job |
| LATE_CANCELLATION | 15 | 1 | Cancelled less than 2 hours before job |
| EARLY_CANCELLATION | 5 | 0 | Cancelled more than 2 hours before job |
| MISCONDUCT | 30 | 3 | Inappropriate behavior or misconduct |
| POOR_WORK | 20 | 2 | Work quality was unsatisfactory |
| FALSE_DISPUTE | 15 | 1 | Worker raised false dispute |
| FALSE_REPORT | 10 | 1 | False work completion report |
| LATE_ARRIVAL | 5 | 0 | Arrived more than 15 minutes late |

---

## Strike System

### Strike Rules
- **Strike accumulation**: Workers accumulate strikes for each violation
- **3 strikes = automatic suspension**: Workers with 3+ strikes receive a 7-day temporary suspension
- **Strike reduction**: Strikes can be reduced over time with good behavior (when score ≥ 50)

---

## Suspension Logic

### Temporary Suspension
- **Trigger**: Score falls below 20 OR 3+ strikes accumulated
- **Duration**: 7 days
- **Effects**: Cannot apply for jobs, limited platform access
- **Lift condition**: Score rises above 20

### Permanent Ban
- **Trigger**: Score reaches 0
- **Duration**: Indefinite
- **Effects**: Complete platform access removal
- **Recovery**: Cannot be recovered

---

## Recovery Mechanism

### Job Completion Bonus
```
Points per successful job: +2
```
- Automatically applied when a job is verified as complete
- Score cannot exceed MAX_SCORE (100)
- Helps workers recover from minor violations

### Monthly Consistency Bonus
```
Points per month: +5
Requirements:
  - Score must be ≥ 95
  - At least 30 days since last bonus
  - Maximum one bonus per month
```

### Strike Reduction
```
Condition: Score ≥ 50
Effect: -1 strike per month of consistent good behavior
```

---

## Pseudocode

### 1. Apply Violation

```
javascript
FUNCTION applyViolation(workerId, violationType, jobId):
    violation = GET_VIOLATION_CONFIG(violationType)
    
    trustScore = GET_OR_CREATE_TRUST_SCORE(workerId)
    
    // Deduct points
    newScore = MAX(0, trustScore.score - violation.points)
    newStrikes = trustScore.strikes + violation.strikes
    
    // Check suspension conditions
    IF newScore == 0 OR trustScore.isPermanentlyBanned:
        SET isPermanentlyBanned = TRUE
        SET isTemporarilySuspended = FALSE
    ELSE IF newStrikes >= 3 OR newScore < 20:
        SET isTemporarilySuspended = TRUE
        SET suspensionExpiresAt = NOW + 7 DAYS
    END IF
    
    // Update trust score
    trustScore.score = newScore
    trustScore.strikes = newStrikes
    trustScore.accessLevel = CALCULATE_ACCESS_LEVEL(newScore)
    trustScore.isTemporarilySuspended = isTemporarilySuspended
    trustScore.isPermanentlyBanned = isPermanentlyBanned
    
    // Log violation
    ADD_TO_HISTORY(trustScore.violationHistory, violation)
    
    SAVE(trustScore)
    UPDATE_USER_CREDIT_SCORE(workerId, newScore)
    
    RETURN trustScore
```

### 2. Reward Completed Job

```
javascript
FUNCTION rewardCompletedJob(workerId, jobId):
    trustScore = GET_OR_CREATE_TRUST_SCORE(workerId)
    
    // Skip if banned or at max
    IF trustScore.isPermanentlyBanned OR trustScore.score >= MAX_SCORE:
        RETURN trustScore
    
    // Add bonus points
    bonusPoints = 2
    newScore = MIN(MAX_SCORE, trustScore.score + bonusPoints)
    
    trustScore.score = newScore
    trustScore.accessLevel = CALCULATE_ACCESS_LEVEL(newScore)
    
    // Check if suspension should be lifted
    IF trustScore.isTemporarilySuspended AND newScore >= 20:
        trustScore.isTemporarilySuspended = FALSE
        trustScore.suspensionExpiresAt = NULL
    END IF
    
    ADD_TO_HISTORY(trustScore.recoveryHistory, bonusPoints, "Job completed")
    SAVE(trustScore)
    UPDATE_USER_CREDIT_SCORE(workerId, newScore)
    
    RETURN trustScore
```

### 3. Get Trust Status

```
javascript
FUNCTION getTrustStatus(workerId):
    trustScore = GET_OR_CREATE_TRUST_SCORE(workerId)
    
    // Check if temporary suspension expired
    IF trustScore.isTemporarilySuspended AND trustScore.suspensionExpiresAt < NOW:
        trustScore.isTemporarilySuspended = FALSE
        trustScore.suspensionExpiresAt = NULL
        SAVE(trustScore)
    END IF
    
    RETURN {
        score: trustScore.score,
        maxScore: 100,
        strikes: trustScore.strikes,
        accessLevel: trustScore.accessLevel,
        accessLevelLabel: GET_ACCESS_LABEL(trustScore.accessLevel),
        isTemporarilySuspended: trustScore.isTemporarilySuspended,
        isPermanentlyBanned: trustScore.isPermanentlyBanned,
        canApplyForJobs: NOT trustScore.isTemporarilySuspended AND NOT trustScore.isPermanentlyBanned,
        recentViolations: GET_LAST_N(trustScore.violationHistory, 5)
    }
```

### 4. Check Permission

```
javascript
FUNCTION checkPermission(workerId, action):
    status = getTrustStatus(workerId)
    
    IF status.isPermanentlyBanned:
        RETURN { allowed: FALSE, reason: "Permanently banned" }
    
    IF status.isTemporarilySuspended:
        RETURN { allowed: FALSE, reason: "Temporarily suspended until " + status.suspensionExpiresAt }
    
    // Get permission matrix for action
    permissions = PERMISSION_MATRIX[action]
    
    RETURN {
        allowed: permissions[status.accessLevel],
        reason: NULL IF allowed ELSE "Not available for " + status.accessLevelLabel
    }
```

---

## API Endpoints

### GET /api/trust/:workerId
Get worker's current trust status

**Response:**
```
json
{
  "score": 85,
  "maxScore": 100,
  "strikes": 1,
  "accessLevel": "TRUSTED",
  "accessLevelLabel": "Trusted Worker",
  "accessLevelColor": "#3B82F6",
  "isTemporarilySuspended": false,
  "isPermanentlyBanned": false,
  "canApplyForJobs": true,
  "totalViolations": 2,
  "recentViolations": [...]
}
```

### GET /api/trust/leaderboard
Get top workers by trust score

### GET /api/trust/attention-needed
Get workers with scores below threshold

---

## Frontend Integration

### Trust Score Display
The trust score should be displayed in the Account Screen with:
- Current score (large, prominent)
- Access level badge with color coding
- Progress bar showing trust level
- Recent violations list

### Access Level Badges
- **Premium**: Green badge with star icon
- **Trusted**: Blue badge
- **Standard**: Yellow badge
- **Restricted**: Orange badge with warning
- **Suspended**: Red badge with lock icon

### Job Application Blocking
Before allowing a worker to apply for a job:
1. Call `checkPermission(workerId, 'apply_for_jobs')`
2. If not allowed, show blocking message with reason
3. Display trust score recovery suggestions

---

## System Rules Summary

1. **Start**: Every worker begins with 100 points (Premium)
2. **Deduct**: Points are deducted based on violation severity
3. **Accumulate**: Strikes add up for serious violations
4. **Restrict**: Lower scores = fewer opportunities
5. **Suspend**: Score < 20 OR 3 strikes = 7-day suspension
6. **Ban**: Score = 0 = permanent removal
7. **Recover**: +2 points per completed job (max 100)
8. **Bonus**: Monthly +5 points for consistent good behavior (score ≥ 95)
9. **Cap**: Trust can never exceed 100 points
