
import React, { useEffect, useRef } from "react";

interface SlideViewProps {
  slide: {
    title: string;
    content: string | string[];
    type: string;
  };
  cssTemplate?: string | null;
}

const SlideView = ({ slide, cssTemplate }: SlideViewProps) => {
  const slideRef = useRef<HTMLDivElement>(null);

  // Apply CSS styles when the component mounts or cssTemplate changes
  useEffect(() => {
    if (!slideRef.current || !cssTemplate) return;
    
    try {
      // Apply the custom CSS to the slide container
      const styleElement = document.createElement('style');
      styleElement.textContent = cssTemplate;
      
      // Remove any previous custom styles before adding new ones
      const existingStyles = slideRef.current.querySelectorAll('style[data-custom-css]');
      existingStyles.forEach(style => style.remove());
      
      // Add the data attribute to identify this as a custom style
      styleElement.setAttribute('data-custom-css', 'true');
      slideRef.current.appendChild(styleElement);
      
      console.log("CSS applied to slide:", cssTemplate.substring(0, 100) + "...");
    } catch (error) {
      console.error("Error applying CSS to slide:", error);
    }
  }, [cssTemplate]);

  return (
    <div className="slide-container" ref={slideRef}>
      <div className="slide bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto aspect-video flex flex-col relative">
        <h2 className="slide-title text-3xl font-bold mb-6">{slide.title}</h2>
        
        <div className="slide-content flex-1">
          {slide.type === "bullets" ? (
            <ul className="slide-bullet-list space-y-3 text-lg">
              {Array.isArray(slide.content) && slide.content.map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="bullet inline-block h-2 w-2 rounded-full bg-primary mt-2.5 mr-3"></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : slide.type === "title" ? (
            <p className="text-center text-2xl mt-12">{slide.content}</p>
          ) : (
            <p className="text-lg leading-relaxed">{slide.content}</p>
          )}
        </div>
        
        <div className="slide-footer mt-auto pt-4 text-sm text-right">
          HTML PPT Generator
        </div>
      </div>
    </div>
  );
};

export default SlideView;
