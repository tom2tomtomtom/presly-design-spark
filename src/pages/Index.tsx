
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import FileUploadStep from "@/components/FileUploadStep";
import PresentationEditor from "@/components/PresentationEditor";
import PresentationExport from "@/components/PresentationExport";
import StepIndicator from "@/components/StepIndicator";

const Index = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [slides, setSlides] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("upload");
  
  // Process files and generate slides
  const processFiles = () => {
    if (!docFile) {
      toast.error("Please upload a document file");
      return;
    }
    
    // For the demo, we'll create some sample slides
    // In a real app, this would parse the DOC file
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
      }
    ];
    
    setSlides(sampleSlides);
    setCurrentStep(2);
    setActiveTab("edit");
    toast.success("Presentation generated successfully!");
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
          />
        );
      case "export":
        return (
          <PresentationExport slides={slides} />
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
    </div>
  );
};

export default Index;
