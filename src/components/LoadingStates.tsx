import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Loader2, Film, Clapperboard, Video } from 'lucide-react';

interface LoadingStatesProps {
  stage: 'script' | 'video' | 'complete';
  progress?: number;
  currentScene?: number;
  totalScenes?: number;
}

export const LoadingStates: React.FC<LoadingStatesProps> = ({
  stage,
  progress = 0,
  currentScene = 0,
  totalScenes = 5
}) => {
  const getStageIcon = () => {
    switch (stage) {
      case 'script':
        return <Clapperboard className="h-6 w-6 text-blue-500" />;
      case 'video':
        return <Video className="h-6 w-6 text-purple-500" />;
      default:
        return <Film className="h-6 w-6 text-green-500" />;
    }
  };

  const getStageText = () => {
    switch (stage) {
      case 'script':
        return 'Generating movie script...';
      case 'video':
        return `Generating videos (${currentScene}/${totalScenes})...`;
      default:
        return 'Complete!';
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Progress Card */}
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-3">
            <div className="animate-spin">
              <Loader2 className="h-5 w-5" />
            </div>
            {getStageIcon()}
            <h3 className="text-lg font-semibold">{getStageText()}</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground">
              {progress}% complete
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Script Generation Loading */}
      {stage === 'script' && (
        <div className="space-y-4">
          <h4 className="text-md font-medium">Analyzing your prompt...</h4>
          <div className="grid gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="p-4">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Video Generation Loading */}
      {stage === 'video' && (
        <div className="space-y-4">
          <h4 className="text-md font-medium">Creating cinematic videos...</h4>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className={`p-4 ${i <= currentScene ? 'border-green-500' : 'border-gray-200'}`}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20" />
                    {i <= currentScene ? (
                      <div className="h-4 w-4 rounded-full bg-green-500" />
                    ) : i === currentScene + 1 ? (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    ) : (
                      <div className="h-4 w-4 rounded-full bg-gray-200" />
                    )}
                  </div>
                  <Skeleton className="h-32 w-full rounded-md" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Processing Steps */}
      <Card className="p-4">
        <h4 className="text-sm font-medium mb-3">Processing Steps</h4>
        <div className="space-y-2">
          <div className={`flex items-center space-x-2 ${stage === 'script' ? 'text-blue-600' : 'text-green-600'}`}>
            <div className={`h-2 w-2 rounded-full ${stage === 'script' ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`} />
            <span className="text-sm">Script Generation</span>
          </div>
          <div className={`flex items-center space-x-2 ${stage === 'video' ? 'text-blue-600' : stage === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`h-2 w-2 rounded-full ${stage === 'video' ? 'bg-blue-500 animate-pulse' : stage === 'complete' ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-sm">Video Generation</span>
          </div>
          <div className={`flex items-center space-x-2 ${stage === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`h-2 w-2 rounded-full ${stage === 'complete' ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-sm">Final Processing</span>
          </div>
        </div>
      </Card>

      {/* Estimated Time */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          <span className="text-sm text-blue-700">
            {stage === 'script' && 'Estimated time: 30-60 seconds'}
            {stage === 'video' && 'Estimated time: 5-10 minutes per video'}
            {stage === 'complete' && 'Processing complete!'}
          </span>
        </div>
      </Card>
    </div>
  );
};

export const ScriptLoadingSkeleton: React.FC = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4, 5].map((i) => (
      <Card key={i} className="p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        </div>
      </Card>
    ))}
  </div>
);

export const VideoLoadingSkeleton: React.FC = () => (
  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
    {[1, 2, 3, 4, 5].map((i) => (
      <Card key={i} className="overflow-hidden">
        <Skeleton className="h-48 w-full" />
        <div className="p-4 space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      </Card>
    ))}
  </div>
);