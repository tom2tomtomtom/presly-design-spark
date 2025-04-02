/**
 * This is a shim file to safely import html2canvas
 * It will dynamically import the library only on the client side
 * and provide proper TypeScript types
 */

// Define the options interface
export interface Html2CanvasOptions {
  allowTaint?: boolean;
  backgroundColor?: string | null;
  canvas?: HTMLCanvasElement;
  foreignObjectRendering?: boolean;
  imageTimeout?: number;
  ignoreElements?: (element: HTMLElement) => boolean;
  logging?: boolean;
  onclone?: (document: Document) => void;
  proxy?: string;
  removeContainer?: boolean;
  scale?: number;
  useCORS?: boolean;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  scrollX?: number;
  scrollY?: number;
  windowWidth?: number;
  windowHeight?: number;
}

// Define the html2canvas function type
export type Html2CanvasFunction = (element: HTMLElement, options?: Html2CanvasOptions) => Promise<HTMLCanvasElement>;

// Initialize with a fallback that shows an error
let html2canvasInstance: Html2CanvasFunction = () => {
  console.error('html2canvas is not loaded yet');
  return Promise.reject(new Error('html2canvas not loaded'));
};

// Only load in the browser, not during SSR
if (typeof window !== 'undefined') {
  // Dynamically import html2canvas
  import('html2canvas')
    .then(module => {
      html2canvasInstance = module.default;
      console.log('html2canvas loaded successfully');
    })
    .catch(err => {
      console.error('Failed to load html2canvas:', err);
    });
}

// Export the function that will use the loaded instance
export const html2canvas: Html2CanvasFunction = (element, options) => {
  return html2canvasInstance(element, options);
};

export default html2canvas;