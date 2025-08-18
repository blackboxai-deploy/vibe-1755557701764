import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, Camera, Users, MessageSquare } from 'lucide-react';

export interface Scene {
  id: number;
  title: string;
  description: string;
  duration: string;
  location: string;
  characters: string[];
  dialogue?: string;
  cameraAngle?: string;
  mood?: string;
  visualStyle?: string;
}

interface SceneDisplayProps {
  scenes: Scene[];
  isLoading?: boolean;
}

export const SceneDisplay: React.FC<SceneDisplayProps> = ({ scenes, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!scenes || scenes.length === 0) {
    return (
      <div className="text-center py-12">
        <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No scenes generated yet</h3>
        <p className="text-gray-500">Enter a movie scene prompt to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Generated Scenes</h2>
        <Badge variant="secondary" className="text-sm">
          {scenes.length} scenes
        </Badge>
      </div>
      
      <div className="grid gap-6">
        {scenes.map((scene, index) => (
          <Card key={scene.id} className="overflow-hidden border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl font-semibold text-gray-900 mb-2">
                    Scene {index + 1}: {scene.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {scene.location}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="ml-4">
                  <Clock className="w-3 h-3 mr-1" />
                  {scene.duration}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Scene Description</h4>
                <p className="text-gray-700 leading-relaxed">{scene.description}</p>
              </div>

              {scene.dialogue && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Key Dialogue
                  </h4>
                  <blockquote className="border-l-4 border-gray-200 pl-4 italic text-gray-600">
                    "{scene.dialogue}"
                  </blockquote>
                </div>
              )}

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scene.characters && scene.characters.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      Characters
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {scene.characters.map((character, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {character}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {scene.cameraAngle && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <Camera className="w-4 h-4 mr-2" />
                      Camera Angle
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {scene.cameraAngle}
                    </Badge>
                  </div>
                )}
              </div>

              {(scene.mood || scene.visualStyle) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {scene.mood && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Mood</h4>
                      <Badge variant="secondary" className="text-xs">
                        {scene.mood}
                      </Badge>
                    </div>
                  )}

                  {scene.visualStyle && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Visual Style</h4>
                      <Badge variant="secondary" className="text-xs">
                        {scene.visualStyle}
                      </Badge>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SceneDisplay;