import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { handleError, ErrorType } from './error';

/**
 * StyleContext provides global style management for presentations
 * It centralizes CSS template management and application to avoid duplication
 */
interface StyleContextType {
  cssTemplate: string | null;
  setCssTemplate: (css: string | null) => void;
  applyGlobalStyle: () => void;
  validateCss: (css: string) => boolean;
}

const StyleContext = createContext<StyleContextType | undefined>(undefined);

interface StyleProviderProps {
  children: ReactNode;
}

export const StyleProvider: React.FC<StyleProviderProps> = ({ children }) => {
  const [cssTemplate, setCssTemplate] = useState<string | null>(null);
  
  // Apply global styles whenever cssTemplate changes
  useEffect(() => {
    if (cssTemplate) {
      applyGlobalStyle();
    }
  }, [cssTemplate]);
  
  // Validate CSS string
  const validateCss = (css: string): boolean => {
    try {
      // Create a test style element to check if CSS is valid
      const testStyle = document.createElement('style');
      testStyle.textContent = css;
      
      // This will throw an error if there's a syntax problem
      document.head.appendChild(testStyle);
      
      // Clean up after validation
      document.head.removeChild(testStyle);
      return true;
    } catch (error) {
      handleError(error, ErrorType.CSS, 'Invalid CSS syntax');
      return false;
    }
  };
  
  // Apply the global style to the document
  const applyGlobalStyle = () => {
    try {
      // Remove any existing style element
      const existingStyle = document.getElementById('global-presentation-style');
      if (existingStyle) existingStyle.remove();
      
      if (cssTemplate) {
        if (validateCss(cssTemplate)) {
          const styleElement = document.createElement('style');
          styleElement.id = 'global-presentation-style';
          styleElement.textContent = cssTemplate;
          document.head.appendChild(styleElement);
          console.log('Global style applied successfully');
        }
      }
    } catch (error) {
      handleError(error, ErrorType.CSS, 'Failed to apply global style');
    }
  };
  
  return (
    <StyleContext.Provider value={{ 
      cssTemplate, 
      setCssTemplate, 
      applyGlobalStyle,
      validateCss
    }}>
      {children}
    </StyleContext.Provider>
  );
};

export const useStyle = () => {
  const context = useContext(StyleContext);
  if (context === undefined) {
    throw new Error('useStyle must be used within a StyleProvider');
  }
  return context;
};