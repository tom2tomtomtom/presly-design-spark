
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Image, Upload, ArrowRight } from "lucide-react";
import TemplateGallery from "./TemplateGallery";
import { useStyle } from "@/lib/StyleContext";
import { toast } from "sonner";

// Function to extract CSS from HTML content
const extractCSSFromHTML = (htmlContent: string): string | null => {
  // Create a temporary DOM element to parse the HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  
  // Extract all style tags
  const styleTags = doc.querySelectorAll('style');
  if (styleTags.length === 0) return null;
  
  // Combine all CSS content
  let combinedCSS = '';
  styleTags.forEach(style => {
    combinedCSS += style.textContent + '\n\n';
  });
  
  return combinedCSS;
};

// Slide template type interface
interface SlideTemplates {
  title?: string;  // HTML structure for title slides
  bullets?: string; // HTML structure for bullet slides
  content?: string; // HTML structure for content slides
  twoColumn?: string; // HTML structure for two-column slides
  closing?: string; // HTML structure for closing/thank you slides
}

// Function to extract slide templates from HTML
const extractSlideTemplates = (htmlContent: string): SlideTemplates | null => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  
  // Find slides in the document
  const slides = doc.querySelectorAll('.slide');
  if (slides.length === 0) return null;
  
  const templates: SlideTemplates = {};
  
  // Process each slide to identify its type
  slides.forEach(slide => {
    // Clone the slide to capture its HTML structure
    const slideClone = slide.cloneNode(true) as HTMLElement;
    
    // Determine slide type based on content or class
    if (slide.classList.contains('title-slide') || 
        slide.id === 'slide-1' || 
        slideClone.textContent?.includes('Thank You')) {
      // This is either a title or closing slide
      if (slideClone.textContent?.includes('Thank You') || 
          slideClone.querySelector('h1')?.textContent?.includes('Thank You')) {
        templates.closing = slideClone.outerHTML;
      } else {
        templates.title = slideClone.outerHTML;
      }
    } 
    else if (slide.querySelector('.slide-points') || 
             slide.querySelector('.slide-bullet-list') ||
             slide.querySelector('ul')) {
      // This is a bullet points slide
      templates.bullets = slideClone.outerHTML;
    }
    else if (slide.querySelector('.two-columns')) {
      // This is a two-column layout
      templates.twoColumn = slideClone.outerHTML;
    }
    else {
      // Default to content slide
      templates.content = slideClone.outerHTML;
    }
  });
  
  return templates;
};

interface FileUploadStepProps {
  docFile: File | null;
  setDocFile: (file: File | null) => void;
  templateFile: File | null;
  setTemplateFile: (file: File | null) => void;
  onProcess: () => void;
}

const FileUploadStep = ({ 
  docFile, 
  setDocFile, 
  templateFile, 
  setTemplateFile, 
  onProcess 
}: FileUploadStepProps) => {
  const [templatePreview, setTemplatePreview] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [cssContent, setCssContent] = useState<string | null>(null);
  
  const handleDocFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocFile(e.target.files[0]);
    }
  };

  const handleTemplateFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setTemplateFile(file);
      
      // Create a preview URL for image templates
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target && typeof e.target.result === 'string') {
            setTemplatePreview(e.target.result);
            setCssContent(null);
          }
        };
        reader.readAsDataURL(file);
      }
      // Handle CSS files
      else if (file.name.endsWith('.css')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target && typeof e.target.result === 'string') {
            setCssContent(e.target.result);
            setTemplatePreview(null);
            
            // Add a preview for CSS files
            const cssPreview = `
              <div class="css-preview">
                <div class="preview-header">CSS Template Preview</div>
                <div class="preview-content">Custom styles loaded</div>
              </div>
            `;
            
            // Create a data URL with embedded styles
            const htmlWithStyles = `
              <html>
                <head>
                  <style>${e.target.result}</style>
                  <style>
                    body { margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; height: 100%; }
                    .css-preview { text-align: center; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; max-width: 100%; }
                    .preview-header { padding: 10px; background: linear-gradient(to right, #4f46e5, #3b82f6); color: white; font-weight: bold; }
                    .preview-content { padding: 20px; }
                  </style>
                </head>
                <body>${cssPreview}</body>
              </html>
            `;
            setTemplatePreview(`data:text/html;charset=utf-8,${encodeURIComponent(htmlWithStyles)}`);
          }
        };
        reader.readAsText(file);
      }
      // Handle HTML template files
      else if (file.name.endsWith('.html')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target && typeof e.target.result === 'string') {
            const htmlContent = e.target.result;
            
            // Extract CSS from the HTML file
            const extractedCSS = extractCSSFromHTML(htmlContent);
            
            // Extract slide templates from HTML
            const slideTemplates = extractSlideTemplates(htmlContent);
            
            if (extractedCSS) {
              setCssContent(extractedCSS);
              
              // Store slide templates in localStorage for later use
              if (slideTemplates && Object.keys(slideTemplates).length > 0) {
                localStorage.setItem('slideTemplates', JSON.stringify(slideTemplates));
                toast.success(`Template loaded with ${Object.keys(slideTemplates).length} slide types`);
              }
              
              // Store the raw HTML template in localStorage for direct use
              localStorage.setItem('rawHtmlTemplate', htmlContent);
              console.log("Raw HTML template stored (length: " + htmlContent.length + " chars)");
              
              // Create a preview with the first slide
              setTemplatePreview(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);
            } else {
              toast.error("No CSS styles found in the HTML template");
            }
          }
        };
        reader.readAsText(file);
      }
    }
  };
  
  const { setCssTemplate } = useStyle();
  
  const handleTemplateSelection = (id: string, css: string) => {
    // Reset other template selections
    setSelectedTemplate(null);
    setTemplatePreview(null);
    setCssContent(css);
    setTemplateFile(null);
    
    // Create a CSS file object from the template
    const cssBlob = new Blob([css], { type: 'text/css' });
    const file = new File([cssBlob], `${id}-template.css`, { type: 'text/css' });
    setTemplateFile(file);
    
    toast.success(`Template "${id}" selected`);
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-center h-40 border-2 border-dashed rounded-md border-gray-300 bg-gray-50">
                {docFile ? (
                  <div className="text-center">
                    <FileText className="mx-auto h-12 w-12 text-primary" />
                    <p className="mt-2 text-sm font-medium">{docFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(docFile.size / 1024).toFixed(2)} KB
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setDocFile(null)}
                      className="mt-2"
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      Upload your DOC file
                    </p>
                    <p className="text-xs text-gray-400">
                      This will be used to extract your slide content
                    </p>
                  </div>
                )}
              </div>
              
              <div>
                <Label htmlFor="doc-file">Document File</Label>
                <Input
                  id="doc-file"
                  type="file"
                  accept=".doc,.docx,.txt"
                  onChange={handleDocFileChange}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Upload a DOC, DOCX, or TXT file containing your slide content
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-center h-40 border-2 border-dashed rounded-md border-gray-300 bg-gray-50">
                {templatePreview ? (
                  <div className="text-center w-full h-full">
                    {templateFile?.name.endsWith('.css') ? (
                      <iframe 
                        src={templatePreview} 
                        title="CSS Preview" 
                        className="w-full h-full rounded"
                      />
                    ) : (
                      <img 
                        src={templatePreview} 
                        alt="Template preview" 
                        className="h-32 object-contain mx-auto" 
                      />
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setTemplatePreview(null);
                        setCssContent(null);
                        setTemplateFile(null);
                      }}
                      className="mt-2"
                    >
                      Remove
                    </Button>
                  </div>
                ) : templateFile ? (
                  <div className="text-center">
                    <Image className="mx-auto h-12 w-12 text-primary" />
                    <p className="mt-2 text-sm font-medium">{templateFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(templateFile.size / 1024).toFixed(2)} KB
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setTemplateFile(null)}
                      className="mt-2"
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Image className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      Upload a design template
                    </p>
                    <p className="text-xs text-gray-400">
                      This will define the style of your presentation
                    </p>
                  </div>
                )}
              </div>
              
              <div>
                <Label htmlFor="template-file">Design Template</Label>
                <Input
                  id="template-file"
                  type="file"
                  accept="image/*,.html,.css"
                  onChange={handleTemplateFileChange}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Upload an image, HTML, or CSS file to use as your design template
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <TemplateGallery onSelectTemplate={handleTemplateSelection} />
        </CardContent>
      </Card>
      
      <div className="mt-8 flex justify-end">
        <Button 
          onClick={onProcess}
          disabled={!docFile}
          className="px-6"
        >
          <ArrowRight className="mr-2 h-4 w-4" />
          Continue to Editing
        </Button>
      </div>
    </div>
  );
};

export default FileUploadStep;
