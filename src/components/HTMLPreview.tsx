import { useRef, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2 } from "lucide-react";

interface HTMLPreviewProps {
  html: string;
}

/**
 * HTMLPreview component
 * Renders an HTML preview using a data URI iframe with the provided HTML content
 * to avoid cross-origin security issues
 */
const HTMLPreview = ({ html }: HTMLPreviewProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeSrc, setIframeSrc] = useState<string>("");

  // Create a data URI from the HTML content
  useEffect(() => {
    // Convert HTML to a data URI
    const htmlBlob = new Blob([html], { type: 'text/html' });
    const dataURI = URL.createObjectURL(htmlBlob);
    setIframeSrc(dataURI);
    
    // Clean up object URL when component unmounts or HTML changes
    return () => {
      URL.revokeObjectURL(dataURI);
    };
  }, [html]);

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'w-full'}`}>
      <Card className={`${isFullscreen ? 'h-full rounded-none' : 'h-[600px]'}`}>
        <CardContent className="p-0 relative h-full">
          <div className="absolute top-2 right-2 z-10">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={toggleFullscreen}
              className="bg-white/80 backdrop-blur-sm hover:bg-white/90"
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {iframeSrc && (
            <iframe
              src={iframeSrc}
              title="Presentation Preview"
              className="w-full h-full border-0"
              sandbox="allow-scripts"
              referrerPolicy="no-referrer"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HTMLPreview;