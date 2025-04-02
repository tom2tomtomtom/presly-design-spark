
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import SlideView from "@/components/SlideView";

const SlidePreview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [slides, setSlides] = useState<any[]>([]);
  
  // Parse slides from URL or use demo slides
  useEffect(() => {
    try {
      // Try to get slides from location state
      if (location.state && location.state.slides) {
        setSlides(location.state.slides);
        if (location.state.startIndex) {
          setCurrentSlideIndex(location.state.startIndex);
        }
        return;
      }
      
      // If no slides in state, check for encoded slides in URL
      const params = new URLSearchParams(location.search);
      const encodedSlides = params.get('slides');
      if (encodedSlides) {
        const decodedSlides = JSON.parse(atob(encodedSlides));
        setSlides(decodedSlides);
        return;
      }
      
      // Fallback to demo slides
      setSlides([
        {
          id: 1,
          title: "Welcome to HTML PPT Generator",
          content: "Transform documents into beautiful HTML presentations",
          type: "title"
        },
        {
          id: 2,
          title: "Key Features",
          content: [
            "Upload DOC files and templates",
            "AI-powered editing and feedback",
            "Export to HTML and PowerPoint",
            "Beautiful, responsive designs"
          ],
          type: "bullets"
        },
        {
          id: 3,
          title: "Get Started Today",
          content: "Visit the main page to create your first presentation",
          type: "text"
        }
      ]);
    } catch (error) {
      console.error("Error parsing slides:", error);
      navigate("/");
    }
  }, [location, navigate]);
  
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
  
  const handleExit = () => {
    navigate("/");
  };
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        handleNextSlide();
      } else if (e.key === "ArrowLeft") {
        handlePrevSlide();
      } else if (e.key === "Escape") {
        handleExit();
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlideIndex, slides.length]);
  
  if (!slides.length) {
    return <div className="flex items-center justify-center h-screen">Loading presentation...</div>;
  }
  
  return (
    <div className="presentation-mode">
      {slides[currentSlideIndex] && (
        <SlideView slide={slides[currentSlideIndex]} />
      )}
      
      <div className="presentation-controls">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handlePrevSlide}
          disabled={currentSlideIndex === 0}
          className="rounded-full"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <span className="px-4 text-sm">
          {currentSlideIndex + 1} / {slides.length}
        </span>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleNextSlide}
          disabled={currentSlideIndex === slides.length - 1}
          className="rounded-full"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleExit}
          className="ml-4 rounded-full"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default SlidePreview;
