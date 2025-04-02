/**
 * Simplified Screen Capture Engine
 * 
 * This module provides a simple, reliable screen capture implementation
 * that handles both preview generation and actual screenshot capture.
 */

// Global state to track the active media stream and video element
let activeMediaStream: MediaStream | null = null;
let videoElement: HTMLVideoElement | null = null;
let previewInterval: number | null = null;
let previewCallback: ((previewImage: string) => void) | null = null;

// Initialize screen capture and return success status
export async function initializeCapture(
  onPreviewFrame: (previewImage: string) => void
): Promise<boolean> {
  // Clean up any existing capture resources
  cleanupCapture();
  
  try {
    // Check if browser supports screen capture
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      console.error("This browser doesn't support screen capture");
      return false;
    }
    
    // Request screen capture permission
    console.log("Requesting screen capture permission...");
    activeMediaStream = await navigator.mediaDevices.getDisplayMedia({ 
      video: { 
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: { ideal: 15 }
      },
      audio: false
    });
    
    // Create video element for the stream
    videoElement = document.createElement('video');
    videoElement.srcObject = activeMediaStream;
    videoElement.muted = true;
    videoElement.setAttribute('playsinline', 'true');
    
    // Start video playback
    await videoElement.play();
    
    console.log("Screen capture initialized", {
      width: videoElement.videoWidth,
      height: videoElement.videoHeight
    });
    
    // Set up preview callback
    previewCallback = onPreviewFrame;
    
    // Start preview
    startPreview();
    
    // Add event listener for when the user stops sharing
    const tracks = activeMediaStream.getVideoTracks();
    if (tracks.length > 0) {
      tracks[0].addEventListener('ended', () => {
        console.log("User stopped sharing screen");
        cleanupCapture();
      });
    }
    
    return true;
  } catch (error) {
    console.error("Failed to initialize screen capture:", error);
    cleanupCapture();
    return false;
  }
}

// Start generating preview frames
function startPreview() {
  if (!activeMediaStream || !videoElement || !previewCallback) {
    return;
  }
  
  // Generate an initial frame
  captureFrame().then(frame => {
    if (frame) previewCallback!(frame);
  });
  
  // Set up interval for ongoing preview
  previewInterval = window.setInterval(async () => {
    const frame = await captureFrame();
    if (frame && previewCallback) {
      previewCallback(frame);
    }
  }, 500) as unknown as number;
}

// Capture a single frame from the video stream
export async function captureFrame(quality: number = 0.8): Promise<string | null> {
  if (!activeMediaStream || !activeMediaStream.active || !videoElement) {
    console.warn("No active media stream for capture");
    return null;
  }
  
  try {
    // Create a canvas to capture the video frame
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    
    if (canvas.width === 0 || canvas.height === 0) {
      console.error("Invalid canvas dimensions, can't capture frame");
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
    
    return imageData;
  } catch (error) {
    console.error("Error capturing frame:", error);
    return null;
  }
}

// Clean up all capture resources
export function cleanupCapture() {
  // Clear the preview interval
  if (previewInterval !== null) {
    window.clearInterval(previewInterval);
    previewInterval = null;
  }
  
  // Stop all media tracks
  if (activeMediaStream) {
    activeMediaStream.getTracks().forEach(track => {
      if (track.readyState === 'live') {
        track.stop();
      }
    });
    activeMediaStream = null;
  }
  
  // Clean up the video element
  if (videoElement) {
    videoElement.srcObject = null;
    videoElement = null;
  }
  
  // Clear the preview callback
  previewCallback = null;
  
  console.log("Screen capture resources cleaned up");
}

// Check if capture is active
export function isCaptureActive(): boolean {
  return !!activeMediaStream && activeMediaStream.active && !!videoElement;
}

// Compress an image if it's too large
export async function compressImage(
  base64Image: string, 
  maxSizeInBytes: number = 1024 * 1024
): Promise<string> {
  // If image is small enough, return as is
  if (estimateImageSize(base64Image) <= maxSizeInBytes) {
    return base64Image;
  }
  
  // Create an image element
  const img = new Image();
  
  // Wait for the image to load
  await new Promise<void>(resolve => {
    img.onload = () => resolve();
    img.src = base64Image;
  });
  
  // Calculate dimensions that maintain aspect ratio but reduce size
  const aspectRatio = img.width / img.height;
  let newWidth = img.width;
  let newHeight = img.height;
  
  // Reduce dimensions until we're likely under our size limit
  while ((newWidth * newHeight * 4) > maxSizeInBytes) {
    newWidth *= 0.9;
    newHeight = newWidth / aspectRatio;
  }
  
  // Create a canvas to compress the image
  const canvas = document.createElement('canvas');
  canvas.width = newWidth;
  canvas.height = newHeight;
  
  // Draw the image to the canvas
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return base64Image;
  }
  
  ctx.drawImage(img, 0, 0, newWidth, newHeight);
  
  // Convert back to base64 with reduced quality
  return canvas.toDataURL('image/jpeg', 0.75);
}

// Estimate the size of a base64 image in bytes
function estimateImageSize(base64String: string): number {
  // Remove the data URL prefix to get just the base64 string
  const base64 = base64String.split(',')[1];
  
  if (!base64) {
    return 0;
  }
  
  // Base64 encodes 3 bytes into 4 characters
  // So we can estimate the size by taking the length of the base64 string 
  // and multiplying by 3/4
  return (base64.length * 3) / 4;
}