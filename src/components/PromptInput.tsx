"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Film, Sparkles, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function PromptInput({ onSubmit, isLoading, disabled = false }: PromptInputProps) {
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState("");

  const maxLength = 1000;
  const minLength = 20;
  const remainingChars = maxLength - prompt.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (prompt.trim().length < minLength) {
      setError(`Please enter at least ${minLength} characters for a detailed scene description.`);
      return;
    }

    if (prompt.trim().length > maxLength) {
      setError(`Please keep your prompt under ${maxLength} characters.`);
      return;
    }

    onSubmit(prompt.trim());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setPrompt(value);
      setError("");
    }
  };

  const examplePrompts = [
    "A detective discovers a mysterious letter in an abandoned mansion during a thunderstorm",
    "Two friends reunite at a coffee shop after 10 years apart",
    "A space explorer finds an ancient artifact on a distant planet",
    "A chef prepares the most important meal of their career"
  ];

  const handleExampleClick = (example: string) => {
    setPrompt(example);
    setError("");
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Film className="h-8 w-8 text-primary" />
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            AI Movie Scene Generator
          </CardTitle>
        </div>
        <CardDescription className="text-lg">
          Describe your movie scene idea and watch it come to life through AI-generated scripts and videos
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt" className="text-base font-medium">
              Describe your movie scene
            </Label>
            <Textarea
              id="prompt"
              placeholder="Enter a detailed description of your movie scene. Include characters, setting, mood, and key actions..."
              value={prompt}
              onChange={handleInputChange}
              disabled={disabled || isLoading}
              className="min-h-[120px] text-base resize-none"
              rows={5}
            />
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">
                {prompt.length}/{maxLength} characters
              </span>
              <Badge 
                variant={remainingChars < 100 ? "destructive" : remainingChars < 200 ? "secondary" : "outline"}
              >
                {remainingChars} remaining
              </Badge>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit" 
            disabled={disabled || isLoading || prompt.trim().length < minLength}
            className="w-full text-lg py-6"
            size="lg"
          >
            {isLoading ? (
              <>
                <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                Generating Your Movie Scenes...
              </>
            ) : (
              <>
                <Film className="mr-2 h-5 w-5" />
                Generate 5 Movie Scenes
              </>
            )}
          </Button>
        </form>

        <div className="space-y-3">
          <Label className="text-sm font-medium text-muted-foreground">
            Need inspiration? Try these examples:
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {examplePrompts.map((example, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleExampleClick(example)}
                disabled={disabled || isLoading}
                className="text-left justify-start h-auto p-3 text-sm leading-relaxed"
              >
                {example}
              </Button>
            ))}
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <h4 className="font-medium text-sm">How it works:</h4>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Enter your movie scene description above</li>
            <li>AI generates 5 detailed scene scripts</li>
            <li>Each scene is converted into a short video</li>
            <li>Download and share your AI-generated movie scenes</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}