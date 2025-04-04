import { useScreenshotContext } from "@/lib/context/screenshot-context";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";

export default function LiveView() {
  const { 
    latestScreenshot, 
    setLatestScreenshot,
    isCapturing, 
    captureInterval,
    analysisProgress,
    processingProgress,
    documentationProgress,
    currentDescription,
    setCurrentDescription,
    isPreviewActive,
    previewImageData,
    captureArea,
    currentSessionId
  } = useScreenshotContext();
  
  // Add auto-refresh for the latest screenshot when capturing is active
  useEffect(() => {
    if (!isCapturing || !currentSessionId) return;
    
    const fetchLatestScreenshot = async () => {
      try {
        const response = await apiRequest('GET', `/api/screenshots?sessionId=${currentSessionId}`, undefined);
        if (!response.ok) return;
        
        const screenshots = await response.json();
        if (screenshots.length === 0) return;
        
        // Get the newest screenshot
        const newest = screenshots.sort((a: any, b: any) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )[0];
        
        // Update only if we have a newer screenshot or no screenshot yet
        if (!latestScreenshot || newest.id > latestScreenshot.id) {
          console.log(`LiveView: Updating latest screenshot to #${newest.id}`);
          setLatestScreenshot(newest);
          setCurrentDescription(newest.description || '');
        }
      } catch (error) {
        console.error('Error fetching latest screenshot:', error);
      }
    };
    
    // Set a fast interval while capturing is active (1.5 seconds)
    const intervalId = window.setInterval(fetchLatestScreenshot, 1500);
    
    // Fetch immediately on mount
    fetchLatestScreenshot();
    
    return () => {
      window.clearInterval(intervalId);
    };
  }, [isCapturing, currentSessionId, latestScreenshot, setLatestScreenshot, setCurrentDescription]);

  return (
    <div className="w-full lg:w-3/5 p-4 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-medium text-neutral-700">Live View</h2>
        
        {isCapturing && (
          <div className="flex items-center text-sm">
            <span className="relative flex h-3 w-3 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary-400"></span>
            </span>
            <span className="text-neutral-600">Capturing every {captureInterval} seconds</span>
          </div>
        )}
        
        {!isCapturing && isPreviewActive && (
          <div className="flex items-center text-sm">
            <span className="relative flex h-3 w-3 mr-2">
              <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-green-600">Preview active - click "Start Capture" when ready</span>
          </div>
        )}
      </div>
      
      <div className="flex-1 border border-neutral-200 rounded-lg bg-white overflow-hidden mb-4 relative">
        {isPreviewActive && previewImageData && !isCapturing ? (
          // Show the preview image when in preview mode
          <div className="relative">
            <img 
              src={previewImageData} 
              alt="Preview of the capture area" 
              className="w-full h-full object-contain"
            />
            <div className="absolute top-2 right-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
              Preview Mode
            </div>
          </div>
        ) : latestScreenshot ? (
          // Show the latest captured screenshot
          <img 
            src={latestScreenshot.imageData} 
            alt="Latest screenshot of user activity" 
            className="w-full h-full object-contain"
          />
        ) : (
          // Show a message when no screenshots or preview available
          <div className="w-full h-full flex items-center justify-center">
            {captureArea === "Full Screen" ? (
              <p className="text-neutral-400">Initializing preview... please allow screen sharing when prompted.</p>
            ) : (
              <p className="text-neutral-400">No screenshot captured yet. Click "Start Capture" to begin.</p>
            )}
          </div>
        )}
        
        {latestScreenshot && latestScreenshot.description && (
          <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-90 p-3 border-t border-neutral-200">
            <div className="flex items-start">
              <span className="material-icons text-neutral-400 mr-2 mt-0.5">description</span>
              <div>
                <div className="text-sm font-medium text-neutral-700 mb-1">AI-Generated Description:</div>
                <p className="text-sm text-neutral-600">{currentDescription}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
