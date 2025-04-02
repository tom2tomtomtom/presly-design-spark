
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  
  const prompts = [
    {
      title: "Improve Clarity",
      text: `Please make the content of this slide clearer and more concise. The slide is about "${slide?.title}".`
    },
    {
      title: "Add Bullet Points",
      text: `Convert this slide content into a set of clear, concise bullet points. The slide is about "${slide?.title}".`
    },
    {
      title: "Professional Tone",
      text: `Rewrite this slide with a more professional tone suitable for a business presentation. The slide is about "${slide?.title}".`
    },
    {
      title: "Add Examples",
      text: `Enhance this slide by adding relevant examples to illustrate the key points. The slide is about "${slide?.title}".`
    }
  ];
  
  const handlePromptSelect = (text: string) => {
    setFeedback(text);
    setSelectedPrompt(text);
  };
  
  const handleSubmit = () => {
    onSubmit(feedback);
    setFeedback("");
    setSelectedPrompt(null);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Get AI Assistance</DialogTitle>
          <DialogDescription>
            Describe what you'd like to improve or change about this slide. Our AI will generate suggested changes.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="custom" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="custom">Custom Request</TabsTrigger>
            <TabsTrigger value="templates">Prompt Templates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="custom" className="mt-4">
            <Textarea
              placeholder="e.g., 'Make this slide more concise' or 'Add three bullet points about benefits'"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={5}
            />
          </TabsContent>
          
          <TabsContent value="templates" className="mt-4">
            <div className="grid grid-cols-2 gap-2">
              {prompts.map((prompt) => (
                <div 
                  key={prompt.title}
                  className={`p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedPrompt === prompt.text ? 'border-primary bg-primary/10' : ''
                  }`}
                  onClick={() => handlePromptSelect(prompt.text)}
                >
                  <p className="font-medium text-sm">{prompt.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {prompt.text.substring(0, 60)}...
                  </p>
                </div>
              ))}
            </div>
            
            {selectedPrompt && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Selected Template:</p>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={3}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!feedback.trim()}>
            Get AI Suggestions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AIFeedbackModal;
