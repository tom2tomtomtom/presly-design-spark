
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Wand, PencilRuler, Lightbulb, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getAIFeedback } from "@/services/aiService";
import { useStyle } from "@/lib/StyleContext";
import { handleError, ErrorType } from "@/lib/error";

interface AIFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: string) => void;
  slide: any;
  slideIndex: number;
  slides?: any[];
}

const AIFeedbackModal = ({
  isOpen,
  onClose,
  onSubmit,
  slide,
  slideIndex,
  slides = [],
}: AIFeedbackModalProps) => {
  const [activeTab, setActiveTab] = useState<string>("feedback");
  const [feedback, setFeedback] = useState("");
  const [designPrompt, setDesignPrompt] = useState<string>("");
  const [contentPrompt, setContentPrompt] = useState<string>("");
  const [generatedCSS, setGeneratedCSS] = useState<string>("");
  const [contentSuggestions, setContentSuggestions] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { cssTemplate, setCssTemplate } = useStyle();

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (slide) {
        setContentPrompt(
          `Help me improve this slide titled "${slide.title}" with the following content: ${
            Array.isArray(slide.content) ? 
            slide.content.join(", ") : 
            slide.content
          }`
        );
      }
      setDesignPrompt(
        "Create a professional looking presentation with blue accents and modern typography"
      );
      
      // This feedback can also be applied to the HTML generation step
      toast.info("Your suggestions will affect the next HTML generation");
    }
  }, [isOpen, slide]);

  const handleFeedbackSubmit = async () => {
    if (feedback.trim() === "") {
      toast.error("Please enter your feedback");
      return;
    }

    setIsLoading(true);
    try {
      const aiResponse = await getAIFeedback(feedback, slide);
      
      if (aiResponse) {
        // Process the AI response
        onSubmit(feedback);
        toast.success("AI feedback received!");
        
        // Format the response for the user
        let responseMessage = "AI Suggestions:\n";
        aiResponse.suggestions.forEach((suggestion, index) => {
          responseMessage += `${index + 1}. ${suggestion}\n`;
        });
        
        // Update the slide with the improved content
        const updatedSlide = { ...slide };
        
        if (aiResponse.improvedTitle) {
          updatedSlide.title = aiResponse.improvedTitle;
        }
        
        if (aiResponse.improvedContent) {
          updatedSlide.content = aiResponse.improvedContent;
        }
        
        // Call onSubmit with the updated slide
        onSubmit(JSON.stringify(updatedSlide));
        
        setFeedback("");
        onClose();
      }
    } catch (error) {
      console.error("Error processing AI feedback:", error);
      toast.error("Failed to process AI feedback");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to generate design suggestions
  const generateDesignSuggestions = () => {
    setIsLoading(true);
    
    try {
      // Example CSS templates based on common design styles
      const cssTemplates = {
        corporate: `/* Corporate Theme */
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
}`,
        creative: `/* Creative Theme */
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
}`,
        minimal: `/* Minimal Theme */
:root {
  --accent-color: #333333;
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
}`,
        vibrant: `/* Vibrant Theme */
:root {
  --accent-color: #00BFA5;
  --bg-light: #E0F7FA;
  --text-dark: #263238;
  --text-medium: #546E7A;
  --font-heading: 'Montserrat', sans-serif;
  --font-body: 'Roboto', sans-serif;
}
.slide { 
  font-family: var(--font-body);
  background: linear-gradient(135deg, var(--bg-light) 0%, white 100%);
  border: none;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}
.slide-title {
  font-family: var(--font-heading);
  color: var(--accent-color);
  font-weight: 600;
  letter-spacing: -0.5px;
}
.slide-bullet-list li:before {
  background-color: var(--accent-color);
  border-radius: 4px;
}`,
        dark: `/* Dark Theme */
:root {
  --accent-color: #BB86FC;
  --bg-dark: #121212;
  --text-light: #E1E1E1;
  --text-medium: #A0A0A0;
  --font-heading: 'Poppins', sans-serif;
  --font-body: 'Inter', sans-serif;
}
.slide { 
  font-family: var(--font-body);
  background-color: var(--bg-dark);
  border: none;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  color: var(--text-light);
}
.slide-title {
  font-family: var(--font-heading);
  color: var(--accent-color);
  font-weight: 500;
}
.slide-content {
  color: var(--text-light);
}
.slide-bullet-list li:before {
  background-color: var(--accent-color);
}`,
        elegant: `/* Elegant Theme */
:root {
  --accent-color: #8B5CF6;
  --bg-light: #F9FAFB;
  --text-dark: #1F2937;
  --text-medium: #4B5563;
  --font-heading: 'Playfair Display', serif;
  --font-body: 'Lato', sans-serif;
}
.slide { 
  font-family: var(--font-body);
  background-color: var(--bg-light);
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
.slide-title {
  font-family: var(--font-heading);
  color: var(--text-dark);
  border-bottom: 1px solid rgba(139, 92, 246, 0.3);
  padding-bottom: 12px;
  margin-bottom: 20px;
  font-weight: 600;
}
.slide-bullet-list li:before {
  background-color: var(--accent-color);
  height: 5px;
  width: 5px;
  border-radius: 50%;
}`,
        tech: `/* Tech Theme */
:root {
  --accent-color: #10B981;
  --bg-light: #F8FAFC;
  --text-dark: #0F172A;
  --text-medium: #334155;
  --font-heading: 'Inter', sans-serif;
  --font-body: 'Inter', sans-serif;
}
.slide { 
  font-family: var(--font-body);
  background-color: var(--bg-light);
  border: 1px solid rgba(16, 185, 129, 0.1);
  border-radius: 4px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}
.slide-title {
  font-family: var(--font-heading);
  color: var(--text-dark);
  border-left: 3px solid var(--accent-color);
  padding-left: 10px;
  font-weight: 600;
  letter-spacing: -0.5px;
}
.slide-bullet-list li:before {
  background-color: var(--accent-color);
  border-radius: 2px;
}`
      };
      
      // Analyze the prompt to determine which template to use
      const promptLower = designPrompt.toLowerCase();
      
      let selectedTemplate = cssTemplates.corporate; // Default
      
      if (promptLower.includes("blue") || promptLower.includes("corporate") || promptLower.includes("professional")) {
        selectedTemplate = cssTemplates.corporate;
      } else if (promptLower.includes("red") || promptLower.includes("creative") || promptLower.includes("bold")) {
        selectedTemplate = cssTemplates.creative;
      } else if (promptLower.includes("minimal") || promptLower.includes("clean") || promptLower.includes("simple")) {
        selectedTemplate = cssTemplates.minimal;
      } else if (promptLower.includes("green") || promptLower.includes("vibrant") || promptLower.includes("colorful")) {
        selectedTemplate = cssTemplates.vibrant;
      } else if (promptLower.includes("dark") || promptLower.includes("modern") || promptLower.includes("sleek")) {
        selectedTemplate = cssTemplates.dark;
      } else if (promptLower.includes("elegant") || promptLower.includes("sophisticated") || promptLower.includes("luxury")) {
        selectedTemplate = cssTemplates.elegant;
      } else if (promptLower.includes("tech") || promptLower.includes("startup") || promptLower.includes("digital")) {
        selectedTemplate = cssTemplates.tech;
      }
      
      // Make minor modifications based on specific prompt requests
      if (promptLower.includes("gradient")) {
        selectedTemplate = selectedTemplate.replace(
          /background-color:.*?;/,
          "background: linear-gradient(135deg, var(--bg-light) 0%, white 100%);"
        );
      }
      
      if (promptLower.includes("shadow") || promptLower.includes("depth")) {
        selectedTemplate = selectedTemplate.replace(
          /box-shadow:.*?;/,
          "box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);"
        );
      }
      
      // Color customizations with improved regex to ensure it always works
      if (promptLower.includes("purple")) {
        selectedTemplate = selectedTemplate.replace(/--accent-color: #[0-9A-F]{6};/i, "--accent-color: #9C27B0;");
      } else if (promptLower.includes("orange")) {
        selectedTemplate = selectedTemplate.replace(/--accent-color: #[0-9A-F]{6};/i, "--accent-color: #FF9800;");
      } else if (promptLower.includes("pink")) {
        selectedTemplate = selectedTemplate.replace(/--accent-color: #[0-9A-F]{6};/i, "--accent-color: #E91E63;");
      } else if (promptLower.includes("teal")) {
        selectedTemplate = selectedTemplate.replace(/--accent-color: #[0-9A-F]{6};/i, "--accent-color: #009688;");
      } else if (promptLower.includes("yellow")) {
        selectedTemplate = selectedTemplate.replace(/--accent-color: #[0-9A-F]{6};/i, "--accent-color: #FFC107;");
      } else if (promptLower.includes("black")) {
        selectedTemplate = selectedTemplate.replace(/--accent-color: #[0-9A-F]{6};/i, "--accent-color: #000000;");
      } else if (promptLower.includes("white")) {
        selectedTemplate = selectedTemplate.replace(/--accent-color: #[0-9A-F]{6};/i, "--accent-color: #FFFFFF;");
      }
      
      // Font customizations based on prompt
      if (promptLower.includes("serif") || promptLower.includes("classic")) {
        selectedTemplate = selectedTemplate
          .replace(/--font-heading:.*?;/, "--font-heading: 'Georgia', serif;")
          .replace(/--font-body:.*?;/, "--font-body: 'Georgia', serif;");
      } else if (promptLower.includes("modern font") || promptLower.includes("sans serif")) {
        selectedTemplate = selectedTemplate
          .replace(/--font-heading:.*?;/, "--font-heading: 'Inter', sans-serif;")
          .replace(/--font-body:.*?;/, "--font-body: 'Inter', sans-serif;");
      }
      
      // Border customizations
      if (promptLower.includes("border") || promptLower.includes("outline")) {
        selectedTemplate = selectedTemplate.replace(
          /border:.*?;/,
          "border: 1px solid var(--accent-color);"
        );
      }
      
      // Set the generated CSS
      setGeneratedCSS(selectedTemplate);
      
      // Simulate generation delay (shorter for better UX)
      setTimeout(() => {
        setIsLoading(false);
        toast.success("Design suggestions generated!");
      }, 600);
      
    } catch (error) {
      handleError(error, ErrorType.API, "Failed to generate design suggestions");
      setIsLoading(false);
    }
  };

  // Function to generate content suggestions
  const generateContentSuggestions = () => {
    setIsLoading(true);
    
    try {
      // Analyze the prompt to generate content suggestions
      let suggestions = "";
      const promptLower = contentPrompt.toLowerCase();
      
      // Extract slide title for more targeted suggestions
      const slideTitle = slide?.title?.toLowerCase() || "";
      
      // Detect key themes in the prompt
      const isAboutBusiness = promptLower.includes("business") || promptLower.includes("company") || promptLower.includes("market");
      const isAboutTech = promptLower.includes("tech") || promptLower.includes("software") || promptLower.includes("digital");
      const isAboutStrategy = promptLower.includes("strategy") || promptLower.includes("plan") || promptLower.includes("roadmap");
      const isAboutResults = promptLower.includes("results") || promptLower.includes("outcomes") || promptLower.includes("metrics");
      
      // Generate different suggestions based on slide type
      if (slide && slide.type === "title") {
        suggestions = "**Title Slide Suggestions:**\n\n";
        suggestions += "• Consider a shorter, more impactful title (5-7 words)\n";
        suggestions += "• Add a subtitle that explains the main benefit\n";
        suggestions += "• Include your company name or presentation context\n";
        suggestions += "• Use active voice for stronger impression\n\n";
        
        suggestions += "**Improved Title Options:**\n\n";
        
        if (promptLower.includes("presentation") || promptLower.includes("intro")) {
          if (isAboutTech) {
            suggestions += "1. \"Digital Transformation: Reshaping the Future\"\n";
            suggestions += "2. \"Tech-Enabled Innovation: Our 2025 Vision\"\n";
            suggestions += "3. \"The AI Revolution: Opportunities & Implementation\"\n";
          } else if (isAboutBusiness) {
            suggestions += "1. \"Market Leadership: Our Strategic Approach\"\n";
            suggestions += "2. \"Beyond Growth: Building Sustainable Success\"\n";
            suggestions += "3. \"Strategic Excellence: The Path Forward\"\n";
          } else {
            suggestions += "1. \"Transforming Insights into Action\"\n";
            suggestions += "2. \"Beyond Analytics: The Future of Decision Making\"\n";
            suggestions += "3. \"Data-Driven Success: Strategies for 2025\"\n";
          }
        } else if (promptLower.includes("product") || promptLower.includes("launch")) {
          suggestions += "1. \"Introducing [Product]: Redefining User Experience\"\n";
          suggestions += "2. \"[Product]: Where Innovation Meets Simplicity\"\n";
          suggestions += "3. \"Meet [Product]: The Solution You've Been Waiting For\"\n";
        } else if (promptLower.includes("conclusion") || promptLower.includes("summary")) {
          suggestions += "1. \"Key Takeaways & Next Steps\"\n";
          suggestions += "2. \"Our Commitment to Excellence\"\n";
          suggestions += "3. \"Moving Forward: The Path to Success\"\n";
        } else {
          // Generic title suggestions based on the current title
          if (slideTitle.includes("introduction") || slideTitle.includes("overview")) {
            suggestions += "1. \"A New Perspective: Challenging Assumptions\"\n";
            suggestions += "2. \"Innovation at Its Core: Our Approach\"\n";
            suggestions += "3. \"Setting the Stage for Success\"\n";
          } else {
            suggestions += "1. \"Transforming Challenges into Opportunities\"\n";
            suggestions += "2. \"Excellence Through Innovation\"\n";
            suggestions += "3. \"Building the Future, Today\"\n";
          }
        }
      } 
      else if (slide && slide.type === "bullets") {
        suggestions = "**Bullet Points Suggestions:**\n\n";
        suggestions += "• Keep each bullet concise (1-2 lines maximum)\n";
        suggestions += "• Use parallel sentence structure for consistency\n";
        suggestions += "• Start with strong action verbs\n";
        suggestions += "• Organize bullets by importance or logical flow\n\n";
        
        if (Array.isArray(slide.content) && slide.content.length > 0) {
          suggestions += "**Enhanced Content Options:**\n\n";
          
          // Generate enhanced versions of existing bullet points
          if (slide.content[0]) {
            const firstBullet = slide.content[0];
            suggestions += "Original: \"" + firstBullet + "\"\n";
            
            // Check if bullet already starts with a verb
            const startsWithVerb = /^(Implement|Create|Develop|Build|Establish|Design|Leverage|Optimize|Transform)/.test(firstBullet);
            
            if (startsWithVerb) {
              suggestions += "Enhanced: \"" + firstBullet.replace(/^(.*?)$/, "$1 to drive significant business outcomes") + "\"\n\n";
            } else {
              suggestions += "Enhanced: \"" + firstBullet.replace(/^(.*?)$/, "Strategically $1 for maximum impact") + "\"\n\n";
            }
          }
          
          if (slide.content.length > 1 && slide.content[1]) {
            const secondBullet = slide.content[1];
            suggestions += "Original: \"" + secondBullet + "\"\n";
            
            // Check if bullet already starts with a verb
            const startsWithVerb = /^(Implement|Create|Develop|Build|Establish|Design|Leverage|Optimize|Transform)/.test(secondBullet);
            
            if (startsWithVerb) {
              suggestions += "Enhanced: \"" + secondBullet.replace(/^(.*?)$/, "$1 with measurable results") + "\"\n\n";
            } else {
              suggestions += "Enhanced: \"" + secondBullet.replace(/^(.*?)$/, "Effectively $1 to deliver sustainable value") + "\"\n\n";
            }
          }
          
          // Add a few new suggested bullet points based on the slide title and prompt content
          suggestions += "**Additional Bullet Points to Consider:**\n\n";
          
          if (slideTitle.includes("feature") || slideTitle.includes("benefit") || promptLower.includes("feature") || promptLower.includes("benefit")) {
            suggestions += "• Deliver seamless integration with existing workflows, reducing adaptation time by 50%\n";
            suggestions += "• Enhance productivity with AI-powered automation of routine tasks\n";
            suggestions += "• Provide real-time analytics with customizable dashboards for better decision making\n";
          } else if (slideTitle.includes("challenge") || slideTitle.includes("problem") || promptLower.includes("challenge") || promptLower.includes("problem")) {
            suggestions += "• Address key industry challenges with proven, scalable solutions\n";
            suggestions += "• Overcome implementation barriers with our expert-led onboarding process\n";
            suggestions += "• Navigate complex requirements through an intuitive user interface\n";
          } else if (slideTitle.includes("roadmap") || slideTitle.includes("timeline") || promptLower.includes("roadmap") || promptLower.includes("timeline")) {
            suggestions += "• Q1 2025: Launch core functionality with early adopter program\n";
            suggestions += "• Q2 2025: Roll out enhanced analytics and reporting features\n";
            suggestions += "• Q3-Q4 2025: Expand ecosystem with third-party integrations and API access\n";
          } else if (isAboutStrategy) {
            suggestions += "• Implement a phased approach to ensure seamless adoption across departments\n";
            suggestions += "• Create cross-functional teams focused on specific business outcomes\n";
            suggestions += "• Establish clear success metrics with quarterly evaluation milestones\n";
          } else if (isAboutResults) {
            suggestions += "• Achieved 35% improvement in key performance indicators within six months\n";
            suggestions += "• Reduced operational costs by 28% while improving quality metrics\n";
            suggestions += "• Increased customer satisfaction scores from 7.2 to 9.1 (out of 10)\n";
          } else {
            suggestions += "• Leverage industry best practices to accelerate implementation\n";
            suggestions += "• Implement a data-driven approach for continuous improvement\n";
            suggestions += "• Achieve measurable ROI within the first 90 days of deployment\n";
          }
        }
      } 
      else {
        // Text slide
        suggestions = "**Text Slide Suggestions:**\n\n";
        suggestions += "• Break complex concepts into 3-4 clear sections\n";
        suggestions += "• Use concise language with strong active verbs\n";
        suggestions += "• Include relevant data points or statistics (if applicable)\n";
        suggestions += "• End with a clear takeaway or call to action\n\n";
        
        if (slide && typeof slide.content === 'string') {
          suggestions += "**Enhanced Content Options:**\n\n";
          
          // Show a preview of the current content
          const contentPreview = slide.content.length > 50 
            ? slide.content.substring(0, 50) + "..." 
            : slide.content;
            
          suggestions += "Original: \"" + contentPreview + "\"\n\n";
          
          if (promptLower.includes("explain") || promptLower.includes("clarify")) {
            suggestions += "Enhanced explanation:\n\"To clearly understand this concept, consider these three key factors: first, the underlying market dynamics; second, the technological capabilities; and third, the implementation strategy. Each element plays a critical role in determining success and must be carefully aligned with your organization's objectives.\"\n";
          } else if (promptLower.includes("compare") || promptLower.includes("contrast")) {
            suggestions += "Enhanced comparison:\n\"When comparing the traditional approach with our innovative solution, several key differences emerge: implementation speed (45% faster), cost efficiency (30% reduction in TCO), and user adoption (85% higher engagement rates). These advantages translate directly to improved business outcomes and competitive positioning in the market.\"\n";
          } else if (isAboutTech) {
            suggestions += "Enhanced technology content:\n\"Our technology platform leverages cutting-edge AI and machine learning algorithms to process data at unprecedented speed and accuracy. The architecture is designed for scalability, allowing seamless growth from startup operations to enterprise-level deployment without performance degradation or significant reconfiguration.\"\n";
          } else if (isAboutBusiness) {
            suggestions += "Enhanced business content:\n\"The market opportunity presents a clear path to sustainable growth, with a projected CAGR of 18% through 2028. Our strategic positioning allows us to capture key segments that competitors have overlooked, particularly in the mid-market where the need for our solution is most acute and purchasing decisions can be made rapidly.\"\n";
          } else {
            suggestions += "Enhanced general content:\n\"Our comprehensive approach addresses the core challenges facing organizations today through a three-pronged strategy: optimization of existing resources, strategic deployment of new capabilities, and continuous adaptation based on performance analytics. This framework ensures both immediate improvements and long-term competitive advantage.\"\n";
          }
        }
      }
      
      // Set the generated suggestions
      setContentSuggestions(suggestions);
      
      // Simulate generation delay (shorter for better UX)
      setTimeout(() => {
        setIsLoading(false);
        toast.success("Content suggestions generated!");
      }, 600);
      
    } catch (error) {
      handleError(error, ErrorType.API, "Failed to generate content suggestions");
      setIsLoading(false);
    }
  };

  const applyDesignSuggestions = () => {
    if (generatedCSS) {
      setCssTemplate(generatedCSS);
      toast.success("Design applied successfully!");
    }
  };

  const applyContentSuggestions = () => {
    if (!contentSuggestions) {
      toast.warning("No content suggestions to apply. Generate suggestions first.");
      return;
    }
    
    // This function parses and applies the suggestions to the current slide
    if (slide && slide.type === "title" && contentSuggestions.includes("Improved Title Options")) {
      // Extract the first title suggestion
      const titleMatch = contentSuggestions.match(/1\. "(.*?)"/);
      if (titleMatch && titleMatch[1]) {
        const updatedSlide = { ...slide, title: titleMatch[1] };
        onSubmit(JSON.stringify(updatedSlide));
        toast.success("Applied suggested title to slide!");
      }
    } else if (slide && slide.type === "bullets" && contentSuggestions.includes("Enhanced Content Options")) {
      // Extract enhanced bullet points
      const bulletMatch = contentSuggestions.match(/Enhanced: "(.*?)"/g);
      if (bulletMatch && bulletMatch.length > 0) {
        const enhancedBullets = bulletMatch.map(match => 
          match.replace(/Enhanced: "(.*?)"/, '$1')
        );
        
        // Add new suggested bullet points
        // Match all bullet points after "Additional Bullet Points to Consider" heading
        const additionalBulletsSectionMatch = contentSuggestions.match(/\*\*Additional Bullet Points to Consider:\*\*([\s\S]*?)(?=\n\n|$)/);
        let newBullets = [];
        
        if (additionalBulletsSectionMatch && additionalBulletsSectionMatch[1]) {
          // Extract just the bullet points from this section
          const bulletSection = additionalBulletsSectionMatch[1];
          const bulletRegex = /• (.*?)(?=\n|$)/g;
          let match;
          while ((match = bulletRegex.exec(bulletSection)) !== null) {
            if (match[1]) {
              newBullets.push(match[1].trim());
            }
          }
        }
        
        // Combine existing content with enhanced replacements
        let updatedContent = [];
        if (Array.isArray(slide.content)) {
          updatedContent = [...slide.content];
          
          // Replace first two items if we have enhancements
          if (enhancedBullets.length > 0 && updatedContent.length > 0) {
            updatedContent[0] = enhancedBullets[0];
          }
          
          if (enhancedBullets.length > 1 && updatedContent.length > 1) {
            updatedContent[1] = enhancedBullets[1];
          }
          
          // Add new bullets (max 2)
          if (newBullets.length > 0) {
            // Only add bullets that don't exist already (check for similar content)
            const uniqueNewBullets = newBullets.filter(newBullet => {
              // Convert to lowercase and remove punctuation for comparison
              const normalizedNewBullet = newBullet.toLowerCase().replace(/[.,;:!?]/g, '');
              return !updatedContent.some(existingBullet => {
                const normalizedExistingBullet = existingBullet.toLowerCase().replace(/[.,;:!?]/g, '');
                // Check if they share substantial content (more than 50% of words)
                const newWords = normalizedNewBullet.split(' ');
                const existingWords = normalizedExistingBullet.split(' ');
                let commonWords = 0;
                for (const word of newWords) {
                  if (existingWords.includes(word)) commonWords++;
                }
                return commonWords > newWords.length * 0.3; // 30% similarity threshold
              });
            });
            
            // Add up to 2 unique new bullets
            updatedContent.push(...uniqueNewBullets.slice(0, 2));
          }
        }
        
        const updatedSlide = { ...slide, content: updatedContent };
        onSubmit(JSON.stringify(updatedSlide));
        toast.success("Applied suggested content to slide!");
      }
    } else if (slide && slide.type !== "bullets" && typeof slide.content === 'string' && 
              (contentSuggestions.includes("Enhanced explanation:") || 
               contentSuggestions.includes("Enhanced comparison:") ||
               contentSuggestions.includes("Enhanced technology content:") ||
               contentSuggestions.includes("Enhanced business content:") ||
               contentSuggestions.includes("Enhanced general content:"))) {
      
      // Extract the enhanced content for text slides
      const contentMatch = contentSuggestions.match(/Enhanced (?:explanation|comparison|technology content|business content|general content):\n"([\s\S]*?)"/);
      
      if (contentMatch && contentMatch[1]) {
        const enhancedContent = contentMatch[1];
        const updatedSlide = { ...slide, content: enhancedContent };
        onSubmit(JSON.stringify(updatedSlide));
        toast.success("Applied enhanced content to slide!");
      } else {
        toast.info("Could not extract enhanced content from suggestions");
      }
    } else {
      toast.info("No applicable suggestions found for this slide type");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Wand className="mr-2 h-5 w-5" />
            AI Slide Assistant
          </DialogTitle>
          <DialogDescription>
            Get AI help with slide design, content, and feedback
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="feedback" className="flex items-center">
              <Wand className="mr-2 h-4 w-4" />
              AI Feedback
            </TabsTrigger>
            <TabsTrigger value="design" className="flex items-center">
              <PencilRuler className="mr-2 h-4 w-4" />
              Design Style
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center">
              <Lightbulb className="mr-2 h-4 w-4" />
              Content Ideas
            </TabsTrigger>
          </TabsList>
          
          {/* Feedback Tab - Original Functionality */}
          <TabsContent value="feedback" className="space-y-4 mt-4">
            <div className="grid gap-4 py-4">
              <Label htmlFor="feedback">
                Enter specific feedback for this slide
              </Label>
              <Textarea
                id="feedback"
                placeholder="Enter your feedback here..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
              <Button 
                type="submit" 
                onClick={handleFeedbackSubmit} 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Submit Feedback"
                )}
              </Button>
            </div>
          </TabsContent>
          
          {/* Design Style Tab */}
          <TabsContent value="design" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="design-prompt">Describe your desired design style</Label>
              <Textarea
                id="design-prompt"
                placeholder="e.g., 'Create a modern corporate presentation with blue accents'"
                value={designPrompt}
                onChange={(e) => setDesignPrompt(e.target.value)}
                rows={3}
              />
              <Button 
                onClick={generateDesignSuggestions} 
                className="w-full mt-2"
                disabled={isLoading || !designPrompt.trim()}
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand className="mr-2 h-4 w-4" />
                    Generate Design Suggestions
                  </>
                )}
              </Button>
            </div>
            
            {generatedCSS && (
              <div className="space-y-2 mt-4">
                <Separator className="my-2" />
                <Label>Generated Design Style</Label>
                <div className="relative">
                  <Textarea
                    value={generatedCSS}
                    readOnly
                    rows={6}
                    className="font-mono text-sm pr-8"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 opacity-70"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedCSS);
                      toast.success("CSS copied to clipboard");
                    }}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <Button onClick={applyDesignSuggestions} className="w-full mt-2">
                  Apply This Design
                </Button>
              </div>
            )}
          </TabsContent>
          
          {/* Content Ideas Tab */}
          <TabsContent value="content" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="content-prompt">Describe what content you want</Label>
              <Textarea
                id="content-prompt"
                placeholder="e.g., 'Help me explain the benefits of our new product'"
                value={contentPrompt}
                onChange={(e) => setContentPrompt(e.target.value)}
                rows={3}
              />
              <Button 
                onClick={generateContentSuggestions} 
                className="w-full mt-2"
                disabled={isLoading || !contentPrompt.trim()}
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Lightbulb className="mr-2 h-4 w-4" />
                    Generate Content Suggestions
                  </>
                )}
              </Button>
            </div>
            
            {contentSuggestions && (
              <div className="space-y-2 mt-4">
                <Separator className="my-2" />
                <Label>Content Suggestions</Label>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-3 max-h-[300px] overflow-y-auto">
                  <div className="markdown prose-sm max-w-none" dangerouslySetInnerHTML={{ 
                    __html: contentSuggestions
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\n\n/g, '<br/><br/>')
                      .replace(/\n•/g, '<br/>•')
                      .replace(/\n\d+\./g, '<br/>$&')
                  }} />
                </div>
                <Button onClick={applyContentSuggestions} className="w-full mt-2">
                  Apply These Suggestions
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Suggestions are generated using pattern matching and templates.
          </p>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AIFeedbackModal;
