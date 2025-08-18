"use client";

import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle, Film, FileText } from 'lucide-react';

export interface ProcessingStep {
  id: string;
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress?: number;
  message?: string;
  startTime?: Date;
  endTime?: Date;
}

export interface ProgressTrackerProps {
  steps: ProcessingStep[];
  currentStep?: string;
  overallProgress: number;
  isComplete: boolean;
  error?: string;
}

const getStatusIcon = (status: ProcessingStep['status']) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'processing':
      return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
    case 'error':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    default:
      return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />;
  }
};

const getStatusColor = (status: ProcessingStep['status']) => {
  switch (status) {
    case 'completed':
      return 'bg-green-500';
    case 'processing':
      return 'bg-blue-500';
    case 'error':
      return 'bg-red-500';
    default:
      return 'bg-gray-300';
  }
};

const getStepIcon = (stepId: string) => {
  if (stepId.includes('script')) {
    return <FileText className="h-4 w-4" />;
  }
  if (stepId.includes('video')) {
    return <Film className="h-4 w-4" />;
  }
  return <div className="h-4 w-4 rounded-full bg-gray-400" />;
};

export function ProgressTracker({
  steps,
  currentStep,
  overallProgress,
  isComplete,
  error
}: ProgressTrackerProps) {
  const formatDuration = (start?: Date, end?: Date) => {
    if (!start) return '';
    const endTime = end || new Date();
    const duration = Math.floor((endTime.getTime() - start.getTime()) / 1000);
    if (duration < 60) return `${duration}s`;
    return `${Math.floor(duration / 60)}m ${duration % 60}s`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Film className="h-5 w-5" />
          Processing Status
        </CardTitle>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Overall Progress</span>
            <span>{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="w-full" />
        </div>
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}
        {isComplete && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-700">All scenes generated successfully!</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-gray-200 bg-white">
                  {getStepIcon(step.id)}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-0.5 h-8 mt-2 ${getStatusColor(step.status)}`} />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {getStatusIcon(step.status)}
                  <h4 className="text-sm font-medium text-gray-900">{step.title}</h4>
                  <Badge 
                    variant={step.status === 'completed' ? 'default' : 
                            step.status === 'processing' ? 'secondary' : 
                            step.status === 'error' ? 'destructive' : 'outline'}
                    className="text-xs"
                  >
                    {step.status}
                  </Badge>
                </div>
                
                {step.message && (
                  <p className="text-xs text-gray-600 mb-2">{step.message}</p>
                )}
                
                {step.status === 'processing' && step.progress !== undefined && (
                  <div className="mb-2">
                    <Progress value={step.progress} className="h-2" />
                    <span className="text-xs text-gray-500">{step.progress}%</span>
                  </div>
                )}
                
                {(step.startTime || step.endTime) && (
                  <div className="text-xs text-gray-500">
                    {step.status === 'processing' && step.startTime && (
                      <span>Running for {formatDuration(step.startTime)}</span>
                    )}
                    {step.status === 'completed' && step.startTime && step.endTime && (
                      <span>Completed in {formatDuration(step.startTime, step.endTime)}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default ProgressTracker;