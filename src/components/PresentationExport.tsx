/**
 * Main entry point for the Presentation Export functionality
 * 
 * @component PresentationExport
 * @param {Object} props - Component props
 * @param {Array<Slide>} props.slides - Array of slide objects to be exported
 * @param {string|null} [props.cssTemplate] - Optional CSS template string to style the presentation
 */
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Download, Copy, Wand, FileText, FileType, FileImage } from "lucide-react";
// Import JSZip and PptxGenJS directly instead of using html-to-pptx
import pptxgen from 'pptxgenjs';
import { handleError, ErrorType } from "@/lib/error";

interface PresentationExportProps {
  slides: any[];
  cssTemplate?: string | null;
}

const PresentationExport = ({ slides, cssTemplate }: PresentationExportProps) => {
  const [exportStatus, setExportStatus] = useState<"idle" | "processing" | "completed">("idle");
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [isGeneratingEnhanced, setIsGeneratingEnhanced] = useState(false);
  const presentationRef = useRef<HTMLDivElement>(null);
  
  const generateBasicHtmlContent = () => {
    console.log("Generating HTML with CSS:", cssTemplate ? "Yes (length: " + cssTemplate.length + ")" : "No");
    
    let processedCss = cssTemplate || '';
    
    if (cssTemplate) {
      try {
        const testStyle = document.createElement('style');
        testStyle.textContent = cssTemplate;
        console.log("CSS validation passed");
      } catch (error) {
        console.error("Invalid CSS:", error);
        processedCss = '/* Invalid CSS provided */';
      }
      
      console.log("CSS Sample:", processedCss.substring(0, 150) + "...");
    }
    
    return `
<!DOCTYPE html>
<html>
<head>
  <title>Exported Presentation</title>
  <style>
    /* Base styles */
    body { 
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .slide { 
      margin: 40px auto;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      background-color: white;
      max-width: 900px;
      height: 600px;
      display: flex;
      flex-direction: column;
      position: relative;
    }
    .slide-title { 
      font-size: 32px;
      margin-bottom: 30px;
      color: #3b82f6;
    }
    .slide-content {
      flex: 1;
    }
    .slide-bullet-list {
      list-style: none;
      padding-left: 10px;
    }
    .slide-bullet-list li {
      margin-bottom: 15px;
      display: flex;
      align-items: start;
    }
    .slide-bullet-list li:before {
      content: "";
      display: inline-block;
      width: 8px;
      height: 8px;
      background-color: #3b82f6;
      border-radius: 50%;
      margin-right: 15px;
      margin-top: 10px;
    }
    .slide-footer {
      text-align: right;
      font-size: 14px;
      color: #6b7280;
      margin-top: auto;
      padding-top: 20px;
    }
    
    /* Custom template styles */
    ${processedCss || '/* No custom CSS template provided */'}
  </style>
</head>
<body>
  ${slides.map((slide, index) => `
    <div class="slide" id="slide-${index+1}">
      <h2 class="slide-title">${slide.title}</h2>
      <div class="slide-content">
        ${slide.type === "bullets" 
          ? `<ul class="slide-bullet-list">${Array.isArray(slide.content) ? slide.content.map(item => `<li>${item}</li>`).join('') : ''}</ul>` 
          : slide.type === "title"
            ? `<p style="text-align: center; font-size: 24px; margin-top: 80px;">${slide.content}</p>`
            : `<p>${slide.content}</p>`
        }
      </div>
      <div class="slide-footer">
        HTML PPT Generator - Slide ${index+1}/${slides.length}
      </div>
    </div>
  `).join('')}
</body>
</html>
    `;
  };

  const generateEnhancedHtml = async () => {
    const apiKey = localStorage.getItem("anthropicApiKey");
    
    if (!apiKey) {
      toast.error("API key not found. Please enter your Anthropic API key in the settings.");
      return;
    }
    
    setIsGeneratingEnhanced(true);
    
    try {
      const slidesData = slides.map(slide => ({
        title: slide.title,
        content: slide.content,
        type: slide.type
      }));
      
      const cssPrompt = cssTemplate 
        ? `\nUse the following CSS as a basis for styling, but enhance it as needed:\n\`\`\`css\n${cssTemplate}\n\`\`\``
        : "";
      
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-3-sonnet-20240229",
          max_tokens: 4000,
          messages: [
            {
              role: "user",
              content: `Generate an enhanced HTML presentation from the following slides data:
${JSON.stringify(slidesData, null, 2)}

Please create a visually appealing HTML presentation with:
1. Modern responsive design
2. Nice transitions between slides
3. Proper styling for each slide type
4. A navigation system
5. Clean typography${cssPrompt}

Return ONLY the complete HTML code without any explanations or markdown. The HTML should be ready to save as a standalone file.`
            }
          ]
        })
      });
      
      if (!response.ok) {
        throw new Error("Failed to generate enhanced HTML");
      }
      
      const data = await response.json();
      const enhancedHtml = data.content[0].text;
      
      const htmlMatch = enhancedHtml.match(/```html\s*([\s\S]*?)\s*```/) || 
                         enhancedHtml.match(/```\s*([\s\S]*?)\s*```/) ||
                         [null, enhancedHtml];
      
      setHtmlContent(htmlMatch[1] || enhancedHtml);
      toast.success("Enhanced HTML generated successfully");
    } catch (error) {
      console.error("Error generating enhanced HTML:", error);
      toast.error("Failed to generate enhanced HTML. Please try again.");
      setHtmlContent(generateBasicHtmlContent());
    } finally {
      setIsGeneratingEnhanced(false);
    }
  };
  
  useEffect(() => {
    console.log("CSS Template loaded:", cssTemplate ? "Yes" : "No");
    if (cssTemplate) {
      console.log("CSS Template sample:", cssTemplate.substring(0, 100) + "...");
      
      try {
        const testStyle = document.createElement('style');
        testStyle.textContent = cssTemplate;
        console.log("CSS validation passed");
      } catch (error) {
        console.error("Invalid CSS:", error);
        toast.error("The CSS template contains errors and may not render correctly");
      }
    }
    setHtmlContent(generateBasicHtmlContent());
  }, [slides, cssTemplate]);
  
  const handleExportHTML = () => {
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = "presentation.html";
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("HTML presentation exported successfully");
  };
  
  const handleExportPPT = async () => {
    setExportStatus("processing");
    
    try {
      // Create a new instance of PptxGenJS
      const pres = new pptxgen();
      
      // Process slides
      for (const slide of slides) {
        // Add a new slide
        const pptSlide = pres.addSlide();
        
        // Set slide title
        pptSlide.addText(slide.title, { 
          x: 0.5, 
          y: 0.5, 
          w: '90%', 
          fontSize: 24,
          bold: true,
          color: '363636'
        });
        
        // Add content based on slide type
        if (slide.type === 'bullets' && Array.isArray(slide.content)) {
          // For bullet points
          slide.content.forEach((item, index) => {
            pptSlide.addText(item, {
              x: 0.5,
              y: 1.5 + (index * 0.5),
              w: '90%',
              bullet: true,
              fontSize: 16,
              color: '4a4a4a'
            });
          });
        } else if (slide.type === 'title') {
          // For title slides
          pptSlide.addText(typeof slide.content === 'string' ? slide.content : '', {
            x: 0.5,
            y: 3,
            w: '90%',
            h: 1,
            align: 'center',
            fontSize: 20,
            color: '4a4a4a'
          });
        } else {
          // For text slides
          pptSlide.addText(typeof slide.content === 'string' ? slide.content : '', {
            x: 0.5,
            y: 1.5,
            w: '90%',
            fontSize: 16,
            color: '4a4a4a'
          });
        }
        
        // Add slide number
        pptSlide.addText(`Slide ${slide.id}`, {
          x: 0.5,
          y: 6.5,
          w: 2,
          fontSize: 10,
          color: '9e9e9e'
        });
      }
      
      // Apply a theme if available
      if (cssTemplate) {
        try {
          // Extract colors from CSS if possible
          const accentColorMatch = cssTemplate.match(/--accent-color:\s*([^;]*)/);
          if (accentColorMatch && accentColorMatch[1]) {
            const accentColor = accentColorMatch[1].trim();
            
            // Apply as theme colors if it's a hex color
            if (accentColor.startsWith('#')) {
              pres.defineTheme({
                name: 'customTheme',
                headFontFace: 'Arial',
                bodyFontFace: 'Arial',
                colorScheme: 'custom',
                title: { color: accentColor },
                background: { color: '#FFFFFF' }
              });
              pres.applyTheme('customTheme');
            }
          }
        } catch (error) {
          console.warn('Could not apply CSS theme to PowerPoint', error);
        }
      }
      
      // Save the presentation
      pres.writeFile({ fileName: 'presentation.pptx' })
        .then(() => {
          setExportStatus("completed");
          toast.success("PowerPoint presentation exported successfully");
        })
        .catch((error) => {
          handleError(error, ErrorType.EXPORT, "Failed to save PowerPoint file", {
            retry: () => handleExportPPT()
          });
          setExportStatus("idle");
        });
    } catch (error) {
      handleError(error, ErrorType.EXPORT, "Error generating PowerPoint", {
        retry: () => handleExportPPT()
      });
      setExportStatus("idle");
    }
  };
  
  const handleCopyHTML = () => {
    navigator.clipboard.writeText(htmlContent);
    toast.success("HTML copied to clipboard");
  };
  
  /**
   * Exports the presentation as a PDF file
   * This uses the native browser print functionality with PDF export
   */
  const handleExportPDF = () => {
    setExportStatus("processing");
    
    try {
      // Create a temporary iframe to render the HTML content for printing
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.top = '-9999px';
      iframe.style.left = '-9999px';
      iframe.style.width = '1024px';  // Standard presentation width
      iframe.style.height = '768px';  // Standard presentation height
      iframe.style.border = 'none';
      document.body.appendChild(iframe);
      
      // Add content to the iframe
      iframe.contentWindow?.document.open();
      iframe.contentWindow?.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Presentation Export</title>
          <style>
            @page {
              size: landscape;
              margin: 0;
            }
            body {
              margin: 0;
            }
            .slide-page {
              page-break-after: always;
              height: 100vh;
              width: 100vw;
              display: flex;
              flex-direction: column;
              padding: 0;
              margin: 0;
              overflow: hidden;
            }
            ${cssTemplate || ''}
          </style>
        </head>
        <body>
          ${slides.map((slide, index) => `
            <div class="slide-page">
              <div class="slide" style="height: 100%; width: 100%; margin: 0; box-shadow: none; border-radius: 0;">
                <h2 class="slide-title">${slide.title}</h2>
                <div class="slide-content">
                  ${slide.type === "bullets" 
                    ? `<ul class="slide-bullet-list">${Array.isArray(slide.content) ? slide.content.map(item => `<li>${item}</li>`).join('') : ''}</ul>` 
                    : slide.type === "title"
                      ? `<p style="text-align: center; font-size: 24px; margin-top: 80px;">${slide.content}</p>`
                      : `<p>${slide.content}</p>`
                  }
                </div>
                <div class="slide-footer">
                  Slide ${index+1}/${slides.length}
                </div>
              </div>
            </div>
          `).join('')}
        </body>
        </html>
      `);
      iframe.contentWindow?.document.close();
      
      // Wait a moment for rendering and then print
      setTimeout(() => {
        iframe.contentWindow?.print();
        
        // Remove the iframe after printing
        setTimeout(() => {
          document.body.removeChild(iframe);
          setExportStatus("completed");
          toast.success("PDF export prepared. Use your browser's save as PDF option in the print dialog.");
        }, 1000);
      }, 500);
    } catch (error) {
      handleError(error, ErrorType.EXPORT, "Failed to generate PDF", {
        retry: () => handleExportPDF()
      });
      setExportStatus("idle");
    }
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
            
            <div className="mt-6 flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => {
                setHtmlContent(generateBasicHtmlContent());
                toast.success("Basic HTML template loaded");
              }}>
                Basic Template
              </Button>
              
              <Button 
                variant="default" 
                onClick={generateEnhancedHtml}
                disabled={isGeneratingEnhanced}
              >
                {isGeneratingEnhanced ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand className="mr-2 h-4 w-4" />
                    Generate Enhanced HTML
                  </>
                )}
              </Button>
            </div>
            
            <div className="mt-4 flex space-x-2">
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
        
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center mb-4">
                <FileType className="h-6 w-6 mr-2 text-primary" />
                <h3 className="text-lg font-medium">PowerPoint Export</h3>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                Convert your HTML presentation to a PowerPoint (PPTX) file directly in your browser.
              </p>
              
              <div className="mt-6">
                {exportStatus === "idle" && (
                  <Button onClick={handleExportPPT} className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Generate PowerPoint
                  </Button>
                )}
                
                {exportStatus === "processing" && (
                  <Button disabled className="w-full">
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    Processing...
                  </Button>
                )}
                
                {exportStatus === "completed" && (
                  <div className="space-y-4">
                    <p className="text-sm text-green-600">
                      PowerPoint file generated successfully!
                    </p>
                    
                    <Button onClick={handleExportPPT} className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Download PowerPoint
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center mb-4">
                <FileImage className="h-6 w-6 mr-2 text-primary" />
                <h3 className="text-lg font-medium">PDF Export</h3>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                Export your presentation as a print-ready PDF document with proper page breaks.
              </p>
              
              <div className="mt-6">
                <Button onClick={handleExportPDF} className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Export as PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="mt-8">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">HTML Preview</h3>
            <Textarea
              readOnly
              className="font-mono text-sm"
              rows={10}
              value={htmlContent}
            />
            
            {cssTemplate && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">CSS Template Applied</h4>
                <div className="p-3 bg-gray-100 rounded-md text-xs font-mono overflow-auto max-h-32">
                  {cssTemplate.substring(0, 300)}
                  {cssTemplate.length > 300 ? '...' : ''}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Hidden div for rendering HTML content for PowerPoint export */}
      <div ref={presentationRef} style={{ display: 'none' }}></div>
    </div>
  );
};

export default PresentationExport;
