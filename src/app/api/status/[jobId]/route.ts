import { NextRequest, NextResponse } from 'next/server';
import { getJobStatus, deleteJob } from '@/lib/job-manager';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    const jobStatus = getJobStatus(jobId);

    if (!jobStatus) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Clean up completed jobs older than 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (jobStatus.status === 'completed' && jobStatus.updatedAt < oneHourAgo) {
      deleteJob(jobId);
      return NextResponse.json(
        { error: 'Job expired' },
        { status: 410 }
      );
    }

    return NextResponse.json({
      jobId,
      status: jobStatus.status,
      progress: jobStatus.progress,
      message: jobStatus.message,
      result: jobStatus.result,
      error: jobStatus.error,
      createdAt: jobStatus.createdAt.toISOString(),
      updatedAt: jobStatus.updatedAt.toISOString()
    });

  } catch (error) {
    console.error('Error fetching job status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}