import html2canvas from 'html2canvas';

// Extended MediaTrackConstraints interface to include mediaSource
interface ExtendedMediaTrackConstraints extends MediaTrackConstraints {
  mediaSource?: string;
}

// Extended DisplayMediaStreamConstraints interface
interface ExtendedDisplayMediaStreamConstraints {
  video?: boolean | ExtendedMediaTrackConstraints;
  audio?: boolean | MediaTrackConstraints;
}

// Screenshot capturing functionality
export async function captureScreenshot(captureArea: string = "Full Browser Tab"): Promise<string> {
  try {
    // Determine what to capture based on the capture area setting
    let element: HTMLElement | null = null;
    let options: any = {
      useCORS: true,
      allowTaint: true,
      logging: false,
      scale: 1, // Lower scale for better performance and to avoid payload size issues
      imageTimeout: 0, // No timeout
      ignoreElements: (el: HTMLElement) => {
        // Ignore certain elements that might cause issues
        return el.classList.contains('capture-ignore');
      }
    };
    
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
      case "Full Screen":
        // For capturing the entire screen (multiple monitors)
        // Note: This will trigger browser permissions request
        try {
          if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
            // Use our extended interface for the constraints
            const constraints: ExtendedDisplayMediaStreamConstraints = {
              video: { 
                mediaSource: "screen",
                width: { ideal: 3840 }, // 4K support
                height: { ideal: 2160 }
              }
            };
            const stream = await navigator.mediaDevices.getDisplayMedia(constraints as DisplayMediaStreamConstraints);
            
            // Create a video element to capture the screen
            const video = document.createElement('video');
            video.srcObject = stream;
            
            // Wait for metadata to load for dimensions
            await new Promise(resolve => {
              video.onloadedmetadata = resolve;
              video.play();
            });
            
            // Create a canvas from the video
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            // Draw the video frame to the canvas
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // Stop all tracks
            stream.getTracks().forEach(track => track.stop());
            
            // Return the canvas as a data URL
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            return dataUrl;
          } else {
            throw new Error("Screen capture not supported in this browser");
          }
        } catch (error) {
          console.error("Full screen capture failed:", error);
          // Fallback to document capture
          element = document.documentElement;
          options.width = document.documentElement.scrollWidth;
          options.height = document.documentElement.scrollHeight;
          break;
        }
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
