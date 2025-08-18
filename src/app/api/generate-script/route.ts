import { NextRequest, NextResponse } from 'next/server';

interface SceneData {
  sceneNumber: number;
  title: string;
  description: string;
  visualElements: string;
  dialogue?: string;
  cameraAngle: string;
  duration: string;
}

interface ScriptResponse {
  scenes: SceneData[];
  totalScenes: number;
  genre: string;
  mood: string;
}

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Valid prompt is required' },
        { status: 400 }
      );
    }

    if (prompt.length > 2000) {
      return NextResponse.json(
        { error: 'Prompt must be less than 2000 characters' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a professional screenwriter and director. Your task is to take a user's movie scene prompt and expand it into exactly 5 detailed, cinematic scenes that tell a complete short story.

CRITICAL: Respond with ONLY valid JSON. No markdown, no code blocks, no explanatory text. Start your response with { and end with }.

For each scene, provide:
- sceneNumber: Sequential number (1-5)
- title: Compelling scene title (max 50 chars)
- description: Detailed scene description optimized for AI video generation (100-200 words)
- visualElements: Specific visual details, lighting, setting, props (50-100 words)
- dialogue: Key dialogue if applicable (optional, max 100 chars)
- cameraAngle: Camera movement/angle description (e.g., "Wide establishing shot", "Close-up on character", "Tracking shot")
- duration: Estimated scene duration (e.g., "15 seconds", "30 seconds")

The 5 scenes should:
1. Have narrative flow and continuity
2. Include varied camera angles and visual styles
3. Be optimized for AI video generation
4. Tell a complete story arc
5. Include specific visual details for better video generation

Response format (ONLY this JSON, nothing else):
{
  "scenes": [array of 5 scene objects],
  "totalScenes": 5,
  "genre": "detected genre",
  "mood": "overall mood/tone"
}`;

    const response = await fetch('https://oi-server.onrender.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer xxx',
        'CustomerId': 'cus_SGPn4uhjPI0F4w'
      },
      body: JSON.stringify({
        model: 'openrouter/anthropic/claude-sonnet-4',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Create 5 detailed movie scenes based on this prompt: "${prompt}"`
          }
        ],
        max_tokens: 4000,
        temperature: 0.7,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API Error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to generate script. Please try again.' },
        { status: 500 }
      );
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid AI response structure:', data);
      return NextResponse.json(
        { error: 'Invalid response from AI service' },
        { status: 500 }
      );
    }

    let aiContent = data.choices[0].message.content;
    console.log('Raw AI Response:', JSON.stringify(aiContent));
    
    // Remove markdown code blocks if present
    if (aiContent.includes('```json')) {
      aiContent = aiContent.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    } else if (aiContent.includes('```')) {
      aiContent = aiContent.replace(/```\s*/g, '');
    }
    
    // Clean up any extra whitespace
    aiContent = aiContent.trim();
    console.log('Cleaned AI Response:', JSON.stringify(aiContent));
    
    let scriptData: ScriptResponse;
    try {
      scriptData = JSON.parse(aiContent);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('Cleaned AI Response:', aiContent);
      console.error('Original Response:', data.choices[0].message.content);
      
      // Try to extract JSON from response if it's embedded
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          console.log('Attempting to parse matched JSON:', jsonMatch[0]);
          scriptData = JSON.parse(jsonMatch[0]);
        } catch (secondParseError) {
          console.error('Second parse attempt failed:', secondParseError);
          return NextResponse.json(
            { error: 'Failed to parse script data. AI response format is invalid.' },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { error: 'No valid JSON found in AI response.' },
          { status: 500 }
        );
      }
    }

    // Validate the response structure
    if (!scriptData.scenes || !Array.isArray(scriptData.scenes) || scriptData.scenes.length !== 5) {
      console.error('Invalid script structure:', scriptData);
      return NextResponse.json(
        { error: 'Generated script does not contain exactly 5 scenes' },
        { status: 500 }
      );
    }

    // Validate each scene has required fields
    for (const scene of scriptData.scenes) {
      if (!scene.sceneNumber || !scene.title || !scene.description || !scene.visualElements || !scene.cameraAngle || !scene.duration) {
        console.error('Invalid scene structure:', scene);
        return NextResponse.json(
          { error: 'Generated scenes are missing required fields' },
          { status: 500 }
        );
      }
    }

    // Add metadata
    const responseData = {
      ...scriptData,
      generatedAt: new Date().toISOString(),
      originalPrompt: prompt,
      processingTime: Date.now()
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Script generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to generate scripts.' },
    { status: 405 }
  );
}