import { toast } from "sonner";

// Custom error types
export enum ErrorType {
  FILE_PROCESSING = 'FILE_PROCESSING',
  API = 'API',
  EXPORT = 'EXPORT',
  CSS = 'CSS',
  UNKNOWN = 'UNKNOWN'
}

interface ErrorOptions {
  retry?: () => void;
  silent?: boolean;
  logToAnalytics?: boolean;
}

/**
 * Centralized error handling utility
 * 
 * @param error - The error object or message
 * @param type - The type of error from ErrorType enum
 * @param message - Custom error message to display
 * @param options - Additional options for error handling
 */
export const handleError = (error: unknown, type: ErrorType, message?: string, options?: ErrorOptions) => {
  // Default error message based on type
  const defaultMessages = {
    [ErrorType.FILE_PROCESSING]: 'Error processing file',
    [ErrorType.API]: 'Error communicating with AI service',
    [ErrorType.EXPORT]: 'Error generating export file',
    [ErrorType.CSS]: 'Error processing CSS template',
    [ErrorType.UNKNOWN]: 'An unexpected error occurred'
  };
  
  // Get error message
  const errorMessage = message || defaultMessages[type] || 'Something went wrong';
  
  // Log error to console with context
  console.error(`[${type}] ${errorMessage}:`, error);
  
  // Show toast notification unless silent mode is requested
  if (!options?.silent) {
    const toastOptions = options?.retry 
      ? { action: { label: "Retry", onClick: options.retry } }
      : undefined;
      
    toast.error(errorMessage, toastOptions);
  }
  
  // Optional: Send to analytics system
  if (options?.logToAnalytics) {
    // Implementation for analytics tracking could be added here
    // window.analytics?.trackError(type, errorMessage, error);
  }
  
  return { message: errorMessage, type, originalError: error };
};