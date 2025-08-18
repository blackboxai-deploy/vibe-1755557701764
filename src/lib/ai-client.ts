interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface SceneData {
  title: string;
  description: string;
  visualPrompt: string;
}

interface GeneratedScript {
  scenes: SceneData[];
  totalScenes: number;
}

interface VideoGenerationResponse {
  id: string;
  status: string;
  output?: string;
  error?: string;
}

export class AIClient {
  private readonly chatEndpoint = 'https://oi-server.onrender.com/chat/completions';
  private readonly customerId = 'cus_SGPn4uhjPI0F4w';
  private readonly replicateToken = process.env.REPLICATE_API_TOKEN;

  async generateScript(userPrompt: string): Promise<GeneratedScript> {
    const systemPrompt = `You are a professional screenwriter. Given a movie scene prompt, create exactly 5 detailed scenes that tell a complete story. 

Return your response as a valid JSON object with this exact structure:
{
  "scenes": [
    {
      "title": "Scene 1 Title",
      "description": "Detailed scene description with dialogue and action",
      "visualPrompt": "Cinematic visual description optimized for AI video generation"
    }
  ],
  "totalScenes": 5
}

Guidelines:
- Each scene should be 2-3 sentences for description
- Visual prompts should include camera angles, lighting, mood
- Ensure narrative continuity between scenes
- Include specific visual details for video generation
- Make scenes cinematic and engaging`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    try {
      const response = await fetch(this.chatEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer xxx',
          'CustomerId': this.customerId
        },
        body: JSON.stringify({
          model: 'openrouter/anthropic/claude-sonnet-4',
          messages,
          max_tokens: 2000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`Chat API error: ${response.status} ${response.statusText}`);
      }

      const data: ChatResponse = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content received from chat API');
      }

      // Parse JSON response
      const parsedScript = JSON.parse(content) as GeneratedScript;
      
      // Validate structure
      if (!parsedScript.scenes || parsedScript.scenes.length !== 5) {
        throw new Error('Invalid script format: must contain exactly 5 scenes');
      }

      return parsedScript;
    } catch (error) {
      console.error('Script generation error:', error);
      throw new Error(`Failed to generate script: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateVideo(scenePrompt: string, sceneTitle: string): Promise<string> {
    if (!this.replicateToken) {
      throw new Error('Replicate API token not configured');
    }

    try {
      // Start video generation
      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.replicateToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          version: 'google/veo-3:latest',
          input: {
            prompt: scenePrompt,
            duration: 5,
            aspect_ratio: '16:9',
            resolution: '720p'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Replicate API error: ${response.status} ${response.statusText}`);
      }

      const prediction = await response.json() as VideoGenerationResponse;
      
      // Poll for completion
      return await this.pollVideoGeneration(prediction.id);
    } catch (error) {
      console.error(`Video generation error for "${sceneTitle}":`, error);
      throw new Error(`Failed to generate video: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async pollVideoGeneration(predictionId: string): Promise<string> {
    const maxAttempts = 180; // 15 minutes with 5-second intervals
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
          headers: {
            'Authorization': `Token ${this.replicateToken}`
          }
        });

        if (!response.ok) {
          throw new Error(`Polling error: ${response.status}`);
        }

        const prediction = await response.json() as VideoGenerationResponse;

        if (prediction.status === 'succeeded' && prediction.output) {
          return prediction.output;
        }

        if (prediction.status === 'failed') {
          throw new Error(`Video generation failed: ${prediction.error || 'Unknown error'}`);
        }

        // Wait 5 seconds before next poll
        await new Promise(resolve => setTimeout(resolve, 5000));
        attempts++;
      } catch (error) {
        console.error('Polling error:', error);
        throw error;
      }
    }

    throw new Error('Video generation timeout after 15 minutes');
  }

  async generateAllVideos(scenes: SceneData[]): Promise<Array<{ scene: SceneData; videoUrl: string }>> {
    const results = await Promise.allSettled(
      scenes.map(async (scene) => {
        const videoUrl = await this.generateVideo(scene.visualPrompt, scene.title);
        return { scene, videoUrl };
      })
    );

    const successful = results
      .filter((result): result is PromiseFulfilledResult<{ scene: SceneData; videoUrl: string }> => 
        result.status === 'fulfilled'
      )
      .map(result => result.value);

    const failed = results
      .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
      .map(result => result.reason);

    if (failed.length > 0) {
      console.warn(`${failed.length} videos failed to generate:`, failed);
    }

    if (successful.length === 0) {
      throw new Error('All video generations failed');
    }

    return successful;
  }
}

export const aiClient = new AIClient();