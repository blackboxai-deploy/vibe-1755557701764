// In-memory storage for job status (in production, use Redis or database)
const jobStatuses = new Map<string, {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
  result?: any;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}>();

// Helper function to create a new job
export function createJob(jobId: string, message: string = 'Job created') {
  jobStatuses.set(jobId, {
    status: 'pending',
    progress: 0,
    message,
    createdAt: new Date(),
    updatedAt: new Date()
  });
}

// Helper function to update job status
export function updateJobStatus(
  jobId: string, 
  updates: Partial<{
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    message: string;
    result: any;
    error: string;
  }>
) {
  const currentJob = jobStatuses.get(jobId);
  if (currentJob) {
    jobStatuses.set(jobId, {
      ...currentJob,
      ...updates,
      updatedAt: new Date()
    });
  }
}

// Helper function to get job status
export function getJobStatus(jobId: string) {
  return jobStatuses.get(jobId);
}

// Helper function to delete job
export function deleteJob(jobId: string) {
  jobStatuses.delete(jobId);
}

// Cleanup function to remove old jobs
export function cleanupOldJobs() {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  for (const [jobId, job] of jobStatuses.entries()) {
    if (job.updatedAt < oneHourAgo && (job.status === 'completed' || job.status === 'failed')) {
      jobStatuses.delete(jobId);
    }
  }
}

// Run cleanup every 30 minutes
setInterval(cleanupOldJobs, 30 * 60 * 1000);