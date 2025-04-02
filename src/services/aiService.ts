
import { toast } from "sonner";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

export interface AIFeedbackResponse {
  suggestions: string[];
  improvedTitle?: string;
  improvedContent?: string | string[];
}

export const getAIFeedback = async (
  feedback: string,
  slide: {
    title: string;
    content: string | string[];
    type: string;
  }
): Promise<AIFeedbackResponse | null> => {
  try {
    const apiKey = localStorage.getItem("anthropicApiKey");
    
    if (!apiKey) {
      toast.error("API key not found. Please enter your Anthropic API key in the settings.");
      return null;
    }

    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-sonnet-20240229",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: `I have a presentation slide with the following content:
Title: ${slide.title}
Type: ${slide.type}
Content: ${typeof slide.content === 'string' ? slide.content : slide.content.join("\n- ")}

The user's feedback on this slide is: "${feedback}"

Please provide:
1. A list of 2-3 specific suggestions to improve this slide based on the feedback
2. An improved title if applicable
3. Improved content for the slide

For content, respond with a JSON object with these fields:
{
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "improvedTitle": "New title if applicable",
  "improvedContent": ${slide.type === "bullets" ? '["bullet 1", "bullet 2", "bullet 3"]' : '"Improved text content"'}
}

Ensure the improved content maintains the same format as the original (bullet points or paragraph text).`
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to get AI feedback");
    }

    const data = await response.json();
    
    // Extract the content from the response
    const content = data.content[0].text;
    
    // Find and parse the JSON object from the content
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse AI feedback");
    }
    
    const feedbackData = JSON.parse(jsonMatch[0]) as AIFeedbackResponse;
    return feedbackData;
  } catch (error) {
    console.error("Error getting AI feedback:", error);
    toast.error("Failed to get AI feedback. Please try again.");
    return null;
  }
};
