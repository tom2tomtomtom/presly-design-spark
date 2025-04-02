
import React from "react";

interface SlideViewProps {
  slide: {
    title: string;
    content: string | string[];
    type: string;
  };
  cssTemplate?: string | null;
}

const SlideView = ({ slide, cssTemplate }: SlideViewProps) => {
  // Create a style element with the custom CSS if provided
  const customStyle = cssTemplate ? (
    <style dangerouslySetInnerHTML={{ __html: cssTemplate }} />
  ) : null;

  return (
    <div className="slide-container">
      {customStyle}
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
