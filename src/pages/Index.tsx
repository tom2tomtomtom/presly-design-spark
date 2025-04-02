
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import FileUploadStep from "@/components/FileUploadStep";
import PresentationEditor from "@/components/PresentationEditor";
import PresentationExport from "@/components/PresentationExport";
import StepIndicator from "@/components/StepIndicator";
import SettingsModal from "@/components/SettingsModal";

const Index = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [slides, setSlides] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("upload");
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [cssTemplate, setCssTemplate] = useState<string | null>(null);
  
  useEffect(() => {
    const apiKey = localStorage.getItem("anthropicApiKey");
    
    if (!apiKey) {
      setIsSettingsModalOpen(true);
    }
  }, []);
  
  useEffect(() => {
    if (templateFile && templateFile.name.endsWith('.css')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === 'string') {
          setCssTemplate(e.target.result);
        }
      };
      reader.readAsText(templateFile);
    } else {
      setCssTemplate(null);
    }
  }, [templateFile]);
  
  const processFiles = async () => {
    if (!docFile) {
      toast.error("Please upload a document file");
      return;
    }
    
    toast.info("Processing document and generating slides...");
    
    try {
      // In a real implementation, we would parse the document here
      // For now, let's generate more sample slides
      const sampleSlides = [
        {
          id: 1,
          title: "Introduction",
          content: "Welcome to the HTML PPT Generator",
          type: "title"
        },
        {
          id: 2,
          title: "Project Overview",
          content: [
            "Transform DOC files into HTML presentations",
            "Apply custom design templates",
            "Edit with AI assistance",
            "Export to PowerPoint"
          ],
          type: "bullets"
        },
        {
          id: 3,
          title: "How It Works",
          content: "Upload your documents, choose a template, and our system will generate a beautiful presentation that you can edit with AI assistance.",
          type: "text"
        },
        {
          id: 4,
          title: "Key Features",
          content: [
            "Document parsing and analysis",
            "AI-powered content generation",
            "Custom templating system",
            "Interactive editing interface",
            "Multiple export formats"
          ],
          type: "bullets"
        },
        {
          id: 5,
          title: "Document Analysis",
          content: "Our system analyzes your document structure, headings, and content to create logical slide divisions and maintain the flow of information.",
          type: "text"
        },
        {
          id: 6,
          title: "Template System",
          content: [
            "Predefined professional templates",
            "Custom CSS styling support",
            "Image-based template creation",
            "Responsive designs for all devices"
          ],
          type: "bullets"
        },
        {
          id: 7,
          title: "Thank You",
          content: "Thank you for exploring our HTML PPT Generator! We hope you enjoy creating beautiful presentations with ease.",
          type: "title"
        }
      ];
      
      // If we have a real document, we would process it here
      if (docFile) {
        // Simulate document processing with AI
        const apiKey = localStorage.getItem("anthropicApiKey");
        if (apiKey) {
          // In a real implementation, we would use the Anthropic API to analyze the document
          // and generate slides based on its content
          console.log("Would use Anthropic API with key to process document:", docFile.name);
        }
      }
      
      setSlides(sampleSlides);
      setCurrentStep(2);
      setActiveTab("edit");
      toast.success("Presentation generated successfully!");
    } catch (error) {
      console.error("Error processing files:", error);
      toast.error("Failed to process files. Please try again.");
    }
  };
  
  const handleExport = () => {
    setCurrentStep(3);
    setActiveTab("export");
    toast.success("Preparing your presentation for export");
  };
  
  const renderTabContent = () => {
    switch (activeTab) {
      case "upload":
        return (
          <FileUploadStep 
            docFile={docFile} 
            setDocFile={setDocFile} 
            templateFile={templateFile} 
            setTemplateFile={setTemplateFile} 
            onProcess={processFiles} 
          />
        );
      case "edit":
        return (
          <PresentationEditor 
            slides={slides} 
            setSlides={setSlides} 
            onExport={handleExport}
            cssTemplate={cssTemplate}
          />
        );
      case "export":
        return (
          <PresentationExport 
            slides={slides} 
            cssTemplate={cssTemplate}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <header className="pb-6 mb-8 border-b">
        <h1 className="text-3xl font-bold text-primary">HTML PPT Generator</h1>
        <p className="text-muted-foreground mt-2">
          Transform documents into beautiful HTML presentations with AI assistance
        </p>
      </header>
      
      <StepIndicator currentStep={currentStep} />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload" disabled={currentStep < 1}>
            1. Upload Files
          </TabsTrigger>
          <TabsTrigger value="edit" disabled={currentStep < 2}>
            2. Edit Presentation
          </TabsTrigger>
          <TabsTrigger value="export" disabled={currentStep < 3}>
            3. Export
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-6">
          {renderTabContent()}
        </TabsContent>
      </Tabs>
      
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
};

export default Index;
