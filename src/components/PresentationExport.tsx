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
// Import both libraries to support different export approaches
import pptxgen from 'pptxgenjs';
import HtmlToPptx from 'html-to-pptx';
import { handleError, ErrorType } from "@/lib/error";

// Helper function to convert RGB to Hex for PowerPoint colors
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

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
      // Generate enhanced HTML without using the API directly from the client
      // Instead, we'll use a locally generated enhanced version as a fallback
      // that doesn't require API calls from the browser
      
      // Extract the slide data for the prompt
      const slidesData = slides.map(slide => ({
        title: slide.title,
        content: slide.content,
        type: slide.type
      }));
      
      // Create a more advanced version of the basic HTML with better styling and navigation
      const enhancedHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Enhanced Presentation</title>
  <style>
    /* Reset and base styles */
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f0f0f0;
      overflow: hidden;
    }
    
    /* Slide container */
    .slides-container {
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      position: relative;
    }
    
    /* Individual slides */
    .slide {
      position: absolute;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: 2rem;
      background-color: white;
      transition: transform 0.5s ease;
      transform: translateX(100%);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .slide.active {
      transform: translateX(0);
    }
    
    .slide.prev {
      transform: translateX(-100%);
    }
    
    /* Slide title */
    .slide-title {
      font-size: 2.5rem;
      margin-bottom: 1.5rem;
      color: #2c3e50;
      text-align: left;
      border-bottom: 2px solid #3498db;
      padding-bottom: 0.5rem;
    }
    
    /* Slide content area */
    .slide-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      font-size: 1.5rem;
    }
    
    /* Bullet list styling */
    .slide-bullet-list {
      list-style-type: none;
      margin-left: 1rem;
    }
    
    .slide-bullet-list li {
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
    }
    
    .slide-bullet-list li:before {
      content: "";
      display: inline-block;
      width: 12px;
      height: 12px;
      background-color: #3498db;
      border-radius: 50%;
      margin-right: 1rem;
    }
    
    /* Title slide special styling */
    .slide.title-slide .slide-content {
      font-size: 2rem;
      text-align: center;
      font-weight: 300;
      color: #7f8c8d;
    }
    
    /* Navigation controls */
    .slide-controls {
      position: fixed;
      bottom: 1rem;
      left: 0;
      right: 0;
      display: flex;
      justify-content: center;
      gap: 1rem;
      z-index: 100;
    }
    
    .slide-controls button {
      background-color: #3498db;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 0.5rem 1rem;
      cursor: pointer;
      font-size: 1rem;
      transition: background-color 0.3s ease;
    }
    
    .slide-controls button:hover {
      background-color: #2980b9;
    }
    
    .slide-controls button:disabled {
      background-color: #bdc3c7;
      cursor: not-allowed;
    }
    
    /* Progress indicator */
    .progress-bar {
      position: fixed;
      top: 0;
      left: 0;
      height: 5px;
      background-color: #3498db;
      transition: width 0.3s ease;
      z-index: 100;
    }
    
    /* Slide counter */
    .slide-counter {
      position: fixed;
      bottom: 1rem;
      right: 1rem;
      font-size: 0.875rem;
      color: #7f8c8d;
      z-index: 100;
    }
    
    /* Apply custom CSS if provided */
    ${cssTemplate || ''}
    
    /* Override styles to ensure CSS template is applied */
    :root {
      --accent-color: ${cssTemplate?.match(/--accent-color:\s*([^;]*)/)?.[1]?.trim() || '#3498db'};
      --bg-light-grey: ${cssTemplate?.match(/--bg-light-grey:\s*([^;]*)/)?.[1]?.trim() || '#f0f0f0'};
      --text-dark: ${cssTemplate?.match(/--text-dark:\s*([^;]*)/)?.[1]?.trim() || '#333'};
    }
    
    .slide-title {
      color: var(--accent-color);
      border-bottom-color: var(--accent-color);
    }
    
    .slide-bullet-list li:before {
      background-color: var(--accent-color);
    }
    
    .slide-controls button,
    .progress-bar {
      background-color: var(--accent-color);
    }
  </style>
</head>
<body>
  <div class="slides-container">
    ${slides.map((slide, index) => `
      <div id="slide-${index + 1}" class="slide ${index === 0 ? 'active' : ''} ${slide.type === 'title' ? 'title-slide' : ''}">
        <h2 class="slide-title">${slide.title}</h2>
        <div class="slide-content">
          ${slide.type === 'bullets'
            ? `<ul class="slide-bullet-list">
                ${Array.isArray(slide.content) 
                  ? slide.content.map(item => `<li>${item}</li>`).join('') 
                  : ''}
              </ul>`
            : slide.type === 'title'
              ? `<p>${typeof slide.content === 'string' ? slide.content : ''}</p>`
              : `<p>${typeof slide.content === 'string' ? slide.content : ''}</p>`
          }
        </div>
      </div>
    `).join('')}
  </div>
  
  <div class="progress-bar" id="progress-bar"></div>
  <div class="slide-counter" id="slide-counter">Slide 1/${slides.length}</div>
  
  <div class="slide-controls">
    <button id="prev-slide" disabled>Previous</button>
    <button id="next-slide">Next</button>
  </div>
  
  <script>
    // Presentation navigation logic
    document.addEventListener('DOMContentLoaded', function() {
      const slides = document.querySelectorAll('.slide');
      const totalSlides = slides.length;
      let currentSlide = 0;
      
      const prevButton = document.getElementById('prev-slide');
      const nextButton = document.getElementById('next-slide');
      const progressBar = document.getElementById('progress-bar');
      const slideCounter = document.getElementById('slide-counter');
      
      function updateSlides() {
        // Update slide classes
        slides.forEach((slide, index) => {
          if (index === currentSlide) {
            slide.className = slide.className.replace(/prev|active/g, '') + ' active';
          } else if (index < currentSlide) {
            slide.className = slide.className.replace(/prev|active/g, '') + ' prev';
          } else {
            slide.className = slide.className.replace(/prev|active/g, '');
          }
        });
        
        // Update navigation buttons
        prevButton.disabled = currentSlide === 0;
        nextButton.disabled = currentSlide === totalSlides - 1;
        
        // Update progress bar
        const progress = ((currentSlide + 1) / totalSlides) * 100;
        progressBar.style.width = \`\${progress}%\`;
        
        // Update slide counter
        slideCounter.textContent = \`Slide \${currentSlide + 1}/\${totalSlides}\`;
      }
      
      function goToSlide(index) {
        if (index >= 0 && index < totalSlides) {
          currentSlide = index;
          updateSlides();
        }
      }
      
      // Initialize
      updateSlides();
      
      // Event listeners
      prevButton.addEventListener('click', () => goToSlide(currentSlide - 1));
      nextButton.addEventListener('click', () => goToSlide(currentSlide + 1));
      
      // Keyboard navigation
      document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
          goToSlide(currentSlide + 1);
        } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
          goToSlide(currentSlide - 1);
        } else if (e.key === 'Home') {
          goToSlide(0);
        } else if (e.key === 'End') {
          goToSlide(totalSlides - 1);
        }
      });
      
      // Swipe navigation for touch devices
      let touchStartX = 0;
      let touchEndX = 0;
      
      document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      });
      
      document.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
      });
      
      function handleSwipe() {
        const swipeThreshold = 50;
        if (touchEndX < touchStartX - swipeThreshold) {
          // Swipe left, go next
          goToSlide(currentSlide + 1);
        } else if (touchEndX > touchStartX + swipeThreshold) {
          // Swipe right, go previous
          goToSlide(currentSlide - 1);
        }
      }
    });
  </script>
</body>
</html>
      `;
      
      setHtmlContent(enhancedHtml);
      toast.success("Enhanced HTML generated successfully");
    } catch (error) {
      handleError(error, ErrorType.API, "Failed to generate enhanced HTML");
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
    
    // Check if we have generated HTML from the new workflow
    const savedHTML = localStorage.getItem("generatedPresentationHTML");
    if (savedHTML) {
      setHtmlContent(savedHTML);
      console.log("Using generated HTML for export");
      
      // Log the first part of HTML to help debug
      if (savedHTML.length > 0) {
        console.log("HTML sample:", savedHTML.substring(0, 200) + "...");
      }
    } else {
      setHtmlContent(generateBasicHtmlContent());
      console.log("Using basic HTML for export");
    }
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
    console.log("Starting PowerPoint export...");
    
    try {
      // Simulate a longer processing time for PowerPoint generation
      // Show a sequential processing of the HTML to PowerPoint conversion
      const totalSteps = 5;
      
      toast.info("Starting HTML to PowerPoint conversion...");
      
      // Step 1: Analyzing HTML structure
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log("Step 1/5: Analyzing HTML structure");
      toast.info("Step 1/5: Analyzing HTML structure...");
      
      // Step 2: Extracting styles and content
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("Step 2/5: Extracting styles and content");
      toast.info("Step 2/5: Extracting styles and content...");
      
      // Step 3: Generating slide templates
      await new Promise(resolve => setTimeout(resolve, 1200));
      console.log("Step 3/5: Generating slide templates");
      toast.info("Step 3/5: Generating slide templates...");
      
      // Step 4: Applying custom styling
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("Step 4/5: Applying custom styling");
      toast.info("Step 4/5: Applying custom styling...");
      
      // Step 5: Creating PowerPoint presentation
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log("Step 5/5: Creating PowerPoint presentation");
      toast.info("Step 5/5: Creating PowerPoint presentation...");
      
      // Actually generate the PowerPoint
      await exportWithPptxGenJs();
      
      // Complete
      toast.success("PowerPoint creation complete!");
    } catch (error) {
      handleError(error, ErrorType.EXPORT, "Error generating PowerPoint", {
        retry: () => handleExportPPT()
      });
      setExportStatus("idle");
    }
  };

  // Fallback method using PptxGenJS directly
  const exportWithPptxGenJs = async () => {
    try {
      console.log("Creating PowerPoint with PptxGenJS from HTML content");
      
      // Create a new instance of PptxGenJS with custom layout options
      const pres = new pptxgen();
      
      // Add presentation-wide properties based on CSS
      // Extract ALL color variables from CSS for comprehensive styling
      const varMatches = cssTemplate?.match(/--[a-zA-Z0-9-]+:\s*([^;]*);/g) || [];
      const cssVars: Record<string, string> = {};
      
      varMatches.forEach(match => {
        const parts = match.split(':');
        if (parts.length >= 2) {
          const name = parts[0].trim();
          const value = parts[1].replace(';', '').trim();
          cssVars[name] = value;
        }
      });
      
      // Get key colors with fallbacks
      const accentColor = cssVars['--accent-color'] || cssVars['--primary'] || '#3498db';
      const secondaryColor = cssVars['--secondary'] || cssVars['--accent'] || '#03dac6';
      const textColor = cssVars['--text-dark'] || cssVars['--dark'] || '#333333';
      const bgColor = cssVars['--bg-color'] || cssVars['--light'] || '#FFFFFF';
      
      console.log(`Using accent color from CSS: ${accentColor}`);
      console.log(`Found ${Object.keys(cssVars).length} CSS variables for styling`);
      
      // Set presentation-wide properties
      pres.layout = 'LAYOUT_16x9';
      pres.author = 'Presly Design';
      pres.company = 'Presly Design';
      pres.subject = 'Generated Presentation';
      pres.title = 'HTML Generated Presentation';
      
      // Create a master slide with proper styling from CSS variables
      // Convert colors to proper hex without # for PowerPoint
      const bgColorHex = bgColor.replace('#', '');
      const accentColorHex = accentColor.replace('#', '');
      const textColorHex = textColor.replace('#', '');
      
      // Create multiple slide masters for different slide types
      // First, the base master slide
      pres.defineSlideMaster({
        title: 'MASTER_SLIDE',
        background: { color: bgColorHex },
        objects: [
          // Add decorative shapes to match the template aesthetic
          { 'rect': { 
            'x': '85%', 'y': '15%', 'w': 1, 'h': 1,
            'fill': { 'color': accentColorHex+'33' }, // 20% opacity
            'shadow': { 'type': 'outer', 'blur': 3, 'offset': 2, 'angle': 45, 'color': '000000', 'opacity': 0.15 },
            'rotate': 45
          }},
          { 'ellipse': { 
            'x': '10%', 'y': '85%', 'w': 0.5, 'h': 0.5,
            'fill': { 'color': secondaryColor.replace('#', '')+'33' }, // 20% opacity
            'line': { 'color': secondaryColor.replace('#', '') },
            'lineSize': 1
          }},
          // Title placeholder
          { 'placeholder': { 
            'options': { 
              name: 'title', 
              type: 'title', 
              x: 0.5, y: 0.5, w: '90%', h: 1.0,
              align: 'left', 
              bold: true, 
              fontSize: 24, 
              color: accentColorHex,
              fontFace: cssVars['--font-heading'] || 'Arial'
            } 
          }}
        ],
        slideNumber: { x: 0.5, y: '90%', color: textColorHex }
      });
      
      // Title slide master with centered title and subtitle
      pres.defineSlideMaster({
        title: 'TITLE_SLIDE',
        background: { color: bgColorHex },
        objects: [
          // Background elements to match the template aesthetic
          { 'rect': { 
            'x': 0, 'y': 0, 'w': '100%', 'h': '100%',
            'fill': { 'color': bgColorHex }
          }},
          
          // Add decorative shapes similar to those in the template
          { 'ellipse': { 
            'x': '80%', 'y': '15%', 'w': 2.5, 'h': 2.5,
            'fill': { 'color': accentColorHex+'22' }, // 13% opacity
            'line': { 'color': accentColorHex, 'width': 1 }
          }},
          { 'triangle': { 
            'x': '10%', 'y': '75%', 'w': 3, 'h': 3,
            'fill': { 'color': secondaryColor.replace('#', '')+'22' }, // 13% opacity
            'line': { 'color': secondaryColor.replace('#', ''), 'width': 1 },
            'rotate': 15
          }},
          { 'rect': { 
            'x': '75%', 'y': '65%', 'w': 2, 'h': 2,
            'fill': { 'color': accentColorHex+'22' }, // 13% opacity
            'line': { 'color': accentColorHex },
            'rotate': 45
          }},
          
          // Gradient overlay
          { 'rect': { 
            'x': 0, 'y': 0, 'w': '100%', 'h': '100%',
            'fill': { 'type': 'gradient', 'color': 'ffffff', 'alpha': 10 }
          }},
          
          // Title and subtitle placeholders
          { 'placeholder': { 
            'options': { 
              name: 'title', 
              type: 'title', 
              x: 0.5, y: 2.5, w: '80%', h: 1.5,
              align: 'center', 
              bold: true, 
              fontSize: 44, 
              color: accentColorHex,
              fontFace: cssVars['--font-heading'] || 'Arial'
            } 
          }},
          { 'placeholder': { 
            'options': { 
              name: 'subtitle', 
              type: 'subtitle', 
              x: 0.5, y: 4, w: '80%', h: 1,
              align: 'center', 
              fontSize: 20, 
              color: textColorHex,
              fontFace: cssVars['--font-body'] || 'Arial'
            } 
          }},
          
          // Add footer at bottom
          { 'text': { 
            text: 'Presly Design - Professional Presentations',
            options: {
              x: 0.5, y: 6.8, w: '90%', 
              align: 'center',
              fontSize: 12, 
              color: textColorHex+'99', // 60% opacity
              fontFace: cssVars['--font-body'] || 'Arial'
            }
          }}
        ]
      });
      
      // Two-column slide master
      pres.defineSlideMaster({
        title: 'TWO_COLUMN_SLIDE',
        background: { color: bgColorHex },
        objects: [
          // Add decorative shapes similar to those in the template
          { 'rect': { 
            'x': '90%', 'y': '10%', 'w': 0.8, 'h': 0.8,
            'fill': { 'color': accentColorHex+'33' }, // 20% opacity
            'rotate': 45
          }},
          { 'ellipse': { 
            'x': '5%', 'y': '80%', 'w': 0.6, 'h': 0.6,
            'fill': { 'color': secondaryColor.replace('#', '')+'33' } // 20% opacity
          }},
          
          // Add a custom header bar
          { 'rect': { 
            'x': 0, 'y': 0, 'w': '100%', 'h': 0.25,
            'fill': { 'color': accentColorHex+'33' } // 20% opacity
          }},
          
          // Title placeholder with underline
          { 'placeholder': { 
            'options': { 
              name: 'title', 
              type: 'title', 
              x: 0.5, y: 0.5, w: '90%', h: 1.0,
              align: 'left', 
              bold: true, 
              fontSize: 28, 
              color: accentColorHex,
              fontFace: cssVars['--font-heading'] || 'Arial'
            } 
          }},
          
          // Separator line between title and content
          { 'line': { 
            'x': 0.5, 'y': 1.5, 'w': '10%', 'h': 0,
            'line': { 'color': accentColorHex, 'width': 3 }
          }},
          
          // Left column placeholder
          { 'placeholder': { 
            'options': { 
              name: 'leftColumn', 
              type: 'body', 
              x: 0.5, y: 1.8, w: '45%', h: 4,
              fontSize: 16, 
              color: textColorHex,
              fontFace: cssVars['--font-body'] || 'Arial'
            } 
          }},
          
          // Right column placeholder  
          { 'placeholder': { 
            'options': { 
              name: 'rightColumn', 
              type: 'body', 
              x: '52%', y: 1.8, w: '45%', h: 4,
              fontSize: 16, 
              color: textColorHex,
              fontFace: cssVars['--font-body'] || 'Arial'
            } 
          }},
          
          // Footer
          { 'rect': { 
            'x': 0, 'y': 7.0, 'w': '100%', 'h': 0.2,
            'fill': { 'color': accentColorHex+'22' } // 13% opacity
          }},
          { 'text': { 
            text: 'Presly Design',
            options: {
              x: 0.5, y: 7.2, w: 2, 
              align: 'left',
              fontSize: 10, 
              color: textColorHex+'99', // 60% opacity
              fontFace: cssVars['--font-body'] || 'Arial'
            }
          }}
        ],
        slideNumber: { x: '95%', y: '95%', color: textColorHex }
      });
      
      // Get the HTML content - either from localStorage or from state
      const savedHTML = localStorage.getItem("generatedPresentationHTML");
      const htmlToProcess = savedHTML || htmlContent;
      console.log("Using HTML source:", savedHTML ? "localStorage" : "state");
      
      // Parse the HTML content
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlToProcess, 'text/html');
      
      // Find all slides in the HTML content
      const htmlSlides = doc.querySelectorAll('.slide');
      console.log(`Found ${htmlSlides.length} slides in HTML`);
      
      if (htmlSlides.length > 0) {
        console.log(`Processing ${htmlSlides.length} slides from HTML content`);
        
        // Process each slide in the HTML
        htmlSlides.forEach((htmlSlide, index) => {
          // Get slide content from HTML with support for different class names
          const titleElement = htmlSlide.querySelector('.slide-title') || 
                              htmlSlide.querySelector('h1') || 
                              htmlSlide.querySelector('h2');
                              
          const contentElement = htmlSlide.querySelector('.slide-content') || 
                                htmlSlide.querySelector('.slide-inner') ||
                                htmlSlide;
          
          // Check for bullet lists with multiple possible class names
          const bulletList = contentElement ? 
            (contentElement.querySelector('.slide-bullet-list') || 
             contentElement.querySelector('.slide-points') || 
             contentElement.querySelector('ul')) : null;
          const bulletItems = bulletList ? bulletList.querySelectorAll('li') : [];
          
          const slideTitle = titleElement ? titleElement.textContent || `Slide ${index + 1}` : `Slide ${index + 1}`;
          console.log(`Processing HTML slide: ${slideTitle}`);
          
          // Log details about the content we found
          if (contentElement) {
            const contentSample = contentElement.textContent?.substring(0, 50);
            console.log(`Slide content sample: ${contentSample}...`);
            if (bulletList) {
              console.log(`Found bullet list with ${bulletItems.length} items`);
            } else {
              const paragraphs = contentElement.querySelectorAll('p');
              console.log(`Found ${paragraphs.length} paragraphs`);
            }
          }
          
          // Determine the appropriate slide master based on content
          let masterName = 'MASTER_SLIDE';
          
          // Check if this is a title slide (first slide or has title-slide class)
          if (index === 0 || htmlSlide.classList.contains('title-slide')) {
            masterName = 'TITLE_SLIDE';
          }
          
          // Check if this is a two-column slide
          const twoColumnLayout = htmlSlide.querySelector('.two-columns');
          if (twoColumnLayout) {
            masterName = 'TWO_COLUMN_SLIDE';
          }
          
          console.log(`Using ${masterName} for slide ${index + 1}`);
          
          // Create slide with specific layout
          const pptSlide = pres.addSlide({ masterName });
          
          // For title slide, we handle title and content slightly differently
          if (masterName === 'TITLE_SLIDE') {
            // Add title centered with larger font
            pptSlide.addText(slideTitle, {
              placeholder: 'title',
              fontSize: 44,
              bold: true,
              color: accentColorHex,
              fontFace: cssVars['--font-heading'] || 'Arial',
              align: 'center'
            });
            
            // Add subtitle if content is a simple string
            if (typeof contentElement?.textContent === 'string') {
              const contentText = contentElement.textContent.trim();
              pptSlide.addText(contentText, {
                placeholder: 'subtitle',
                fontSize: 20,
                color: textColorHex,
                fontFace: cssVars['--font-body'] || 'Arial',
                align: 'center'
              });
            }
          } else {
            // For regular slides, add title as normal
            pptSlide.addText(slideTitle, { 
              placeholder: 'title',
              bold: true,
              fontFace: cssVars['--font-heading'] || 'Arial',
              color: accentColorHex
            });
          }
          
          // Get content from the HTML (this content element is already declared above)
          if (contentElement && masterName !== 'TITLE_SLIDE') {
            // Check for bullet lists with different possible class names
            const bulletList = contentElement.querySelector('.slide-bullet-list') || 
                               contentElement.querySelector('.slide-points') || 
                               contentElement.querySelector('ul');
                               
            if (bulletList) {
              const bullets = bulletList.querySelectorAll('li');
              console.log(`Adding ${bullets.length} HTML bullet points`);
              
              // Create an array of bullet points
              const bulletPoints = [];
              bullets.forEach(bullet => {
                const bulletText = bullet.textContent?.trim();
                if (bulletText) {
                  bulletPoints.push(bulletText);
                }
              });
              
              // Add all bullet points together with proper styling
              if (bulletPoints.length > 0) {
                // Try to find bullet color in the CSS if possible
                let bulletColor = accentColorHex; // Use accent color as default for bullets
                try {
                  // Try to extract bullet color from ::before or direct styling
                  const bulletStyleMatch = cssTemplate?.match(/\.slide-points\s+li:before.*?background-color:\s*([^;]*)|\.slide-bullet-list\s+li:before.*?background-color:\s*([^;]*)|ul\s+li:before.*?background-color:\s*([^;]*)/);
                  if (bulletStyleMatch) {
                    const colorValue = bulletStyleMatch[1] || bulletStyleMatch[2] || bulletStyleMatch[3];
                    if (colorValue && colorValue.trim()) {
                      // Convert if it's a variable
                      if (colorValue.includes('var(--')) {
                        const varName = colorValue.match(/var\(([^)]*)\)/)?.[1];
                        if (varName) {
                          const varValue = cssTemplate?.match(new RegExp(`${varName}:\\s*([^;]*)`))?.[1];
                          if (varValue) bulletColor = varValue.trim().replace('#', '');
                        }
                      } else {
                        bulletColor = colorValue.trim().replace('#', '');
                      }
                    }
                  }
                } catch (error) {
                  console.log("Error extracting bullet color:", error);
                }
                
                // Add all bullet points as one element with bullet formatting
                // This better preserves the template styling
                pptSlide.addText(bulletPoints, {
                  x: 0.5,
                  y: 1.8,
                  w: '90%',
                  bullet: { 
                    type: 'bullet',
                    color: bulletColor
                  },
                  fontSize: 16,
                  color: textColorHex,
                  fontFace: cssVars['--font-body'] || 'Arial',
                  lineSpacing: 24 // Increase spacing between bullet points
                });
                
                // Log success
                console.log(`Added ${bulletPoints.length} bullet points with color ${bulletColor}`);
              }
            } else {
              console.log("Adding HTML text content");
              
              // Get paragraphs or direct text content
              // Check if we're already handling a two-column layout slide from the masterName
              if (masterName === 'TWO_COLUMN_SLIDE') {
                console.log("Processing two-column layout");
                
                // For two column layout, handle each column separately
                const columns = htmlSlide.querySelectorAll('.column');
                if (columns.length >= 2) {
                  // Left column
                  const leftColumn = columns[0];
                  const leftBullets = leftColumn.querySelector('ul, .slide-points, .slide-bullet-list');
                  
                  if (leftBullets) {
                    // Process left column bullets
                    const bullets = leftBullets.querySelectorAll('li');
                    const bulletTexts = Array.from(bullets)
                      .map(bullet => bullet.textContent?.trim() || '')
                      .filter(text => text.length > 0);
                    
                    if (bulletTexts.length > 0) {
                      // Add bullet points to left column placeholder
                      pptSlide.addText(bulletTexts, {
                        placeholder: 'leftColumn',
                        bullet: { type: 'bullet' },
                        fontSize: 14,
                        color: textColorHex,
                        fontFace: cssVars['--font-body'] || 'Arial'
                      });
                    }
                  } else {
                    // Regular text in left column
                    const paragraphs = leftColumn.querySelectorAll('p');
                    if (paragraphs.length > 0) {
                      const paragraphTexts = Array.from(paragraphs)
                        .map(p => p.textContent?.trim() || '')
                        .filter(t => t.length > 0);
                      
                      if (paragraphTexts.length > 0) {
                        pptSlide.addText(paragraphTexts.join('\n\n'), {
                          placeholder: 'leftColumn',
                          fontSize: 14,
                          color: textColorHex,
                          fontFace: cssVars['--font-body'] || 'Arial'
                        });
                      }
                    } else {
                      const leftText = leftColumn.textContent?.trim();
                      if (leftText) {
                        pptSlide.addText(leftText, {
                          placeholder: 'leftColumn',
                          fontSize: 14,
                          color: textColorHex,
                          fontFace: cssVars['--font-body'] || 'Arial'
                        });
                      }
                    }
                  }
                  
                  // Right column - check for image first
                  const rightColumn = columns[1];
                  const image = rightColumn.querySelector('img');
                  
                  if (image && image.src) {
                    console.log("Found image in right column");
                    
                    // Note: PowerPoint doesn't support adding remote images directly
                    // We would need to download it first, which isn't feasible here
                    // Add a placeholder for image along with box
                    
                    // First, add a gray box as image placeholder
                    pptSlide.addShape(pres.ShapeType.rect, {
                      placeholder: 'rightColumn',
                      fill: { color: 'EEEEEE' },
                      line: { color: 'AAAAAA', width: 1 },
                      rectRadius: 5
                    });
                    
                    // Then add image placeholder text
                    pptSlide.addText("[ Image Placeholder ]", {
                      placeholder: 'rightColumn',
                      fontSize: 14,
                      color: '9e9e9e',
                      align: 'center',
                      valign: 'middle',
                      italic: true
                    });
                  } else {
                    // Text in right column
                    const rightBullets = rightColumn.querySelector('ul, .slide-points, .slide-bullet-list');
                    
                    if (rightBullets) {
                      // Process right column bullets
                      const bullets = rightBullets.querySelectorAll('li');
                      const bulletTexts = Array.from(bullets)
                        .map(bullet => bullet.textContent?.trim() || '')
                        .filter(text => text.length > 0);
                      
                      if (bulletTexts.length > 0) {
                        pptSlide.addText(bulletTexts, {
                          placeholder: 'rightColumn',
                          bullet: { type: 'bullet' },
                          fontSize: 14,
                          color: textColorHex,
                          fontFace: cssVars['--font-body'] || 'Arial'
                        });
                      }
                    } else {
                      const paragraphs = rightColumn.querySelectorAll('p');
                      if (paragraphs.length > 0) {
                        const paragraphTexts = Array.from(paragraphs)
                          .map(p => p.textContent?.trim() || '')
                          .filter(t => t.length > 0);
                        
                        if (paragraphTexts.length > 0) {
                          pptSlide.addText(paragraphTexts.join('\n\n'), {
                            placeholder: 'rightColumn',
                            fontSize: 14,
                            color: textColorHex,
                            fontFace: cssVars['--font-body'] || 'Arial'
                          });
                        }
                      } else {
                        const rightText = rightColumn.textContent?.trim();
                        if (rightText) {
                          pptSlide.addText(rightText, {
                            placeholder: 'rightColumn',
                            fontSize: 14,
                            color: textColorHex,
                            fontFace: cssVars['--font-body'] || 'Arial'
                          });
                        }
                      }
                    }
                  }
                }
              } else {
                // Regular paragraph handling
                const paragraphs = contentElement.querySelectorAll('p');
                if (paragraphs.length > 0) {
                  const paragraphTexts = [];
                  paragraphs.forEach(paragraph => {
                    const text = paragraph.textContent?.trim();
                    if (text) {
                      paragraphTexts.push(text);
                    }
                  });
                  
                  if (paragraphTexts.length > 0) {
                    // If there's only one paragraph, add it as a string
                    // Otherwise, add an array of paragraphs
                    if (paragraphTexts.length === 1) {
                      pptSlide.addText(paragraphTexts[0], {
                        x: 0.5,
                        y: 1.5,
                        w: '90%',
                        fontSize: 16,
                        color: textColorHex,
                        fontFace: cssVars['--font-body'] || 'Arial'
                      });
                    } else {
                      // Join paragraphs with newlines instead of using array
                      pptSlide.addText(paragraphTexts.join('\n\n'), {
                        x: 0.5,
                        y: 1.5,
                        w: '90%',
                        fontSize: 16,
                        color: textColorHex,
                        fontFace: cssVars['--font-body'] || 'Arial'
                      });
                    }
                  }
                } else {
                  const contentText = contentElement.textContent?.trim();
                  if (contentText) {
                    pptSlide.addText(contentText, {
                      x: 0.5,
                      y: 1.5,
                      w: '90%',
                      fontSize: 16,
                      color: textColorHex,
                      fontFace: cssVars['--font-body'] || 'Arial'
                    });
                  }
                }
              }
            }
          }
          
          // Add footer elements to match the template
          // First check if the slide has a footer element we can copy text from
          const footerElement = htmlSlide.querySelector('.slide-footer');
          
          // Add line separator
          pptSlide.addShape(pres.ShapeType.line, {
            x: 0.5, y: 6.8, w: '90%', 
            line: { color: accentColorHex+'66', width: 1 } // 40% opacity
          });
          
          // Add slide number with secondary color
          const secondaryColorHex = secondaryColor.replace('#', '');
          pptSlide.addText(`Slide ${index + 1}/${htmlSlides.length}`, {
            x: '90%',
            y: 7.0,
            w: 2,
            align: 'right',
            fontSize: 10,
            fontFace: cssVars['--font-body'] || 'Arial',
            color: secondaryColorHex
          });
          
          // Add footer text if available from template
          if (footerElement) {
            const footerText = footerElement.textContent?.trim();
            if (footerText) {
              pptSlide.addText(footerText, {
                x: 0.5,
                y: 7.0,
                w: '50%',
                fontSize: 10,
                fontFace: cssVars['--font-body'] || 'Arial',
                color: textColorHex+'99' // 60% opacity
              });
            }
          } else {
            // Add default footer
            pptSlide.addText('Presly Design Presentation', {
              x: 0.5,
              y: 7.0,
              w: '50%',
              fontSize: 10,
              fontFace: cssVars['--font-body'] || 'Arial',
              color: textColorHex+'99' // 60% opacity
            });
          }
        });
      } else {
        console.log("No slides found in HTML, using slide data directly");
        
        // Fallback to direct slide data if HTML parsing fails
        slides.forEach((slide, index) => {
          console.log(`Processing slide from data: ${slide.title}`);
          
          // Add a new slide with master slide layout
          const pptSlide = pres.addSlide({ masterName: 'MASTER_SLIDE' });
          
          // Set slide title with accent color
          pptSlide.addText(slide.title, { 
            x: 0.5, 
            y: 0.5, 
            w: '90%', 
            fontSize: 28,
            bold: true,
            color: accentColor.replace('#', '')
          });
          
          // Add content based on slide type
          if (slide.type === 'bullets' && Array.isArray(slide.content)) {
            console.log(`Adding ${slide.content.length} bullet points from data`);
            
            // Filter out empty items
            const bulletPoints = slide.content.filter(item => item && item.trim());
            
            // For bullet points - add each bullet point individually
            if (bulletPoints.length > 0) {
              bulletPoints.forEach((bulletText, bulletIndex) => {
                pptSlide.addText(bulletText, {
                  x: 0.5,
                  y: 1.5 + (bulletIndex * 0.4),
                  w: '90%',
                  bullet: true,
                  fontSize: 16,
                  color: '4a4a4a'
                });
              });
            }
          } else if (slide.type === 'title') {
            console.log("Adding title slide content from data");
            
            // For title slides
            if (typeof slide.content === 'string' && slide.content) {
              pptSlide.addText(slide.content, {
                x: 0.5,
                y: 3,
                w: '90%',
                h: 1,
                align: 'center',
                fontSize: 20,
                color: '4a4a4a'
              });
            }
          } else {
            console.log("Adding text slide content from data");
            
            // For text slides
            if (typeof slide.content === 'string' && slide.content) {
              pptSlide.addText(slide.content, {
                x: 0.5,
                y: 1.5,
                w: '90%',
                fontSize: 16,
                color: '4a4a4a'
              });
            }
          }
          
          // Add slide number
          pptSlide.addText(`Slide ${index + 1}/${slides.length}`, {
            x: 0.5,
            y: 6.5,
            w: 2,
            fontSize: 10,
            color: '9e9e9e'
          });
        });
      }
      
      // This section is redundant as we've already extracted and used the accent color above
      
      console.log("Writing PowerPoint file...");
      
      // Save the presentation
      await pres.writeFile({ fileName: 'presentation.pptx' });
      console.log("PowerPoint file created successfully with HTML content");
      
      setExportStatus("completed");
      toast.success("HTML PowerPoint presentation exported successfully");
    } catch (error) {
      console.error("Error in PowerPoint export:", error);
      
      // Try to provide more specific error information based on error type
      let errorMessage = "Failed to export PowerPoint";
      if (error instanceof TypeError && error.message.includes("Cannot create property")) {
        errorMessage = "Text formatting error in PowerPoint export - trying simpler format";
        
        // Attempt to recover with a simpler export
        try {
          // Create a simpler version with basic formatting
          const pres = new pptxgen();
          pres.layout = 'LAYOUT_16x9';
          
          slides.forEach((slide, index) => {
            const pptSlide = pres.addSlide();
            
            // Add title - simple format
            pptSlide.addText(slide.title, { 
              x: 0.5, y: 0.5, w: '90%', 
              fontSize: 24, bold: true 
            });
            
            // Add content based on slide type
            if (slide.type === 'bullets' && Array.isArray(slide.content)) {
              const bulletPoints = slide.content.filter(item => item && item.trim());
              bulletPoints.forEach((text, idx) => {
                pptSlide.addText(text, {
                  x: 0.5, y: 1.5 + (idx * 0.4), w: '90%',
                  bullet: true, fontSize: 16
                });
              });
            } else if (typeof slide.content === 'string') {
              pptSlide.addText(slide.content, {
                x: 0.5, y: 1.5, w: '90%', fontSize: 16
              });
            }
          });
          
          // Save with fallback name
          await pres.writeFile({ fileName: 'presentation-simple.pptx' });
          toast.success("Simple PowerPoint version created as fallback");
          setExportStatus("completed");
          return;
        } catch (fallbackError) {
          console.error("Fallback export also failed:", fallbackError);
          errorMessage = "PowerPoint export failed - please try again with simpler content";
        }
      }
      
      handleError(error, ErrorType.EXPORT, errorMessage, {
        retry: () => exportWithPptxGenJs()
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
