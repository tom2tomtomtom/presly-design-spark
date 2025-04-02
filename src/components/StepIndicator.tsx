
import { Check, FileUp, Edit, Download } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
}

const StepIndicator = ({ currentStep }: StepIndicatorProps) => {
  const steps = [
    { id: 1, name: "Upload", icon: FileUp },
    { id: 2, name: "Edit", icon: Edit },
    { id: 3, name: "Export", icon: Download }
  ];

  return (
    <div className="flex justify-between items-center w-full px-8">
      {steps.map((step) => (
        <div key={step.id} className="flex flex-col items-center">
          <div className={`
            w-12 h-12 rounded-full flex items-center justify-center mb-2 
            ${currentStep > step.id ? 'step-completed' : currentStep === step.id ? 'step-active' : 'step-pending'}
          `}>
            {currentStep > step.id ? (
              <Check className="h-6 w-6" />
            ) : (
              <step.icon className="h-6 w-6" />
            )}
          </div>
          <span className="text-sm font-medium">{step.name}</span>
        </div>
      ))}
      
      <div className="absolute left-0 right-0 h-1 top-6 -z-10">
        <div className="mx-auto max-w-3xl px-16">
          <div className="h-1 w-full bg-gray-200">
            <div 
              className="h-1 bg-accent transition-all duration-300"
              style={{ width: `${(currentStep - 1) * 50}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepIndicator;
