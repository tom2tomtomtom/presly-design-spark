
import React from "react";

interface SlideViewProps {
  slide: {
    title: string;
    content: string | string[];
    type: string;
  };
}

const SlideView = ({ slide }: SlideViewProps) => {
  return (
    <div className="slide">
      <h2 className="slide-title">{slide.title}</h2>
      
      <div className="slide-content">
        {slide.type === "bullets" ? (
          <ul className="slide-bullet-list">
            {Array.isArray(slide.content) && slide.content.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        ) : (
          <p>{slide.content}</p>
        )}
      </div>
    </div>
  );
};

export default SlideView;
