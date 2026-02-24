import { API_URL } from '../config';

const getToken = async () => {
  const token = await require('@react-native-async-storage/async-storage').default.getItem('token');
  return token;
};

export const getJobs = async () => {
  const response = await fetch(`${API_URL}/jobs`);
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

export const applyJob = async (jobId, workerData) => {
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

export const getApplications = async () => {
  const token = await getToken();
  const response = await fetch(`${API_URL}/applications`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

export const jobAPI = {
  getJobs,
  getJobById,
  postJob,
  applyJob,
};
