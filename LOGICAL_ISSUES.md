# Logical Issues in ClockWork App

## ✅ WORKING CORRECTLY (Keep OTP Bypass)
- OTP bypass in DEV_MODE ✅
- Role-based navigation ✅
- Database connection ✅
- API endpoints ✅

## 🔴 CRITICAL LOGICAL ISSUES

### 1. **PostWorkScreen Still Has Local Storage Fallback**
**Problem**: When API fails, job is saved to AsyncStorage `local_jobs` which is never read by other screens
**Location**: `PostWorkScreen.js` lines 90-120
**Impact**: Jobs posted offline are invisible to other users
**Fix**: Remove local storage fallback, show error if API fails

### 2. **Credits Display Inconsistency**
**Problem**: 
- HomeScreen shows "Credits" ✅
- PostWorkScreen shows "₹" (rupees) ❌
- AccountScreen shows "Credits" ✅
**Location**: `PostWorkScreen.js` line 177
**Impact**: User confusion - are credits money or points?
**Fix**: Change all ₹ to "Credits"

### 3. **Worker Can Access PostWorkScreen**
**Problem**: Worker role check happens AFTER screen loads, shows form briefly
**Location**: `PostWorkScreen.js` lines 24-42
**Impact**: Bad UX - worker sees form then gets kicked out
**Fix**: Check role in TabNavigator (already done) but PostWorkScreen still accessible via direct navigation

### 4. **Role Switching Without Reload**
**Problem**: User can switch role in AccountScreen but app doesn't reload navigation
**Location**: `AccountScreen.js` lines 107-127
**Impact**: Worker switches to User but still can't see Post tab until app restart
**Fix**: Force navigation reload or restart app after role change

### 5. **Missing Backend Endpoint**
**Problem**: AccountScreen tries to update profile via `/api/user/profile` but backend doesn't have this endpoint
**Location**: `AccountScreen.js` line 82
**Impact**: Profile updates fail silently
**Fix**: Add `/api/user/profile` PUT endpoint to backend

### 6. **User Data Sync Issues**
**Problem**: Multiple sources of user data:
- `user_data` in AsyncStorage
- `user` in AsyncStorage (alternate)
- Worker profile from API
- User object from backend
**Location**: `AccountScreen.js` lines 17-48
**Impact**: Data inconsistency, stale data
**Fix**: Single source of truth for user data

### 7. **Credits Not Synced**
**Problem**: Credits updated in AsyncStorage but not synced with backend
**Location**: `PostWorkScreen.js` lines 122-126
**Impact**: Credits lost on logout, not shared across devices
**Fix**: Always update credits via API, not AsyncStorage

### 8. **No Error Handling for Failed API Calls**
**Problem**: Many screens don't show errors when API fails
**Location**: Multiple screens
**Impact**: Silent failures, user doesn't know what went wrong
**Fix**: Add error alerts for all API failures

### 9. **Trust System Not Implemented**
**Problem**: TRUST_SYSTEM.md exists but no code implements it
**Location**: `docs/TRUST_SYSTEM.md` vs actual code
**Impact**: Workers can misbehave without consequences
**Fix**: Implement trust score system or remove documentation

### 10. **Payment Amount Confusion**
**Problem**: 
- Job shows `paymentAmount` (total)
- Worker gets `workerPayment` (after 10% fee)
- But UI sometimes shows wrong amount
**Location**: Multiple screens
**Impact**: Workers expect ₹500 but get ₹450
**Fix**: Always show both amounts clearly

## ⚠️ MEDIUM ISSUES

### 11. **No Validation on Job Posting**
**Problem**: Can post job with 0 payment, empty fields pass basic checks
**Location**: `PostWorkScreen.js` lines 66-70
**Impact**: Invalid jobs in database
**Fix**: Add proper validation (min payment, max length, etc.)

### 12. **Location Fallback to Kuniyamuthur**
**Problem**: If GPS fails, always defaults to same location
**Location**: Multiple screens
**Impact**: All failed GPS jobs show same location
**Fix**: Ask user to enter location manually

### 13. **No Job Expiry**
**Problem**: Jobs stay forever, no auto-close after time
**Location**: Backend
**Impact**: Old jobs clutter the list
**Fix**: Add expiry date to jobs

### 14. **No Pagination**
**Problem**: All jobs loaded at once
**Location**: API calls
**Impact**: Slow performance with many jobs
**Fix**: Add pagination (limit 20 per page)

### 15. **No Image Upload Implementation**
**Problem**: "Upload Image" button does nothing
**Location**: `PostWorkScreen.js` line 186
**Impact**: Users can't add job photos
**Fix**: Implement image picker and upload

## 💡 MINOR ISSUES

### 16. **Hardcoded Categories**
**Problem**: Categories hardcoded in multiple files
**Location**: Multiple screens
**Impact**: Hard to add new categories
**Fix**: Store categories in backend config

### 17. **No Search History**
**Problem**: SearchScreen doesn't save recent searches
**Location**: `SearchScreen.js`
**Impact**: Users retype same searches
**Fix**: Save search history in AsyncStorage

### 18. **No Job Favorites**
**Problem**: Can't save jobs for later
**Location**: All screens
**Impact**: Users can't bookmark interesting jobs
**Fix**: Add favorites feature

### 19. **No Push Notifications**
**Problem**: Users don't get notified of new jobs/applications
**Location**: Entire app
**Impact**: Users miss opportunities
**Fix**: Implement push notifications

### 20. **No Offline Mode**
**Problem**: App doesn't work without internet
**Location**: All API calls
**Impact**: Can't use app in poor network
**Fix**: Add offline caching

## 🛠️ PRIORITY FIXES

### Must Fix Now:
1. Remove local_jobs fallback from PostWorkScreen
2. Add `/api/user/profile` endpoint to backend
3. Fix credits display (all should say "Credits")
4. Add error alerts for API failures
5. Force app reload after role change

### Should Fix Soon:
6. Implement proper validation
7. Add pagination
8. Fix payment amount display
9. Manual location entry
10. Image upload

### Nice to Have:
11. Trust system
12. Job expiry
13. Push notifications
14. Offline mode
15. Favorites

## 📝 Code Fixes Needed

See next message for actual code fixes...
