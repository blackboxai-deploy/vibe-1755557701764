'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Film, Play, Download, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface Scene {
  id: number
  title: string
  description: string
  videoUrl?: string
  status: 'pending' | 'generating' | 'completed' | 'error'
}

interface GenerationStatus {
  stage: 'idle' | 'script' | 'videos' | 'completed' | 'error'
  progress: number
  message: string
}

export default function Home() {
  const [prompt, setPrompt] = useState('')
  const [scenes, setScenes] = useState<Scene[]>([])
  const [status, setStatus] = useState<GenerationStatus>({
    stage: 'idle',
    progress: 0,
    message: 'Ready to generate your movie scenes'
  })
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setScenes([])
    setStatus({ stage: 'script', progress: 10, message: 'Generating script with AI...' })

    try {
      // Generate script
      const scriptResponse = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })

      if (!scriptResponse.ok) {
        throw new Error('Failed to generate script')
      }

      const { scenes: generatedScenes } = await scriptResponse.json()
      const scenesWithStatus = generatedScenes.map((scene: any, index: number) => ({
        id: index + 1,
        title: scene.title,
        description: scene.description,
        status: 'pending' as const
      }))

      setScenes(scenesWithStatus)
      setStatus({ stage: 'videos', progress: 30, message: 'Script generated! Creating videos...' })

      // Generate videos
      const videoResponse = await fetch('/api/generate-videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenes: generatedScenes })
      })

      if (!videoResponse.ok) {
        throw new Error('Failed to generate videos')
      }

      const { jobId } = await videoResponse.json()

      // Poll for video completion
      const pollStatus = async () => {
        const statusResponse = await fetch(`/api/status/${jobId}`)
        const statusData = await statusResponse.json()

        setStatus({
          stage: 'videos',
          progress: 30 + (statusData.progress * 0.6),
          message: `Generating videos... ${statusData.completed}/${statusData.total} completed`
        })

        // Update individual scene statuses
        setScenes(prev => prev.map(scene => {
          const sceneStatus = statusData.scenes.find((s: any) => s.id === scene.id)
          return sceneStatus ? { ...scene, ...sceneStatus } : scene
        }))

        if (statusData.status === 'completed') {
          setStatus({ stage: 'completed', progress: 100, message: 'All videos generated successfully!' })
          setIsGenerating(false)
        } else if (statusData.status === 'error') {
          throw new Error('Video generation failed')
        } else {
          setTimeout(pollStatus, 3000)
        }
      }

      setTimeout(pollStatus, 2000)

    } catch (error) {
      setStatus({
        stage: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : 'An error occurred'
      })
      setIsGenerating(false)
    }
  }

  const getStatusIcon = (stage: string) => {
    switch (stage) {
      case 'script':
      case 'videos':
        return <Loader2 className="h-4 w-4 animate-spin" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Film className="h-4 w-4" />
    }
  }

  const getSceneStatusBadge = (status: Scene['status']) => {
    const variants = {
      pending: { variant: 'secondary' as const, text: 'Pending', icon: Clock },
      generating: { variant: 'default' as const, text: 'Generating', icon: Loader2 },
      completed: { variant: 'default' as const, text: 'Completed', icon: CheckCircle },
      error: { variant: 'destructive' as const, text: 'Error', icon: AlertCircle }
    }
    
    const config = variants[status]
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={`h-3 w-3 ${status === 'generating' ? 'animate-spin' : ''}`} />
        {config.text}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Film className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Movie Scene Generator
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform your creative ideas into cinematic scenes. Enter a prompt and watch AI generate a 5-scene script with accompanying videos.
          </p>
        </div>

        {/* Input Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Scene Prompt</CardTitle>
            <CardDescription>
              Describe the movie scene you want to create. Be specific about setting, characters, and mood.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Example: A tense confrontation between two detectives in a dimly lit warehouse at midnight, with rain pattering on the metal roof..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px] resize-none"
              maxLength={1000}
            />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {prompt.length}/1000 characters
              </span>
              <Button 
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="min-w-[140px]"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Film className="h-4 w-4 mr-2" />
                    Generate Scenes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Status Section */}
        {status.stage !== 'idle' && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                {getStatusIcon(status.stage)}
                <span className="font-medium">{status.message}</span>
              </div>
              <Progress value={status.progress} className="h-2" />
              <div className="text-sm text-muted-foreground mt-2">
                {status.progress}% complete
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Alert */}
        {status.stage === 'error' && (
          <Alert className="mb-8 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              {status.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Scenes Section */}
        {scenes.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">Generated Scenes</h2>
              <Badge variant="outline">{scenes.length} scenes</Badge>
            </div>

            <div className="grid gap-6">
              {scenes.map((scene, index) => (
                <Card key={scene.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Scene {scene.id}</Badge>
                          {getSceneStatusBadge(scene.status)}
                        </div>
                        <CardTitle className="text-xl">{scene.title}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                      {scene.description}
                    </p>
                    
                    <Separator />
                    
                    {/* Video Section */}
                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <Play className="h-4 w-4" />
                        Generated Video
                      </h4>
                      
                      {scene.status === 'completed' && scene.videoUrl ? (
                        <div className="space-y-3">
                          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                            <video
                              controls
                              className="w-full h-full object-cover"
                              poster="/api/placeholder/800/450"
                            >
                              <source src={scene.videoUrl} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Play className="h-4 w-4 mr-2" />
                              Play
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                      ) : scene.status === 'generating' ? (
                        <div className="space-y-3">
                          <Skeleton className="aspect-video w-full rounded-lg" />
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Generating video... This may take several minutes.
                          </div>
                        </div>
                      ) : scene.status === 'error' ? (
                        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-red-800 dark:text-red-200">
                            Failed to generate video for this scene.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          Waiting to start video generation...
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Success Message */}
        {status.stage === 'completed' && (
          <Card className="mt-8 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-green-800 dark:text-green-200">
                <CheckCircle className="h-5 w-5" />
                <div>
                  <p className="font-medium">All scenes generated successfully!</p>
                  <p className="text-sm opacity-90">Your movie scenes are ready to view and download.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}