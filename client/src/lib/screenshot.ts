import html2canvas from 'html2canvas';

// Screenshot capturing functionality
export async function captureScreenshot(captureArea: string = "Full Browser Tab"): Promise<string> {
  try {
    // Determine what to capture based on the capture area setting
    let element: HTMLElement | null = null;
    
    switch (captureArea) {
      case "Full Browser Tab":
        element = document.documentElement;
        break;
      case "Current Window":
        element = document.body;
        break;
      case "Full Screen":
        element = document.documentElement;
        break;
      default:
        element = document.documentElement;
    }

    if (!element) {
      throw new Error("Cannot find element to capture");
    }

    const canvas = await html2canvas(element, {
      useCORS: true,
      allowTaint: true,
      logging: false,
      scale: window.devicePixelRatio,
    });

    // Convert canvas to base64 image data URL
    return canvas.toDataURL("image/png");
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
