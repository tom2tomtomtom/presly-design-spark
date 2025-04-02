
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Image, Upload } from "lucide-react";

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
    }
  };
  
  const predefinedTemplates = [
    { id: 1, name: "Corporate Blue", color: "bg-blue-500" },
    { id: 2, name: "Elegant Black", color: "bg-gray-900" },
    { id: 3, name: "Vibrant Green", color: "bg-green-500" },
  ];
  
  const selectPredefinedTemplate = (id: number) => {
    setSelectedTemplate(id);
    setTemplatePreview(null);
    setCssContent(null);
    setTemplateFile(null);
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

      <div>
        <h3 className="text-lg font-medium mb-4">Or select a predefined template:</h3>
        <div className="grid grid-cols-3 gap-4">
          {predefinedTemplates.map((template) => (
            <div 
              key={template.id}
              className={`template-preview ${selectedTemplate === template.id ? 'selected' : ''}`}
              onClick={() => selectPredefinedTemplate(template.id)}
            >
              <div className={`h-32 ${template.color} rounded-md mb-2`}></div>
              <p className="text-center text-sm font-medium">{template.name}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-8 flex justify-end">
        <Button 
          onClick={onProcess}
          disabled={!docFile && !selectedTemplate}
          className="px-6"
        >
          <Upload className="mr-2 h-4 w-4" />
          Generate Presentation
        </Button>
      </div>
    </div>
  );
};

export default FileUploadStep;
