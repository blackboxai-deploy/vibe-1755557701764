export interface Scene {
  id: string;
  title: string;
  description: string;
  visualCues: string;
  dialogue?: string;
  cameraAngle?: string;
  lighting?: string;
  duration?: number;
}

export interface ScriptGenerationRequest {
  prompt: string;
  userId?: string;
}

export interface ScriptGenerationResponse {
  success: boolean;
  scenes: Scene[];
  jobId: string;
  error?: string;
}

export interface VideoGenerationRequest {
  scenes: Scene[];
  jobId: string;
  quality?: 'standard' | 'high';
  duration?: number;
}

export interface GeneratedVideo {
  sceneId: string;
  videoUrl: string;
  thumbnailUrl?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  duration?: number;
  error?: string;
}

export interface VideoData {
  id: string;
  sceneId: string;
  title: string;
  videoUrl: string;
  thumbnailUrl?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  duration?: number;
  error?: string;
  scene?: Scene;
  prompt?: string;
  progress?: number;
  metadata?: {
    resolution?: string;
    fps?: number;
    fileSize?: number;
  };
}

export interface VideoGenerationResponse {
  success: boolean;
  videos: GeneratedVideo[];
  jobId: string;
  error?: string;
}

export interface JobStatus {
  jobId: string;
  status: 'pending' | 'script_generation' | 'video_generation' | 'completed' | 'failed';
  progress: number;
  currentStep: string;
  scenes?: Scene[];
  videos?: GeneratedVideo[];
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIClientConfig {
  customerId: string;
  apiKey: string;
  baseUrl: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ReplicateVideoRequest {
  input: {
    prompt: string;
    duration?: number;
    aspect_ratio?: string;
    quality?: string;
  };
}

export interface ReplicateVideoResponse {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  output?: string[];
  error?: string;
  logs?: string;
  metrics?: {
    predict_time?: number;
  };
}

export interface AppState {
  currentStep: 'input' | 'generating_script' | 'script_ready' | 'generating_videos' | 'completed' | 'error';
  userPrompt: string;
  jobId?: string;
  scenes: Scene[];
  videos: GeneratedVideo[];
  progress: number;
  error?: string;
  isLoading: boolean;
}

export interface ProgressStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  progress?: number;
}