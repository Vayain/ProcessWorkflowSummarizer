# Screen Capture Implementation Documentation

This document details the screen capture functionality in the Activity Documentation Tool, including the important fixes for browser permission issues.

## Overview

The screen capture system is designed to:

1. Capture screenshots at regular intervals
2. Support multiple capture methods (Browser Tab, Window, Full Screen, Element)
3. Handle browser permissions efficiently
4. Optimize memory and resource usage
5. Provide robust error handling

## Key Components

### 1. Screen Capture Module (`screenshot.ts`)

This module handles the core functionality of capturing screenshots using two main methods:

- **Screen Capture API** (via `getDisplayMedia`): For Full Screen mode
- **HTML2Canvas**: For other capture modes (Browser Tab, Window, Element)

```typescript
// Core functions
export async function initScreenCapture(): Promise<MediaStream | null>
export function cleanupMediaStream(): void
export async function captureScreenshot(captureArea: string): Promise<string>
export async function compressImageIfNeeded(base64Image: string, maxSizeInBytes: number): Promise<string>
```

### 2. Context Provider (`screenshot-context.tsx`)

The context provider manages the capture state and operations:

- Tracks capture status, settings, and screenshot collection
- Manages capture intervals and timing
- Handles screen capture resource lifecycle
- Provides methods for starting, stopping, and restarting capture

### 3. UI Components (`capture-controls.tsx`)

User interface for configuring and controlling the capture process:

- Capture area selection
- Interval adjustment
- Start/stop/restart controls
- Status indicators and warning banners for active captures

## Key Improvements

### Browser Permission Dialog Fix

**Problem**: 
When capturing in Full Screen mode, the browser would repeatedly display the permission dialog ("Choose what should be shared with Replit") for each screenshot, providing a poor user experience.

**Solution**:
Implemented a persistent stream approach where:

1. A single `MediaStream` is initialized and stored when the user first selects "Full Screen" mode
2. This stream is reused for all subsequent captures without requesting new permissions
3. The stream is properly cleaned up when the user stops capturing or changes modes

```typescript
// Key implementation highlights
let activeMediaStream: MediaStream | null = null;
let videoElement: HTMLVideoElement | null = null;

// Initialize once and reuse
export async function initScreenCapture(): Promise<MediaStream | null> {
  // Initialization code that runs only once
  // Returns a persistent stream
}

// Capture from the existing stream
async function captureFrameFromMediaStream(quality: number = 0.8): Promise<string | null> {
  // Uses the existing stream and video element
}

// Clean up properly when done
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
}
```

### Resource Management Improvements

1. **Proper Cleanup**: All resources are now properly cleaned up when capture is stopped, preventing memory leaks

2. **Error Handling**: Improved error handling for permission requests and capture failures

3. **Video Element Management**: The video element is properly initialized and destroyed when needed

4. **Track Ended Events**: Added listeners for when the user manually stops sharing:

```typescript
// Add an event listener for when the user stops sharing
const tracks = activeMediaStream.getVideoTracks();
if (tracks.length > 0) {
  tracks[0].addEventListener('ended', () => {
    console.log("User stopped sharing screen");
    cleanupMediaStream();
  });
}
```

### User Experience Enhancements

1. **Clear Status Indicators**: Better status messages during capture process

2. **Warning Banner**: Added a warning banner during active Full Screen captures

3. **Better Feedback**: Toast notifications to guide users through the process

4. **Smooth Mode Switching**: Improved handling when switching between capture modes

## Implementation Details

### Media Stream Initialization

```typescript
export async function initScreenCapture(): Promise<MediaStream | null> {
  try {
    // Clean up any existing stream first
    cleanupMediaStream();
    
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
      
      // Create a video element to capture the stream
      videoElement = document.createElement('video');
      videoElement.srcObject = activeMediaStream;
      videoElement.muted = true;
      videoElement.setAttribute('playsinline', 'true');
      
      // Wait for the video to load metadata and start playing
      await new Promise<void>((resolve, reject) => {
        // Implementation details
      });
      
      return activeMediaStream;
    } catch (permissionError) {
      // Error handling
      cleanupMediaStream();
      throw permissionError;
    }
  } catch (error) {
    // Error handling
    cleanupMediaStream();
    return null;
  }
}
```

### Frame Capture Process

```typescript
async function captureFrameFromMediaStream(quality: number = 0.8): Promise<string | null> {
  try {
    // Check if we have a valid stream and video
    if (!activeMediaStream || !activeMediaStream.active || !videoElement) {
      return null;
    }
    
    // Create a canvas to capture the video frame
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return null;
    }
    
    // Draw the current video frame to the canvas
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
    // Convert to JPEG with the specified quality
    return canvas.toDataURL('image/jpeg', quality);
  } catch (error) {
    console.error("Error capturing frame from media stream:", error);
    return null;
  }
}
```

## Best Practices

1. **Always clean up resources**: Ensure MediaStream tracks are stopped when no longer needed
2. **Handle permissions gracefully**: Be prepared for users to deny permissions
3. **Use a single stream**: Initialize once and reuse for multiple captures
4. **Provide clear UI feedback**: Show status changes and guide the user
5. **Compress large images**: Reduce image size for API requests
6. **Fallback mechanisms**: Use HTML2Canvas as a fallback when MediaStream fails

## Future Improvements

- Support for specific window/application selection
- Enhanced region selection for element capture
- Video recording capabilities
- Audio capture integration for complete activity documentation