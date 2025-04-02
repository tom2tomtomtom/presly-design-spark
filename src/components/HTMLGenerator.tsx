import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, FileText, Wand } from "lucide-react";
import { toast } from "sonner";
import { handleError, ErrorType } from "@/lib/error";

interface HTMLGeneratorProps {
  slides: any[];
  cssTemplate?: string | null;
  onHTMLGenerated: (html: string) => void;
}

/**
 * HTMLGenerator component
 * Generates an all-in-one HTML file from slides data and CSS template
 */
const HTMLGenerator = ({ slides, cssTemplate, onHTMLGenerated }: HTMLGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentOperation, setCurrentOperation] = useState("");
  const [generationStarted, setGenerationStarted] = useState(false);

  // Auto-generate HTML when component mounts or slides/CSS changes
  useEffect(() => {
    if (slides.length > 0 && !generationStarted) {
      startGeneration();
    }
  }, [slides, cssTemplate]);

  const startGeneration = () => {
    setIsGenerating(true);
    setGenerationStarted(true);
    setGenerationProgress(0);
    setCurrentOperation("Analyzing presentation content...");
    
    // Simulate the AI/LLM generation process with a timer
    const interval = setInterval(() => {
      setGenerationProgress(prevProgress => {
        const newProgress = prevProgress + (100 - prevProgress) * 0.05;
        
        // Update operation text based on progress
        if (newProgress > 10 && newProgress <= 30) {
          setCurrentOperation("Structuring HTML foundation...");
        } else if (newProgress > 30 && newProgress <= 50) {
          setCurrentOperation("Applying styling and animations...");
        } else if (newProgress > 50 && newProgress <= 70) {
          setCurrentOperation("Optimizing layout for different devices...");
        } else if (newProgress > 70 && newProgress <= 85) {
          setCurrentOperation("Adding interactive elements...");
        } else if (newProgress > 85) {
          setCurrentOperation("Finalizing presentation HTML...");
        }
        
        if (newProgress >= 99) {
          clearInterval(interval);
          generateHTML();
          return 100;
        }
        
        return newProgress;
      });
    }, 200);
    
    // Cleanup function
    return () => clearInterval(interval);
  };

  const generateHTML = () => {
    try {
      // Generate the HTML based on slides and CSS template
      const html = generateCompleteHTML(slides, cssTemplate);
      
      // Pass the generated HTML back to the parent component
      onHTMLGenerated(html);
      
      // Reset state
      setIsGenerating(false);
      toast.success("HTML presentation generated successfully!");
    } catch (error) {
      handleError(error, ErrorType.API, "Failed to generate HTML presentation");
      setIsGenerating(false);
    }
  };

  const regenerateHTML = () => {
    setGenerationStarted(false);
    startGeneration();
  };

  // Function to modify the raw HTML template with our slide content
  const modifyRawHtmlWithSlideContent = (rawHtml: string, slides: any[]): string => {
    try {
      // Parse the raw HTML
      const parser = new DOMParser();
      const templateDoc = parser.parseFromString(rawHtml, 'text/html');
      
      // Find the slide container element
      const slideContainer = templateDoc.querySelector('.slides-container') || 
                             templateDoc.querySelector('.presentation-container');
                             
      if (!slideContainer) {
        console.error("Could not find slide container in template");
        return rawHtml; // Return original if we can't find a container
      }
      
      // Clear existing slides but save one as a template
      const originalSlides = slideContainer.querySelectorAll('.slide');
      if (originalSlides.length === 0) {
        console.error("No slide templates found in raw HTML");
        return rawHtml;
      }
      
      // Extract templates for different slide types
      const slideTemplates: Record<string, Element> = {};
      
      // Find title/first slide template
      const titleSlideTemplate = Array.from(originalSlides).find(slide => 
        slide.classList.contains('title-slide') || slide.id === 'slide-1'
      );
      if (titleSlideTemplate) slideTemplates.title = titleSlideTemplate;
      
      // Find bullet slide template
      const bulletSlideTemplate = Array.from(originalSlides).find(slide =>
        slide.querySelector('.slide-points') || 
        slide.querySelector('.slide-bullet-list') ||
        slide.querySelector('ul')
      );
      if (bulletSlideTemplate) slideTemplates.bullets = bulletSlideTemplate;
      
      // Find two-column slide template
      const twoColumnTemplate = Array.from(originalSlides).find(slide =>
        slide.querySelector('.two-columns')
      );
      if (twoColumnTemplate) slideTemplates.twoColumn = twoColumnTemplate;
      
      // Find thank you / closing slide template
      const closingTemplate = Array.from(originalSlides).find(slide =>
        slide.textContent?.includes('Thank You')
      );
      if (closingTemplate) slideTemplates.closing = closingTemplate;
      
      // Default/content slide template - use the first one if nothing specific is found
      if (!slideTemplates.content && originalSlides.length > 0) {
        slideTemplates.content = originalSlides[0];
      }
      
      // Clear all slides from the container
      slideContainer.innerHTML = '';
      
      // Add our slides using the templates
      slides.forEach((slide, index) => {
        let template;
        
        // Select appropriate template for this slide
        if (slide.type === 'title' && index === 0 && slideTemplates.title) {
          template = slideTemplates.title.cloneNode(true) as Element;
        } else if (slide.type === 'title' && index === slides.length - 1 && slideTemplates.closing) {
          template = slideTemplates.closing.cloneNode(true) as Element;
        } else if (slide.type === 'bullets' && slideTemplates.bullets) {
          template = slideTemplates.bullets.cloneNode(true) as Element;
        } else if (slide.type === 'twoColumn' && slideTemplates.twoColumn) {
          template = slideTemplates.twoColumn.cloneNode(true) as Element;
        } else if (slideTemplates.content) {
          template = slideTemplates.content.cloneNode(true) as Element;
        } else {
          // Fallback if no matching template
          template = originalSlides[0].cloneNode(true) as Element;
        }
        
        // Set slide ID and class
        template.id = `slide-${index + 1}`;
        if (index === 0) {
          template.classList.add('active');
        } else {
          template.classList.remove('active');
        }
        
        // Update slide content
        // First update the title
        const titleElement = template.querySelector('.slide-title') || 
                            template.querySelector('h1') || 
                            template.querySelector('h2');
                            
        if (titleElement) {
          titleElement.textContent = slide.title;
        }
        
        // Then update content based on slide type
        if (slide.type === 'bullets' && Array.isArray(slide.content)) {
          // Update bullet list
          const bulletList = template.querySelector('.slide-points') || 
                            template.querySelector('.slide-bullet-list') || 
                            template.querySelector('ul');
                            
          if (bulletList) {
            bulletList.innerHTML = slide.content.map((item: string) => 
              `<li>${item}</li>`
            ).join('');
          }
        } else if (typeof slide.content === 'string') {
          // Update text content
          const contentElement = template.querySelector('.slide-text') || 
                                template.querySelector('.slide-content p') || 
                                template.querySelector('p');
                                
          if (contentElement) {
            contentElement.textContent = slide.content;
          }
        }
        
        // Add the modified slide to the container
        slideContainer.appendChild(template);
      });
      
      // Update slide counter if it exists
      const slideCounter = templateDoc.getElementById('slide-counter');
      if (slideCounter) {
        slideCounter.textContent = `Slide 1/${slides.length}`;
      }
      
      // Convert back to string
      return templateDoc.documentElement.outerHTML;
    } catch (error) {
      console.error("Error modifying raw HTML:", error);
      return rawHtml; // Return original on error
    }
  };

  // Generates a complete HTML file with navigation, styling and interactions
  const generateCompleteHTML = (slides: any[], css: string | null = null) => {
    // Process CSS styles
    let processedCss = css || '';
    
    try {
      if (css) {
        const testStyle = document.createElement('style');
        testStyle.textContent = css;
      }
    } catch (error) {
      console.error("Invalid CSS:", error);
      processedCss = '/* Invalid CSS provided */';
    }

    // Extract potential theme colors from CSS
    const accentColor = processedCss?.match(/--accent-color:\s*([^;]*)/)?.[1]?.trim() || '#3498db';
    
    // Check if raw HTML template is available
    const rawHtmlTemplate = localStorage.getItem('rawHtmlTemplate');
    if (rawHtmlTemplate) {
      console.log("Found raw HTML template, using directly");
      
      try {
        // Extract the body and style tags from the raw template
        const parser = new DOMParser();
        const templateDoc = parser.parseFromString(rawHtmlTemplate, 'text/html');
        
        // Extract all style tags
        const styles = templateDoc.querySelectorAll('style');
        let extractedCss = '';
        styles.forEach(style => {
          extractedCss += style.textContent + '\n\n';
        });
        
        // Apply the CSS and customize with slides
        if (extractedCss) {
          processedCss = extractedCss;
          console.log("Using styles from raw HTML template");
          
          // We'll use custom templating from the raw HTML
          // Find and extract the slide template structure
          // But we'll handle this in the slide mapping section
          return modifyRawHtmlWithSlideContent(rawHtmlTemplate, slides);
        }
      } catch (error) {
        console.error("Error processing raw HTML template:", error);
      }
    }
    
    // Check if custom slide templates are available from localStorage
    let slideTemplates: any = null;
    try {
      const templatesJson = localStorage.getItem('slideTemplates');
      if (templatesJson) {
        slideTemplates = JSON.parse(templatesJson);
        console.log("Using custom slide templates:", Object.keys(slideTemplates));
      }
    } catch (error) {
      console.error("Error loading slide templates:", error);
    }
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Interactive Presentation</title>
  <style>
    /* Base reset and typography */
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    :root {
      --accent-color: ${accentColor};
      --bg-color: #ffffff;
      --text-primary: #2c3e50;
      --text-secondary: #7f8c8d;
      --shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      --transition-speed: 0.4s;
    }
    
    @media (prefers-reduced-motion) {
      :root {
        --transition-speed: 0s;
      }
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      background-color: #f8f9fa;
      color: var(--text-primary);
      overflow-x: hidden;
    }
    
    /* Presentation container */
    .presentation-container {
      position: relative;
      width: 100%;
      min-height: 100vh;
      overflow: hidden;
    }
    
    /* Slides */
    .slide {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100vh;
      display: flex;
      flex-direction: column;
      padding: 2.5rem;
      background-color: var(--bg-color);
      transition: transform var(--transition-speed) cubic-bezier(0.4, 0, 0.2, 1);
      transform: translateX(100%);
      opacity: 0;
      overflow-y: auto;
      z-index: 1;
    }
    
    .slide.active {
      transform: translateX(0);
      opacity: 1;
      z-index: 2;
    }
    
    .slide.prev {
      transform: translateX(-100%);
      opacity: 0;
      z-index: 1;
    }
    
    /* Slide content */
    .slide-inner {
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    
    .slide-title {
      font-size: 2.5rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      color: var(--accent-color);
      border-bottom: 2px solid var(--accent-color);
      padding-bottom: 0.5rem;
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .slide.active .slide-title {
      opacity: 1;
      transform: translateY(0);
    }
    
    .slide-content {
      flex: 1;
      font-size: 1.25rem;
      line-height: 1.8;
      opacity: 0;
      transform: translateY(30px);
      transition: opacity 0.8s ease 0.1s, transform 0.8s ease 0.1s;
      margin: 1rem 0;
    }
    
    .slide.active .slide-content {
      opacity: 1;
      transform: translateY(0);
    }
    
    /* Title slide */
    .slide.title-slide .slide-title {
      font-size: 3.5rem;
      text-align: center;
      margin-top: 2rem;
    }
    
    .slide.title-slide .slide-content {
      text-align: center;
      font-size: 1.75rem;
      color: var(--text-secondary);
      margin-top: 1rem;
    }
    
    /* Bullet list */
    .slide-bullet-list {
      list-style: none;
      margin-left: 1rem;
    }
    
    .slide-bullet-list li {
      margin-bottom: 1rem;
      display: flex;
      align-items: flex-start;
      opacity: 0;
      transform: translateX(-20px);
      transition: opacity 0.5s ease, transform 0.5s ease;
    }
    
    .slide.active .slide-bullet-list li {
      opacity: 1;
      transform: translateX(0);
    }
    
    .slide.active .slide-bullet-list li:nth-child(1) { transition-delay: 0.2s; }
    .slide.active .slide-bullet-list li:nth-child(2) { transition-delay: 0.3s; }
    .slide.active .slide-bullet-list li:nth-child(3) { transition-delay: 0.4s; }
    .slide.active .slide-bullet-list li:nth-child(4) { transition-delay: 0.5s; }
    .slide.active .slide-bullet-list li:nth-child(5) { transition-delay: 0.6s; }
    .slide.active .slide-bullet-list li:nth-child(n+6) { transition-delay: 0.7s; }
    
    .slide-bullet-list li:before {
      content: "";
      display: inline-block;
      width: 10px;
      height: 10px;
      background-color: var(--accent-color);
      border-radius: 50%;
      margin-right: 15px;
      margin-top: 10px;
      flex-shrink: 0;
    }
    
    /* Navigation controls */
    .slide-controls {
      position: fixed;
      bottom: 2rem;
      left: 0;
      right: 0;
      display: flex;
      justify-content: center;
      gap: 1rem;
      z-index: 100;
      opacity: 0.8;
      transition: opacity 0.3s ease;
    }
    
    .slide-controls:hover {
      opacity: 1;
    }
    
    .slide-controls button {
      background-color: var(--accent-color);
      color: white;
      border: none;
      border-radius: 4px;
      padding: 0.6rem 1.2rem;
      cursor: pointer;
      font-size: 1rem;
      transition: background-color 0.3s ease, transform 0.2s ease;
      box-shadow: var(--shadow);
    }
    
    .slide-controls button:hover {
      transform: translateY(-2px);
    }
    
    .slide-controls button:disabled {
      background-color: #bdc3c7;
      cursor: not-allowed;
      transform: none;
    }
    
    /* Progress bar */
    .progress-bar {
      position: fixed;
      top: 0;
      left: 0;
      height: 4px;
      background-color: var(--accent-color);
      transition: width 0.3s ease;
      z-index: 100;
    }
    
    /* Slide counter */
    .slide-counter {
      position: fixed;
      bottom: 1rem;
      right: 1rem;
      font-size: 0.875rem;
      color: var(--text-secondary);
      background-color: rgba(255, 255, 255, 0.8);
      padding: 0.3rem 0.6rem;
      border-radius: 4px;
      box-shadow: var(--shadow);
      z-index: 100;
    }
    
    /* Responsive design */
    @media (max-width: 768px) {
      .slide {
        padding: 1.5rem;
      }
      
      .slide-title {
        font-size: 1.75rem;
      }
      
      .slide-content {
        font-size: 1rem;
      }
      
      .slide.title-slide .slide-title {
        font-size: 2.5rem;
      }
      
      .slide.title-slide .slide-content {
        font-size: 1.25rem;
      }
    }
    
    /* CSS Variables Override */
    ${processedCss}
  </style>
</head>
<body>
  <div class="presentation-container">
    ${slides.map((slide, index) => {
      // If we have custom templates, use the appropriate one based on slide type
      if (slideTemplates) {
        // Helper function to replace content in template
        const replaceTemplateContent = (template, slide, index) => {
          // Create temporary DOM element to manipulate
          const parser = new DOMParser();
          const doc = parser.parseFromString(template, 'text/html');
          const slideElement = doc.querySelector('.slide');
          
          if (!slideElement) return template; // Return original if structure not found
          
          // Update slide index and class
          slideElement.id = `slide-${index + 1}`;
          if (index === 0) slideElement.classList.add('active');
          
          // Update slide title
          const titleElement = slideElement.querySelector('.slide-title, h1, h2');
          if (titleElement) titleElement.textContent = slide.title;
          
          // Update slide content based on type
          if (slide.type === 'bullets' && Array.isArray(slide.content)) {
            // Find bullet container
            const bulletContainer = slideElement.querySelector('.slide-points, .slide-bullet-list, ul');
            if (bulletContainer) {
              bulletContainer.innerHTML = slide.content.map(item => `<li>${item}</li>`).join('');
            }
          } else if (typeof slide.content === 'string') {
            // Find content container
            const contentElement = slideElement.querySelector('.slide-content p, .slide-text, p');
            if (contentElement) {
              contentElement.textContent = slide.content;
            }
          }
          
          return slideElement.outerHTML;
        };
        
        // Select appropriate template based on slide type
        let template;
        if (slide.type === 'title' && index === 0 && slideTemplates.title) {
          template = slideTemplates.title;
        } else if (slide.type === 'title' && index === slides.length - 1 && slideTemplates.closing) {
          template = slideTemplates.closing;
        } else if (slide.type === 'bullets' && slideTemplates.bullets) {
          template = slideTemplates.bullets;
        } else if (slideTemplates.content) {
          template = slideTemplates.content;
        }
        
        if (template) {
          return replaceTemplateContent(template, slide, index);
        }
      }
      
      // Fallback to default template if no custom template is available
      return `
      <div id="slide-${index + 1}" class="slide ${index === 0 ? 'active' : ''} ${slide.type === 'title' ? 'title-slide' : ''}">
        <div class="slide-inner">
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
      </div>
      `;
    }).join('')}
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
</html>`;
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <FileText className="h-6 w-6 mr-2 text-primary" />
          <h3 className="text-lg font-medium">HTML Generation</h3>
        </div>
        
        {isGenerating ? (
          <div className="space-y-4">
            <div className="flex items-center">
              <Loader2 className="h-5 w-5 mr-2 animate-spin text-primary" />
              <span>{currentOperation}</span>
            </div>
            
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
                style={{ width: `${generationProgress}%` }}
              ></div>
            </div>
            
            <p className="text-sm text-muted-foreground">
              This may take a few seconds. The AI is crafting your presentation HTML...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The HTML for your presentation has been generated. You can regenerate it to apply new changes or continue to preview and edit your slides.
            </p>
            
            <Button onClick={regenerateHTML} className="w-full">
              <Wand className="mr-2 h-4 w-4" />
              Regenerate HTML
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HTMLGenerator;