
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Download, Copy, ExternalLink, FileText } from "lucide-react";

interface PresentationExportProps {
  slides: any[];
}

const PresentationExport = ({ slides }: PresentationExportProps) => {
  const [exportStatus, setExportStatus] = useState<"idle" | "processing" | "completed">("idle");
  const [exportLink, setExportLink] = useState<string | null>(null);
  
  const generateHtmlContent = () => {
    // In a real app, this would generate proper HTML for the presentation
    return `
<!DOCTYPE html>
<html>
<head>
  <title>Exported Presentation</title>
  <style>
    body { font-family: Arial, sans-serif; }
    .slide { margin-bottom: 50px; padding: 20px; border: 1px solid #ddd; }
    .slide-title { font-size: 24px; margin-bottom: 20px; }
    ul { margin-top: 10px; }
  </style>
</head>
<body>
  ${slides.map(slide => `
    <div class="slide">
      <h2 class="slide-title">${slide.title}</h2>
      ${slide.type === "bullets" 
        ? `<ul>${Array.isArray(slide.content) ? slide.content.map(item => `<li>${item}</li>`).join('') : ''}</ul>` 
        : `<p>${slide.content}</p>`
      }
    </div>
  `).join('')}
</body>
</html>
    `;
  };
  
  const handleExportHTML = () => {
    const htmlContent = generateHtmlContent();
    
    // Create a Blob from the HTML content
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    
    // Create an anchor element and trigger a download
    const a = document.createElement("a");
    a.href = url;
    a.download = "presentation.html";
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("HTML presentation exported successfully");
  };
  
  const handleExportPPT = () => {
    // In a real app, this would call a conversion service API
    setExportStatus("processing");
    
    // Simulate API call delay
    setTimeout(() => {
      setExportStatus("completed");
      setExportLink("https://example.com/download/presentation.pptx");
      toast.success("PowerPoint presentation generated successfully");
    }, 2000);
  };
  
  const handleCopyHTML = () => {
    const htmlContent = generateHtmlContent();
    navigator.clipboard.writeText(htmlContent);
    toast.success("HTML copied to clipboard");
  };
  
  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Export Presentation</h2>
        <p className="text-muted-foreground">
          Export your presentation in different formats
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center mb-4">
              <FileText className="h-6 w-6 mr-2 text-primary" />
              <h3 className="text-lg font-medium">HTML Export</h3>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              Export your presentation as an HTML file that can be viewed in any browser. This format preserves all formatting and styling.
            </p>
            
            <div className="mt-6 flex space-x-2">
              <Button onClick={handleExportHTML}>
                <Download className="mr-2 h-4 w-4" />
                Download HTML
              </Button>
              
              <Button variant="outline" onClick={handleCopyHTML}>
                <Copy className="mr-2 h-4 w-4" />
                Copy HTML
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center mb-4">
              <FileText className="h-6 w-6 mr-2 text-primary" />
              <h3 className="text-lg font-medium">PowerPoint Export</h3>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              Convert your HTML presentation to a PowerPoint (PPTX) file. This uses a third-party service to perform the conversion.
            </p>
            
            <div className="mt-6">
              {exportStatus === "idle" && (
                <Button onClick={handleExportPPT}>
                  <Download className="mr-2 h-4 w-4" />
                  Generate PowerPoint
                </Button>
              )}
              
              {exportStatus === "processing" && (
                <Button disabled>
                  <div className="spinner mr-2"></div>
                  Processing...
                </Button>
              )}
              
              {exportStatus === "completed" && exportLink && (
                <div className="space-y-4">
                  <p className="text-sm text-green-600">
                    PowerPoint file generated successfully!
                  </p>
                  
                  <Button asChild>
                    <a href={exportLink} target="_blank" rel="noopener noreferrer">
                      <Download className="mr-2 h-4 w-4" />
                      Download PowerPoint
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">HTML Preview</h3>
            <Textarea
              readOnly
              className="font-mono text-sm"
              rows={10}
              value={generateHtmlContent()}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PresentationExport;
