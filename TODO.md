# TODO - ClockWork Bug Fixes

## Phase 1: Fix Hardcoded API URLs (7 files)
- [x] 1.1 Fix HomeScreen.js - replace `http://10.96.154.115:3000/api/jobs` with `${API_URL}/jobs`
- [x] 1.2 Fix MapScreen.js - replace hardcoded URL with API_URL
- [x] 1.3 Fix JobDetailsScreen.js - replace hardcoded URLs with API_URL
- [x] 1.4 Fix JobListScreen.js - replace hardcoded URL with API_URL
- [x] 1.5 Fix SearchScreen.js - replace hardcoded URL with API_URL
- [x] 1.6 Fix PostJobScreen.js - replace hardcoded URL with API_URL
- [x] 1.7 Fix NotificationsScreen.js - replace hardcoded URLs with API_URL

## Phase 2: Fix Map Radius Filtering
- [x] 2.1 Add distance calculation utility
- [x] 2.2 Update MapScreen.js to filter jobs by radius
- [x] 2.3 Add custom radius option

## Phase 3: Fix Worker/User UI Differentiation
- [x] 3.1 Update TabNavigator to ensure Post is hidden for workers
- [x] 3.2 Update PostWorkScreen.js to properly redirect workers
- [x] 3.3 Remove duplicate PostJobScreen.js (keep PostWorkScreen.js)

## Phase 4: Improve History Screen
- [x] 4.1 Add detailed job status timeline for users
- [x] 4.2 Add application status timeline for workers
- [x] 4.3 Add more details to history cards

## Phase 5: Fix Logic Issues
- [x] 5.1 Fix any sync issues in auth context
- [x] 5.2 Fix job application logic

---

## Completed Tasks:
