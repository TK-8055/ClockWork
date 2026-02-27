import { API_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from './auth';

const getToken = async () => {
  return await AsyncStorage.getItem('auth_token');
};

// ==================== AUTH API ====================

export const validateToken = async () => {
  const token = await getToken();
  if (!token) return null;
  
  try {
    const response = await fetch(`${API_URL}/auth/validate`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (response.status === 401) {
      await authService.logout();
      return null;
    }
    return response.json();
  } catch (error) {
    return null;
  }
};

// ==================== CREDIT API ====================

export const getCredits = async () => {
  const token = await getToken();
  const response = await fetch(`${API_URL}/credits`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

export const topUpCredits = async (amount) => {
  const token = await getToken();
  const response = await fetch(`${API_URL}/credits/top-up`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ amount }),
  });
  return response.json();
};

// ==================== JOB API ====================

export const getJobs = async (status) => {
  const url = status ? `${API_URL}/jobs?status=${status}` : `${API_URL}/jobs`;
  const response = await fetch(url);
  return response.json();
};

export const getJobById = async (id) => {
  const response = await fetch(`${API_URL}/jobs/${id}`);
  return response.json();
};

export const postJob = async (jobData) => {
  const token = await getToken();
  const response = await fetch(`${API_URL}/jobs`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(jobData),
  });
  return response.json();
};

export const applyJob = async (jobId, workerData = {}) => {
  const token = await getToken();
  const response = await fetch(`${API_URL}/jobs/${jobId}/apply`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(workerData),
  });
  return response.json();
};

export const selectWorker = async (jobId, workerId) => {
  const token = await getToken();
  const response = await fetch(`${API_URL}/jobs/${jobId}/select-worker`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ workerId }),
  });
  return response.json();
};

export const startWork = async (jobId) => {
  const token = await getToken();
  const response = await fetch(`${API_URL}/jobs/${jobId}/start-work`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  });
  return response.json();
};

export const submitCompletion = async (jobId, completionData) => {
  const token = await getToken();
  const response = await fetch(`${API_URL}/jobs/${jobId}/submit-completion`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(completionData),
  });
  return response.json();
};

export const verifyJob = async (jobId, verificationData) => {
  const token = await getToken();
  const response = await fetch(`${API_URL}/jobs/${jobId}/verify`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(verificationData),
  });
  return response.json();
};

// ==================== APPLICATION API ====================

export const getApplications = async (jobId) => {
  const token = await getToken();
  const url = jobId 
    ? `${API_URL}/applications?jobId=${jobId}` 
    : `${API_URL}/applications`;
  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

export const getJobApplications = async (jobId) => {
  const token = await getToken();
  const response = await fetch(`${API_URL}/jobs/${jobId}/applications`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

// ==================== WORKER PROFILE API ====================

export const getWorkerProfile = async () => {
  const token = await getToken();
  const response = await fetch(`${API_URL}/worker/profile`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

export const updateWorkerProfile = async (data) => {
  const token = await getToken();
  const response = await fetch(`${API_URL}/worker/profile`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

// ==================== PENALTY API ====================

export const reportPenalty = async (penaltyData) => {
  const token = await getToken();
  const response = await fetch(`${API_URL}/penalty/report`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(penaltyData),
  });
  return response.json();
};

export const getPenalties = async () => {
  const token = await getToken();
  const response = await fetch(`${API_URL}/penalties`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

// ==================== DISPUTE API ====================

export const createDispute = async (disputeData) => {
  const token = await getToken();
  const response = await fetch(`${API_URL}/disputes`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(disputeData),
  });
  return response.json();
};

export const getDisputes = async () => {
  const token = await getToken();
  const response = await fetch(`${API_URL}/disputes`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

export const updateUserProfile = async (data) => {
  const token = await getToken();
  const response = await fetch(`${API_URL}/user/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

// ==================== NOTIFICATION API ====================

export const getNotifications = async () => {
  const token = await getToken();
  const response = await fetch(`${API_URL}/notifications`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

export const markNotificationRead = async (notificationId) => {
  const token = await getToken();
  const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

export const markAllNotificationsRead = async () => {
  const token = await getToken();
  const response = await fetch(`${API_URL}/notifications/read-all`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

// ==================== JOB API EXPORT ====================

export const jobAPI = {
  getJobs,
  getJobById,
  postJob,
  applyJob,
  selectWorker,
  startWork,
  submitCompletion,
  verifyJob,
};
