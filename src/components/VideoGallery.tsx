"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Download, Share2, Clock, Film } from 'lucide-react';
import { VideoData } from '@/lib/types';

interface VideoGalleryProps {
  videos: VideoData[];
  isLoading?: boolean;
  onVideoPlay?: (videoId: string) => void;
  onVideoDownload?: (videoId: string) => void;
  onVideoShare?: (videoId: string) => void;
}

export function VideoGallery({ 
  videos, 
  isLoading = false, 
  onVideoPlay, 
  onVideoDownload, 
  onVideoShare 
}: VideoGalleryProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(5)].map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <div className="aspect-video bg-gray-200 animate-pulse" />
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-5/6" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-4/6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <Film className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No videos generated yet</h3>
        <p className="text-gray-500">Enter a movie scene prompt to start generating videos</p>
      </div>
    );
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Generated Videos</h2>
        <Badge variant="secondary" className="text-sm">
          {videos.length} scene{videos.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video, index) => (
          <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative aspect-video bg-black">
              {video.status === 'completed' && video.videoUrl ? (
                <video
                  className="w-full h-full object-cover"
                  poster={video.thumbnailUrl}
                  preload="metadata"
                  controls
                >
                  <source src={video.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : video.status === 'processing' ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-white">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                    <p className="text-sm">Generating video...</p>
                  </div>
                </div>
              ) : video.status === 'failed' ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-red-400">
                    <Film className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">Generation failed</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-400">
                    <Film className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">Waiting to process</p>
                  </div>
                </div>
              )}

              {video.status === 'completed' && (
                <div className="absolute top-2 right-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 w-8 p-0"
                    onClick={() => onVideoPlay?.(video.id)}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <div className="absolute bottom-2 left-2">
                <Badge className={getStatusColor(video.status)}>
                  {video.status}
                </Badge>
              </div>

              {video.duration && (
                <div className="absolute bottom-2 right-2">
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDuration(video.duration)}
                  </Badge>
                </div>
              )}
            </div>

            <CardHeader>
              <CardTitle className="text-lg">
                Scene {index + 1}: {video.title}
              </CardTitle>
              <CardDescription className="text-sm">
                {video.scene?.description ? (
                  video.scene.description.length > 100 
                    ? `${video.scene.description.substring(0, 100)}...`
                    : video.scene.description
                ) : 'Video generated from scene script'}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                {video.prompt && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Video Prompt:</p>
                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded text-wrap">
                      {video.prompt.length > 150 
                        ? `${video.prompt.substring(0, 150)}...` 
                        : video.prompt}
                    </p>
                  </div>
                )}

                {video.status === 'completed' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => onVideoDownload?.(video.id)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => onVideoShare?.(video.id)}
                    >
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                  </div>
                )}

                {video.status === 'processing' && video.progress && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Progress</span>
                      <span>{video.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${video.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {video.error && (
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    <p className="font-medium">Error:</p>
                    <p>{video.error}</p>
                  </div>
                )}

                {video.metadata && (
                  <div className="text-xs text-gray-500 space-y-1">
                    {video.metadata.resolution && (
                      <p>Resolution: {video.metadata.resolution}</p>
                    )}
                    {video.metadata.fps && (
                      <p>FPS: {video.metadata.fps}</p>
                    )}
                    {video.metadata.fileSize && (
                      <p>Size: {(video.metadata.fileSize / 1024 / 1024).toFixed(1)} MB</p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}