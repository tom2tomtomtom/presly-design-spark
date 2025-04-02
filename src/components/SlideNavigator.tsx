import React from 'react';
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { PlusCircle, Trash } from "lucide-react";

interface Slide {
  id: number;
  title: string;
  content: string | string[];
  type: string;
}

interface SlideNavigatorProps {
  slides: Slide[];
  activeSlideIndex: number;
  onSelectSlide: (index: number) => void;
  onAddSlide?: () => void;
  onDeleteSlide?: (index: number) => void;
}

/**
 * Provides a sidebar navigation for slides with thumbnails
 */
const SlideNavigator: React.FC<SlideNavigatorProps> = ({ 
  slides, 
  activeSlideIndex, 
  onSelectSlide,
  onAddSlide,
  onDeleteSlide
}) => {
  return (
    <div className="w-64 border-r border-border h-full bg-background">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="text-sm font-medium">Slides</h3>
        {onAddSlide && (
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onAddSlide}
            title="Add new slide"
          >
            <PlusCircle className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <ScrollArea className="h-[calc(100vh-10rem)]">
        <div className="p-2 space-y-2">
          {slides.map((slide, index) => (
            <div
              key={slide.id || index}
              className={`
                p-2 rounded-md cursor-pointer transition-colors relative group
                ${activeSlideIndex === index 
                  ? 'bg-primary/10 border border-primary/30' 
                  : 'hover:bg-muted border border-transparent'
                }
              `}
              onClick={() => onSelectSlide(index)}
            >
              <div className="flex justify-between items-start mb-1">
                <div className="text-xs font-medium truncate max-w-[80%]">
                  {slide.title || `Slide ${index + 1}`}
                </div>
                <div className="text-xs text-muted-foreground">
                  {index + 1}
                </div>
              </div>
              
              <div 
                className="w-full h-14 bg-card border rounded-sm flex items-center justify-center text-xs text-muted-foreground p-1 overflow-hidden"
                style={{ fontSize: '8px' }}
              >
                {slide.type === 'bullets' ? (
                  <ul className="list-disc pl-2 w-full">
                    {Array.isArray(slide.content) && slide.content.slice(0, 2).map((item, i) => (
                      <li key={i} className="truncate">{item.substring(0, 15)}...</li>
                    ))}
                    {Array.isArray(slide.content) && slide.content.length > 2 && (
                      <li className="text-muted">+{slide.content.length - 2} more</li>
                    )}
                  </ul>
                ) : slide.type === 'title' ? (
                  <div className="flex items-center justify-center h-full text-center">
                    <p className="text-center font-medium">
                      {typeof slide.content === 'string' 
                        ? slide.content.substring(0, 25) + (slide.content.length > 25 ? '...' : '') 
                        : 'Title Slide'}
                    </p>
                  </div>
                ) : (
                  <p className="line-clamp-3 text-left">
                    {typeof slide.content === 'string' 
                      ? slide.content.substring(0, 30) + (slide.content.length > 30 ? '...' : '')
                      : 'Text Content'}
                  </p>
                )}
              </div>
              
              {onDeleteSlide && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSlide(index);
                  }}
                  title="Delete slide"
                >
                  <Trash className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default SlideNavigator;