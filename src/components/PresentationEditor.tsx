
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  Play, 
  ChevronLeft, 
  ChevronRight, 
  Edit2, 
  Plus, 
  Save, 
  Download, 
  Trash2,
  MessageSquare,
  Settings
} from "lucide-react";
import SlideView from "@/components/SlideView";
import AIFeedbackModal from "@/components/AIFeedbackModal";
import SettingsModal from "@/components/SettingsModal";

interface PresentationEditorProps {
  slides: any[];
  setSlides: (slides: any[]) => void;
  onExport: () => void;
  cssTemplate?: string | null;
}

const PresentationEditor = ({ 
  slides, 
  setSlides, 
  onExport,
  cssTemplate
}: PresentationEditorProps) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  
  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  
  const currentSlide = slides[currentSlideIndex];
  
  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };
  
  const handleNextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };
  
  const handleEditSlide = () => {
    setEditMode(true);
  };
  
  const handleSaveSlide = () => {
    if (!titleRef.current || !contentRef.current) return;
    
    const updatedSlides = [...slides];
    const updatedSlide = { ...currentSlide };
    
    updatedSlide.title = titleRef.current.value;
    
    if (currentSlide.type === "bullets") {
      updatedSlide.content = contentRef.current.value.split("\n").filter(item => item.trim() !== "");
    } else {
      updatedSlide.content = contentRef.current.value;
    }
    
    updatedSlides[currentSlideIndex] = updatedSlide;
    setSlides(updatedSlides);
    setEditMode(false);
    toast.success("Slide updated successfully");
  };
  
  const handleAddSlide = () => {
    const newSlide = {
      id: slides.length + 1,
      title: "New Slide",
      content: currentSlide.type === "bullets" ? ["Bullet point 1", "Bullet point 2"] : "Add your content here",
      type: currentSlide.type
    };
    
    const updatedSlides = [...slides, newSlide];
    setSlides(updatedSlides);
    setCurrentSlideIndex(updatedSlides.length - 1);
    toast.success("New slide added");
  };
  
  const handleDeleteSlide = () => {
    if (slides.length <= 1) {
      toast.error("Cannot delete the only slide");
      return;
    }
    
    const updatedSlides = slides.filter((_, index) => index !== currentSlideIndex);
    setSlides(updatedSlides);
    
    if (currentSlideIndex >= updatedSlides.length) {
      setCurrentSlideIndex(updatedSlides.length - 1);
    }
    
    toast.success("Slide deleted");
  };
  
  const togglePresentationMode = () => {
    setPresentationMode(!presentationMode);
  };
  
  const openSettings = () => {
    setIsSettingsModalOpen(true);
  };
  
  const handleAIFeedback = (feedbackData: string) => {
    try {
      const updatedSlide = JSON.parse(feedbackData);
      
      if (updatedSlide.title && (updatedSlide.content || Array.isArray(updatedSlide.content))) {
        const newSlides = [...slides];
        newSlides[currentSlideIndex] = updatedSlide;
        setSlides(newSlides);
        toast.success("Slide updated with AI suggestions");
      }
    } catch (e) {
      toast.success("AI feedback received");
    }
  };
  
  if (presentationMode) {
    return (
      <div className="presentation-mode">
        <SlideView slide={currentSlide} />
        
        <div className="presentation-controls">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePrevSlide}
            disabled={currentSlideIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="px-2 text-sm">
            {currentSlideIndex + 1} / {slides.length}
          </span>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleNextSlide}
            disabled={currentSlideIndex === slides.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={togglePresentationMode}
            className="ml-4"
          >
            Exit
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Edit Presentation</h2>
          <p className="text-muted-foreground">
            Customize your slides or get AI assistance
          </p>
        </div>
        
        <div className="space-x-2">
          <Button 
            variant="outline" 
            onClick={openSettings}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          
          <Button 
            variant="outline" 
            onClick={togglePresentationMode}
          >
            <Play className="mr-2 h-4 w-4" />
            Preview
          </Button>
          
          <Button 
            onClick={onExport}
          >
            <Download className="mr-2 h-4 w-4" />
            Export to PPT
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-medium mb-4">Slides</h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {slides.map((slide, index) => (
                  <div 
                    key={slide.id}
                    className={`p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors ${
                      index === currentSlideIndex ? 'border-primary bg-primary/10' : ''
                    }`}
                    onClick={() => setCurrentSlideIndex(index)}
                  >
                    <p className="font-medium truncate">{slide.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Slide {index + 1} • {slide.type}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleAddSlide}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Slide
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleDeleteSlide}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          {editMode ? (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="slide-title" className="block text-sm font-medium mb-1">
                      Slide Title
                    </label>
                    <Input
                      id="slide-title"
                      ref={titleRef}
                      defaultValue={currentSlide.title}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="slide-content" className="block text-sm font-medium mb-1">
                      {currentSlide.type === "bullets" ? "Bullet Points (one per line)" : "Content"}
                    </label>
                    <Textarea
                      id="slide-content"
                      ref={contentRef}
                      rows={8}
                      defaultValue={
                        currentSlide.type === "bullets" 
                          ? currentSlide.content.join("\n") 
                          : currentSlide.content
                      }
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setEditMode(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSaveSlide}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <SlideView slide={currentSlide} />
              
              <div className="flex justify-between">
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handlePrevSlide}
                    disabled={currentSlideIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleNextSlide}
                    disabled={currentSlideIndex === slides.length - 1}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsAIModalOpen(true)}
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    AI Feedback
                  </Button>
                  
                  <Button 
                    size="sm"
                    onClick={handleEditSlide}
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit Slide
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <AIFeedbackModal 
        isOpen={isAIModalOpen} 
        onClose={() => setIsAIModalOpen(false)}
        onSubmit={handleAIFeedback}
        slide={currentSlide}
        slideIndex={currentSlideIndex}
      />
      
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
};

export default PresentationEditor;
