import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { useStyle } from '@/lib/StyleContext';
import { toast } from 'sonner';

/**
 * Predefined presentation templates with CSS styling
 */
const templates = [
  {
    id: 'corporate',
    name: 'Corporate Blue',
    description: 'Professional theme with blue accents, ideal for business presentations',
    preview: '/templates/corporate-preview.png',
    css: `/* Corporate Theme */
:root {
  --accent-color: #0055A4;
  --bg-light: #F5F7FA;
  --text-dark: #333;
  --text-medium: #555;
  --font-heading: 'Arial', sans-serif;
  --font-body: 'Arial', sans-serif;
}
.slide { 
  font-family: var(--font-body);
  background: linear-gradient(to bottom right, var(--bg-light), white);
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.slide-title {
  font-family: var(--font-heading);
  color: var(--accent-color);
  border-bottom: 2px solid var(--accent-color);
  padding-bottom: 8px;
}
.slide-bullet-list li:before {
  background-color: var(--accent-color);
}`
  },
  {
    id: 'creative',
    name: 'Creative Red',
    description: 'Bold, eye-catching design with red accents for creative presentations',
    preview: '/templates/creative-preview.png',
    css: `/* Creative Theme */
:root {
  --accent-color: #FF5757;
  --bg-light: #FAFAFA;
  --text-dark: #222;
  --text-medium: #555;
  --font-heading: 'Georgia', serif;
  --font-body: 'Helvetica', sans-serif;
}
.slide { 
  font-family: var(--font-body);
  background-color: var(--bg-light);
  border-radius: 12px;
  border: none;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}
.slide-title {
  font-family: var(--font-heading);
  color: var(--accent-color);
  font-style: italic;
}
.slide-bullet-list li:before {
  background-color: var(--accent-color);
  border-radius: 0;
  transform: rotate(45deg);
}`
  },
  {
    id: 'minimal',
    name: 'Minimal Elegance',
    description: 'Clean, minimal design focusing on content with subtle styling',
    preview: '/templates/minimal-preview.png',
    css: `/* Minimal Theme */
:root {
  --accent-color: #666666;
  --bg-light: #FFFFFF;
  --text-dark: #333333;
  --text-medium: #666666;
  --font-heading: 'Helvetica Neue', sans-serif;
  --font-body: 'Helvetica Neue', sans-serif;
}
.slide { 
  font-family: var(--font-body);
  background-color: var(--bg-light);
  border: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
.slide-title {
  font-family: var(--font-heading);
  color: var(--text-dark);
  font-weight: 300;
  letter-spacing: -0.5px;
}
.slide-bullet-list li:before {
  width: 6px;
  height: 6px;
  background-color: var(--accent-color);
}`
  },
];

interface TemplateGalleryProps {
  onSelectTemplate?: (id: string, css: string) => void;
}

/**
 * Gallery of predefined presentation templates
 */
const TemplateGallery: React.FC<TemplateGalleryProps> = ({ onSelectTemplate }) => {
  const { setCssTemplate } = useStyle();
  
  const handleSelectTemplate = (id: string, css: string) => {
    setCssTemplate(css);
    toast.success(`Template '${id}' applied successfully`);
    
    if (onSelectTemplate) {
      onSelectTemplate(id, css);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Template Gallery</h2>
        <p className="text-muted-foreground mt-1">
          Choose a template to style your presentation
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map(template => (
          <Card key={template.id} className="overflow-hidden">
            <div 
              className="aspect-video w-full bg-muted relative border-b"
              style={{ 
                backgroundColor: template.id === 'corporate' ? '#F5F7FA' : 
                                template.id === 'creative' ? '#FAFAFA' : 
                                template.id === 'minimal' ? '#FFFFFF' : '#f5f5f5' 
              }}
            >
              {/* Always use styled div instead of images to avoid 404 errors */}
              <div 
                className="w-full h-full flex flex-col items-center justify-center p-4"
                style={{ 
                  color: template.id === 'corporate' ? '#0055A4' : 
                        template.id === 'creative' ? '#FF5757' : 
                        template.id === 'minimal' ? '#333333' : '#333333'
                }}
              >
                <h3 className="text-xl font-bold mb-2">{template.name}</h3>
                <p className="text-sm text-center">Sample Slide Title</p>
                
                {/* Add color indicator */}
                <div 
                  className="w-16 h-4 mt-2 rounded-sm"
                  style={{ 
                    backgroundColor: template.id === 'corporate' ? '#0055A4' : 
                                    template.id === 'creative' ? '#FF5757' : 
                                    template.id === 'minimal' ? '#666666' : '#333333'
                  }}
                ></div>
              </div>}
            </div>
            <CardContent className="p-4">
              <h3 className="font-medium">{template.name}</h3>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {template.description}
              </p>
              <Button 
                variant="default" 
                size="sm" 
                className="w-full"
                onClick={() => handleSelectTemplate(template.id, template.css)}
              >
                Apply Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TemplateGallery;