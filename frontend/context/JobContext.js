import React, { createContext, useState } from 'react';
import { dummyJobs } from '../data/dummyJobs';

export const JobContext = createContext();

export const JobProvider = ({ children }) => {
  const [jobs, setJobs] = useState(dummyJobs);
  const [acceptedJob, setAcceptedJob] = useState(null);

  const addJob = (newJob) => {
    const job = {
      ...newJob,
      id: Date.now().toString(),
      status: 'POSTED'
    };
    setJobs([...jobs, job]);
  };

  const acceptJob = (jobId) => {
    const updatedJobs = jobs.map(job =>
      job.id === jobId ? { ...job, status: 'ACCEPTED' } : job
    );
    setJobs(updatedJobs);
    const accepted = updatedJobs.find(job => job.id === jobId);
    setAcceptedJob(accepted);
  };

  const completeJob = (jobId) => {
    const updatedJobs = jobs.map(job =>
      job.id === jobId ? { ...job, status: 'COMPLETED' } : job
    );
    setJobs(updatedJobs);
    setAcceptedJob(null);
  };

  return (
    <JobContext.Provider value={{ jobs, acceptedJob, addJob, acceptJob, completeJob }}>
      {children}
    </JobContext.Provider>
  );
};
