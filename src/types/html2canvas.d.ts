declare module 'html2canvas' {
  export interface Html2CanvasOptions {
    /** Whether to allow cross-origin images to taint the canvas */
    allowTaint?: boolean;
    /** Canvas background color, if none is specified in DOM. Set null for transparent */
    backgroundColor?: string | null;
    /** Canvas x-coordinate to be used when drawing the canvas on the window */
    x?: number;
    /** Canvas y-coordinate to be used when drawing the canvas on the window */
    y?: number;
    /** Whether to use the actual background color when drawing images */
    useCORS?: boolean;
    /** Proxy URL for loading cross-origin images */
    proxy?: string;
    /** Scales the canvas size (defaults to the device pixel ratio) */
    scale?: number;
    /** Whether to include the window in the screenshot. Use false to screenshot only a specific DOM node */
    windowWidth?: number;
    /** Height of the window to capture */
    windowHeight?: number;
    /** Width of the canvas */
    width?: number;
    /** Height of the canvas */
    height?: number;
    /** Includes a drawing of the current cursor position */
    scrollX?: number;
    /** Y-axis scrolling offset */
    scrollY?: number;
    /** Whether to enable logging for this html2canvas instance */
    logging?: boolean;
    /** The element to use as the root node */
    root?: HTMLElement;
    /** Whether to clean up resources after rendering */
    removeContainer?: boolean;
    /** Iframe to use as proxy for rendering */
    foreignObjectRendering?: boolean;
    /** Whether to hide the page scrollbars */
    ignoreElements?: (element: HTMLElement) => boolean;
  }

  export default function html2canvas(
    element: HTMLElement,
    options?: Html2CanvasOptions
  ): Promise<HTMLCanvasElement>;
}