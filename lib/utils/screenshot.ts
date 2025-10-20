/**
 * Screenshot utility functions for capturing page content as Base64 data URLs
 */

import { toJpeg, toPng } from 'html-to-image';

// Cache for the screen share stream
let cachedStream: MediaStream | null = null;
let streamPromise: Promise<MediaStream | null> | null = null;

/**
 * Capture a screenshot of the current page as a Base64 data URL
 * @param options - Screenshot options
 * @returns Promise<string> - Base64 data URL
 */
export async function captureScreenshot(options: {
  quality?: number;
  format?: 'image/png' | 'image/jpeg' | 'image/webp';
  fullPage?: boolean;
} = {}): Promise<string | null> {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      console.warn('Screenshot capture only works in browser environment');
      return null;
    }

    // Use screen share as primary method for Power BI dashboards (most reliable)
    console.log('Using screen share for screenshot capture');
    return await captureViaScreenShare();

    const html2canvas = (window as any).html2canvas;
    
    const {
      quality = 0.8,
      format = 'image/jpeg',
      fullPage = true
    } = options;

    // Capture the screenshot
    const canvas = await html2canvas(document.body, {
      useCORS: true,
      allowTaint: true,
      scale: 1,
      width: fullPage ? undefined : window.innerWidth,
      height: fullPage ? undefined : window.innerHeight,
      scrollX: 0,
      scrollY: 0,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
    });

    // Convert to Base64 data URL
    const dataURL = canvas.toDataURL(format, quality);
    
    console.log(`Screenshot captured: ${dataURL.length} characters, format: ${format}`);
    return dataURL;
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    return null;
  }
}

/**
 * Capture a screenshot of a specific element as a Base64 data URL
 * @param element - The DOM element to capture
 * @param options - Screenshot options
 * @returns Promise<string> - Base64 data URL
 */
export async function captureElementScreenshot(
  element: HTMLElement,
  options: {
    quality?: number;
    format?: 'image/png' | 'image/jpeg' | 'image/webp';
  } = {}
): Promise<string | null> {
  try {
    if (typeof window === 'undefined') {
      console.warn('Screenshot capture only works in browser environment');
      return null;
    }

    // Use screen share for element capture too (most reliable)
    console.log('Using screen share for element screenshot capture');
    return await captureViaScreenShare();

    const html2canvas = (window as any).html2canvas;
    
    const {
      quality = 0.8,
      format = 'image/jpeg'
    } = options;

    const canvas = await html2canvas(element, {
      useCORS: true,
      allowTaint: true,
      scale: 1,
    });

    const dataURL = canvas.toDataURL(format, quality);
    
    console.log(`Element screenshot captured: ${dataURL.length} characters, format: ${format}`);
    return dataURL;
  } catch (error) {
    console.error('Error capturing element screenshot:', error);
    return null;
  }
}

/**
 * Capture a screenshot of the viewport (visible area) as a Base64 data URL
 * @param options - Screenshot options
 * @returns Promise<string> - Base64 data URL
 */
export async function captureViewportScreenshot(options: {
  quality?: number;
  format?: 'image/png' | 'image/jpeg' | 'image/webp';
} = {}): Promise<string | null> {
  return captureScreenshot({
    ...options,
    fullPage: false
  });
}

/**
 * Capture a screenshot using html-to-image library
 * @param element - The DOM element to capture
 * @param options - Screenshot options
 * @returns Promise<string> - Base64 data URL
 */
export async function captureWithHtmlToImage(
  element: HTMLElement,
  options: {
    quality?: number;
    format?: 'image/png' | 'image/jpeg' | 'image/webp';
    fullPage?: boolean;
  } = {}
): Promise<string | null> {
  try {
    const {
      quality = 0.8,
      format = 'image/jpeg'
    } = options;

    let dataURL: string;
    
    if (format === 'image/png') {
      dataURL = await toPng(element, {
        quality,
        cacheBust: true,
        backgroundColor: '#ffffff',
        pixelRatio: 1,
      });
    } else {
      dataURL = await toJpeg(element, {
        quality,
        cacheBust: true,
        backgroundColor: '#ffffff',
        pixelRatio: 1,
      });
    }

    console.log(`html-to-image screenshot captured: ${dataURL.length} characters, format: ${format}`);
    return dataURL;
  } catch (error) {
    console.error('Error capturing screenshot with html-to-image:', error);
    return null;
  }
}

/**
 * Initialize screen share stream (call this on user gesture)
 * This will prompt the user once and cache the stream for reuse
 */
export async function initializeScreenShare(): Promise<boolean> {
  try {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getDisplayMedia) {
      console.warn('Screen capture API not available in this environment');
      return false;
    }

    if (cachedStream) {
      console.log('Screen share stream already initialized');
      return true;
    }

    if (streamPromise) {
      console.log('Screen share stream initialization already in progress');
      return await streamPromise.then(stream => stream !== null);
    }

    const constraints: DisplayMediaStreamOptions = {
      video: true,
      audio: false,
    };

    console.log('Requesting screen share permission...');
    streamPromise = navigator.mediaDevices.getDisplayMedia(constraints)
      .then(stream => {
        cachedStream = stream;
        console.log('Screen share stream initialized successfully');
        return stream;
      })
      .catch(error => {
        console.warn('Screen share initialization failed:', error);
        streamPromise = null;
        return null;
      });

    const result = await streamPromise;
    return result !== null;
  } catch (e) {
    console.warn('Screen share initialization failed:', e);
    streamPromise = null;
    return false;
  }
}

/**
 * Capture a screenshot using the cached screen share stream
 * Make sure to call initializeScreenShare() first with a user gesture
 */
export async function captureViaScreenShare(): Promise<string | null> {
  try {
    if (!cachedStream) {
      console.warn('Screen share stream not initialized. Call initializeScreenShare() first.');
      return null;
    }

    const video = document.createElement('video');
    video.style.position = 'fixed';
    video.style.left = '-10000px'; // keep it off-screen
    video.style.top = '-10000px';
    video.muted = true;
    video.autoplay = true;
    video.srcObject = cachedStream;

    // Wait for video to load
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error('Video load failed'));
      // Timeout after 5 seconds
      setTimeout(() => reject(new Error('Video load timeout')), 5000);
    });

    // Some browsers require play() before drawing
    try { 
      await video.play(); 
    } catch (playError) {
      console.warn('Video play failed:', playError);
    }

    // Wait a bit for the video to render
    await new Promise(resolve => setTimeout(resolve, 100));

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return null;
    }
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 1);

    // Cleanup video element (but keep the stream)
    video.srcObject = null;
    video.remove();

    console.log(`Screen capture successful: ${dataUrl.length} characters`);
    return dataUrl;
  } catch (e) {
    console.warn('Screen capture failed:', e);
    return null;
  }
}

/**
 * Stop and cleanup the cached screen share stream
 */
export function stopScreenShare(): void {
  if (cachedStream) {
    cachedStream.getTracks().forEach(track => track.stop());
    cachedStream = null;
    streamPromise = null;
    console.log('Screen share stream stopped and cleaned up');
  }
}
