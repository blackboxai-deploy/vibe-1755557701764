import { NextRequest, NextResponse } from 'next/server';
import { createJob, updateJobStatus, getJobStatus } from '@/lib/job-manager';

interface Scene {
  id: number;
  title: string;
  description: string;
}

interface VideoGenerationRequest {
  scenes: Scene[];
  jobId: string;
}

interface VideoResult {
  sceneId: number;
  videoUrl: string;
  status: 'completed' | 'failed';
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { scenes, jobId }: VideoGenerationRequest = await request.json();

    if (!scenes || !Array.isArray(scenes) || scenes.length === 0) {
      return NextResponse.json(
        { error: 'Invalid scenes data provided' },
        { status: 400 }
      );
    }

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Initialize job status
    createJob(jobId, 'Starting video generation...');
    updateJobStatus(jobId, {
      status: 'processing',
      progress: 0,
      result: { videos: [] }
    });

    // Start video generation process asynchronously
    generateVideosAsync(scenes, jobId);

    return NextResponse.json({
      success: true,
      jobId,
      message: 'Video generation started',
      estimatedTime: '5-15 minutes per video'
    });

  } catch (error) {
    console.error('Error in video generation API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function generateVideosAsync(scenes: Scene[], jobId: string) {
  try {
    const videos: VideoResult[] = [];
    const totalScenes = scenes.length;

    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      
      try {
        // Update progress
        const progress = Math.round((i / totalScenes) * 100);
        updateJobStatus(jobId, {
          status: 'processing',
          progress,
          message: `Generating video ${i + 1} of ${totalScenes}: ${scene.title}`,
          result: { videos: [...videos] }
        });

        // Generate video for this scene
        const videoUrl = await generateSingleVideo(scene);
        
        videos.push({
          sceneId: scene.id,
          videoUrl,
          status: 'completed'
        });

      } catch (error) {
        console.error(`Error generating video for scene ${scene.id}:`, error);
        videos.push({
          sceneId: scene.id,
          videoUrl: '',
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Update final status
    updateJobStatus(jobId, {
      status: 'completed',
      progress: 100,
      message: 'All videos generated successfully!',
      result: { videos }
    });

  } catch (error) {
    console.error('Error in async video generation:', error);
    updateJobStatus(jobId, {
      status: 'failed',
      progress: 0,
      message: 'Video generation failed',
      result: { videos: [] },
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function generateSingleVideo(scene: Scene): Promise<string> {
  try {
    // Optimize scene description for video generation
    const optimizedPrompt = optimizeSceneForVideo(scene);

    const response = await fetch('https://oi-server.onrender.com/chat/completions', {
      method: 'POST',
      headers: {
        'customerId': 'cus_SGPn4uhjPI0F4w',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer xxx'
      },
      body: JSON.stringify({
        model: "replicate/google/veo-3",
        messages: [
          {
            role: "user",
            content: optimizedPrompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Video API error: ${response.status}`);
    }

    const result = await response.json();
    
    // The custom endpoint should return the video URL directly
    if (result.choices && result.choices[0] && result.choices[0].message) {
      return result.choices[0].message.content;
    }
    
    throw new Error('Invalid response format from video API');

  } catch (error) {
    console.error('Error generating single video:', error);
    throw error;
  }
}

function optimizeSceneForVideo(scene: Scene): string {
  // Enhance scene description with cinematic elements for better video generation
  const cinematicElements = [
    "cinematic lighting",
    "professional camera work",
    "high quality",
    "detailed",
    "realistic"
  ];

  const optimized = `${scene.description}. ${cinematicElements.join(', ')}.`;
  
  // Ensure prompt is within reasonable length limits
  return optimized.length > 500 ? optimized.substring(0, 497) + '...' : optimized;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');

  if (!jobId) {
    return NextResponse.json(
      { error: 'Job ID is required' },
      { status: 400 }
    );
  }

  const status = getJobStatus(jobId);

  if (!status) {
    return NextResponse.json(
      { error: 'Job not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(status);
}