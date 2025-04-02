
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getAIFeedback } from "@/services/aiService";

interface AIFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: string) => void;
  slide: any;
  slideIndex: number;
}

const AIFeedbackModal = ({
  isOpen,
  onClose,
  onSubmit,
  slide,
  slideIndex,
}: AIFeedbackModalProps) => {
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (feedback.trim() === "") {
      toast.error("Please enter your feedback");
      return;
    }

    setIsLoading(true);
    try {
      const aiResponse = await getAIFeedback(feedback, slide);
      
      if (aiResponse) {
        // Process the AI response
        onSubmit(feedback);
        toast.success("AI feedback received!");
        
        // Format the response for the user
        let responseMessage = "AI Suggestions:\n";
        aiResponse.suggestions.forEach((suggestion, index) => {
          responseMessage += `${index + 1}. ${suggestion}\n`;
        });
        
        // Update the slide with the improved content
        const updatedSlide = { ...slide };
        
        if (aiResponse.improvedTitle) {
          updatedSlide.title = aiResponse.improvedTitle;
        }
        
        if (aiResponse.improvedContent) {
          updatedSlide.content = aiResponse.improvedContent;
        }
        
        // Call onSubmit with the updated slide
        onSubmit(JSON.stringify(updatedSlide));
        
        setFeedback("");
        onClose();
      }
    } catch (error) {
      console.error("Error processing AI feedback:", error);
      toast.error("Failed to process AI feedback");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>AI Feedback for Slide {slideIndex + 1}</DialogTitle>
          <DialogDescription>
            Enter your feedback for this slide to get AI-powered suggestions.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            placeholder="Enter your feedback here..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={handleSubmit} 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Submit Feedback"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AIFeedbackModal;
