import html2canvas from 'html2canvas';

// Types for capture source selection
export type CaptureSource = 'visible-area' | 'full-page' | 'element' | 'screen';

// Store the media stream globally to avoid multiple permission prompts
let activeMediaStream: MediaStream | null = null;
let videoElement: HTMLVideoElement | null = null;

// Initialize screen capture and return the stream for reuse
export async function initScreenCapture(): Promise<MediaStream | null> {
  try {
    // If we already have an active stream, use it
    if (activeMediaStream && activeMediaStream.active) {
      console.log("Reusing existing active media stream", {
        id: activeMediaStream.id,
        trackCount: activeMediaStream.getTracks().length
      });
      return activeMediaStream;
    }
    
    // Clean up any existing stream that's no longer active
    cleanupMediaStream();
    
    // Check if the browser supports getDisplayMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      console.warn("This browser doesn't support screen capture. Falling back to html2canvas.");
      return null;
    }
    
    console.log("Requesting screen capture permission...");
    
    try {
      // Request screen capture permission - will show system UI to select what to capture
      activeMediaStream = await navigator.mediaDevices.getDisplayMedia({ 
        video: { 
          // @ts-ignore - These properties are newer and might not be in TypeScript definitions
          displaySurface: "browser",
          // @ts-ignore - This is also a newer property
          preferCurrentTab: true,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 15 }
        },
        audio: false
      });
      
      if (!activeMediaStream) {
        console.error("getDisplayMedia returned without a stream but also without an error");
        return null;
      }
      
      console.log("Media stream acquired", {
        id: activeMediaStream.id,
        trackCount: activeMediaStream.getTracks().length,
        tracks: activeMediaStream.getTracks().map(t => ({
          kind: t.kind,
          id: t.id,
          label: t.label,
          readyState: t.readyState
        }))
      });
      
      // Create a video element to capture the stream
      videoElement = document.createElement('video');
      videoElement.srcObject = activeMediaStream;
      videoElement.muted = true; // Ensure it's muted to avoid audio feedback
      videoElement.setAttribute('playsinline', 'true'); // Important for iOS
      
      // Wait for the video to load metadata and start playing
      await new Promise<void>((resolve, reject) => {
        if (!videoElement) {
          reject(new Error("Video element is null"));
          return;
        }
        
        // Set timeout to avoid hanging indefinitely
        const timeoutId = setTimeout(() => {
          reject(new Error("Timed out waiting for video to load metadata"));
        }, 10000);
        
        videoElement.onloadedmetadata = () => {
          clearTimeout(timeoutId);
          
          if (!videoElement) {
            reject(new Error("Video element became null after metadata loaded"));
            return;
          }
          
          console.log("Video metadata loaded", {
            width: videoElement.videoWidth,
            height: videoElement.videoHeight
          });
          
          videoElement.play().then(() => {
            console.log("Video playback started");
            resolve();
          }).catch(err => {
            console.error("Failed to start video playback:", err);
            reject(err);
          });
        };
        
        videoElement.onerror = (event) => {
          clearTimeout(timeoutId);
          const error = videoElement?.error;
          console.error("Video element error:", error?.message || "Unknown error");
          reject(error || new Error("Video element error"));
        };
      });
      
      console.log("Screen capture initialized successfully");
      
      // Add an event listener for when the user stops sharing
      const tracks = activeMediaStream.getVideoTracks();
      if (tracks.length > 0) {
        tracks[0].addEventListener('ended', () => {
          console.log("User stopped sharing screen");
          cleanupMediaStream();
        });
      } else {
        console.warn("No video tracks found in the media stream");
      }
      
      return activeMediaStream;
    } catch (permissionError) {
      console.error("Permission error during getDisplayMedia:", permissionError);
      
      // Check for specific permission errors
      if (permissionError instanceof DOMException) {
        if (permissionError.name === 'NotAllowedError') {
          console.error("User denied screen sharing permission");
        } else if (permissionError.name === 'AbortError') {
          console.error("Screen sharing dialog was closed/cancelled by the user");
        }
      }
      
      cleanupMediaStream();
      throw permissionError; // Re-throw to be handled by caller
    }
  } catch (error) {
    console.error("Failed to initialize screen capture:", error);
    cleanupMediaStream();
    return null;
  }
}

// Clean up the media stream resources
export function cleanupMediaStream(): void {
  if (activeMediaStream) {
    activeMediaStream.getTracks().forEach(track => {
      if (track.readyState === 'live') {
        track.stop();
      }
    });
    activeMediaStream = null;
  }
  
  if (videoElement) {
    videoElement.srcObject = null;
    videoElement = null;
  }
  
  console.log("Media stream cleaned up");
}

// Function to capture frame from active media stream
async function captureFrameFromMediaStream(quality: number = 0.8): Promise<string | null> {
  try {
    // If we don't have a valid media stream or video element, return null
    if (!activeMediaStream || !activeMediaStream.active || !videoElement) {
      console.warn("No active media stream for capture", {
        streamExists: !!activeMediaStream,
        streamActive: activeMediaStream?.active,
        videoElementExists: !!videoElement
      });
      return null;
    }
    
    console.log("Capturing frame from active media stream", {
      videoWidth: videoElement.videoWidth,
      videoHeight: videoElement.videoHeight,
      videoReady: videoElement.readyState
    });
    
    // Create a canvas to capture the video frame
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    
    if (canvas.width === 0 || canvas.height === 0) {
      console.error("Canvas dimensions are invalid, can't capture screenshot from video");
      return null;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error("Failed to get canvas context");
      return null;
    }
    
    // Draw the current video frame to the canvas
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
    // Convert to JPEG with the specified quality
    const imageData = canvas.toDataURL('image/jpeg', quality);
    
    console.log("Frame captured successfully from media stream");
    return imageData;
  } catch (error) {
    console.error("Error capturing frame from media stream:", error);
    return null;
  }
}

// Screenshot capturing functionality with support for multiple capture methods
export async function captureScreenshot(
  captureArea: string = "Full Browser Tab", 
  activeScreenStreamRef?: React.MutableRefObject<MediaStream[]>
): Promise<string> {
  try {
    console.log(`Capturing screenshot with area: ${captureArea}`);
    
    // Map our capture area to the source type
    let source: CaptureSource = 'visible-area';
    switch(captureArea) {
      case "Full Screen":
        source = 'screen';
        break;
      case "Full Browser Tab":
        source = 'full-page';
        break;
      case "Current Window":
        source = 'visible-area';
        break;
      case "Selected Element":
        source = 'element';
        break;
    }
    
    // For screen capture, use our persistent media stream if available
    if (source === 'screen') {
      try {
        // Initialize screen capture if needed
        if (!activeMediaStream || !activeMediaStream.active) {
          console.log("Initializing screen capture for the first time");
          await initScreenCapture();
        }
        
        // If we have a valid media stream, use it to capture the frame
        if (activeMediaStream && activeMediaStream.active && videoElement) {
          const frameData = await captureFrameFromMediaStream(0.8);
          if (frameData) {
            // If we successfully captured from the stream, return the data
            return frameData;
          }
          // If frame capture failed, fall through to html2canvas
          console.warn("Frame capture from media stream failed, falling back to html2canvas");
        }
      } catch (mediaError) {
        console.error("Media capture failed with error:", mediaError);
        console.warn("Falling back to html2canvas for screen capture");
      }
    }
    
    // If we're here, either the source wasn't 'screen', or media capture failed
    // Use html2canvas as the capture method
    console.log(`Using html2canvas for ${captureArea} capture`);
    
    let element: HTMLElement | null = null;
    let options: any = {
      useCORS: true,
      allowTaint: true,
      logging: false,
      scale: 1, // Full quality
      imageTimeout: 0, // No timeout
      ignoreElements: (el: HTMLElement) => {
        // Ignore certain elements that might cause issues
        return el.classList.contains('capture-ignore');
      }
    };
    
    // Configure html2canvas based on the capture area
    switch (captureArea) {
      case "Full Browser Tab":
        // Captures entire document content (may extend beyond viewport)
        element = document.documentElement;
        options.width = document.documentElement.scrollWidth;
        options.height = document.documentElement.scrollHeight;
        options.windowWidth = document.documentElement.scrollWidth;
        options.windowHeight = document.documentElement.scrollHeight;
        break;
      case "Current Window":
        // Captures only what's visible in the browser window/viewport
        element = document.body;
        options.width = window.innerWidth;
        options.height = window.innerHeight;
        options.windowWidth = window.innerWidth;
        options.windowHeight = window.innerHeight;
        break;
      case "Selected Element":
        // For demo purposes, just capture the application container
        element = document.querySelector('.app-container') as HTMLElement || 
                 document.querySelector('main') as HTMLElement || 
                 document.body;
        if (element) {
          const rect = element.getBoundingClientRect();
          options.width = rect.width;
          options.height = rect.height;
          options.x = rect.left;
          options.y = rect.top;
        }
        break;
      default:
        element = document.documentElement;
        options.width = window.innerWidth;
        options.height = window.innerHeight;
    }
    
    if (!element) {
      throw new Error("Cannot find element to capture");
    }
    
    console.log(`Capturing ${captureArea} with settings:`, options);
    
    // Create canvas and capture the element
    const canvas = await html2canvas(element, options);
    
    // Convert canvas to base64 image data URL with reduced quality to avoid payload issues
    const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
    
    console.log(`Screenshot captured successfully. Size: ${estimateBase64ImageSize(dataUrl) / 1024} KB`);
    
    return dataUrl;
  } catch (error) {
    console.error("Error capturing screenshot:", error);
    throw error;
  }
}

// Function to calculate estimated file size of a base64 image
export function estimateBase64ImageSize(base64String: string): number {
  // Remove the data URL prefix to get just the base64 string
  const base64 = base64String.split(',')[1];
  
  if (!base64) {
    return 0;
  }
  
  // Base64 encodes 3 bytes into 4 characters
  // So we can estimate the size by taking the length of the base64 string 
  // and multiplying by 3/4
  const sizeInBytes = (base64.length * 3) / 4;
  
  return sizeInBytes;
}

// Function to compress image if needed
export async function compressImageIfNeeded(base64Image: string, maxSizeInBytes: number = 1024 * 1024): Promise<string> {
  const currentSize = estimateBase64ImageSize(base64Image);
  
  if (currentSize <= maxSizeInBytes) {
    return base64Image;
  }
  
  // Create a canvas to compress the image
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let quality = 0.9;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // Calculate dimensions that maintain aspect ratio but reduce size
      const aspectRatio = img.width / img.height;
      let newWidth = img.width;
      let newHeight = img.height;
      
      // Reduce dimensions until we're likely under our size limit
      while ((newWidth * newHeight * 4) > maxSizeInBytes) {
        newWidth *= 0.9;
        newHeight = newWidth / aspectRatio;
      }
      
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      
      // Convert back to base64 with potentially lower quality
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    
    img.onerror = () => {
      reject(new Error('Error loading image for compression'));
    };
    
    img.src = base64Image;
  });
}