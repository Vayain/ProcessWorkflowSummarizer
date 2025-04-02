import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { captureScreenshot, compressImageIfNeeded, initScreenCapture, cleanupMediaStream, captureFrameFromMediaStream } from '@/lib/screenshot';
import { analyzeScreenshot } from '@/lib/openai';
import { getProcessingStatus } from '@/lib/crewai';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Screenshot {
  id: number;
  sessionId: number;
  timestamp: string;
  imageData: string;
  description?: string;
  aiAnalysisStatus: 'pending' | 'completed' | 'failed';
}

interface ScreenshotContextType {
  screenshots: Screenshot[];
  latestScreenshot: Screenshot | null;
  isCapturing: boolean;
  captureInterval: number;
  setCaptureInterval: (interval: number) => void;
  captureArea: string;
  setCaptureArea: (area: string) => void;
  formatType: string;
  setFormatType: (format: string) => void;
  isRealTimeAnalysis: boolean;
  setIsRealTimeAnalysis: (isRealTime: boolean) => void;
  captureStatus: string;
  screenshotCount: number;
  sortOrder: string;
  setSortOrder: (order: string) => void;
  currentDescription: string;
  analysisProgress: { current: number; total: number };
  processingProgress: { status: string; percent: number };
  documentationProgress: { status: string; percent: number };
  isPreviewActive: boolean;
  previewImageData: string | null;
  startCapture: () => void;
  stopCapture: () => void;
  deleteScreenshot: (id: number) => Promise<void>;
  updateScreenshotDescription: (id: number, description: string) => Promise<void>;
}

const ScreenshotContext = createContext<ScreenshotContextType | undefined>(undefined);

export const ScreenshotProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureInterval, setCaptureInterval] = useState(2);
  const [captureArea, setCaptureArea] = useState('Full Browser Tab');
  const [formatType, setFormatType] = useState('PNG');
  const [isRealTimeAnalysis, setIsRealTimeAnalysis] = useState(true);
  const [captureStatus, setCaptureStatus] = useState('Ready');
  const [screenshotCount, setScreenshotCount] = useState(0);
  const [sortOrder, setSortOrder] = useState('newest');
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [captureIntervalId, setCaptureIntervalId] = useState<number | null>(null);
  const [currentDescription, setCurrentDescription] = useState('');
  const [latestScreenshot, setLatestScreenshot] = useState<Screenshot | null>(null);
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const [previewImageData, setPreviewImageData] = useState<string | null>(null);
  
  // Reference to track any active display media streams
  const activeScreenStreams = useRef<MediaStream[]>([]);
  
  // Analysis progress tracking
  const [analysisProgress, setAnalysisProgress] = useState({ current: 0, total: 0 });
  const [processingProgress, setProcessingProgress] = useState({ status: 'Waiting...', percent: 0 });
  const [documentationProgress, setDocumentationProgress] = useState({ status: 'Waiting...', percent: 0 });

  // Load screenshots from API when component mounts
  useEffect(() => {
    // For demo purposes, use a fixed session ID
    setCurrentSessionId(248);
    
    const fetchScreenshots = async () => {
      try {
        const response = await fetch('/api/screenshots?sessionId=248');
        if (response.ok) {
          const data = await response.json();
          setScreenshots(data);
          setScreenshotCount(data.length);
          if (data.length > 0) {
            const sorted = [...data].sort((a, b) => 
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
            setLatestScreenshot(sorted[0]);
            setCurrentDescription(sorted[0].description || '');
          }
        }
      } catch (error) {
        console.error('Error fetching screenshots:', error);
      }
    };
    
    fetchScreenshots();
    
    // Cleanup on unmount
    return () => {
      // Stop capture interval
      if (captureIntervalId) {
        window.clearInterval(captureIntervalId);
      }
      
      // Clean up any active screen streams using the new global cleanup function
      cleanupMediaStream();
      
      // Also clean up any streams tracked in our ref for backward compatibility
      if (activeScreenStreams.current.length > 0) {
        console.log(`Unmounting component, cleaning up ${activeScreenStreams.current.length} active streams.`);
        activeScreenStreams.current.forEach(stream => {
          stream.getTracks().forEach(track => track.stop());
        });
        activeScreenStreams.current = [];
      }
    };
  }, []);

  // Polling for processing status
  useEffect(() => {
    if (!currentSessionId) return;
    
    const statusInterval = setInterval(async () => {
      try {
        const status = await getProcessingStatus(currentSessionId);
        setAnalysisProgress(status.analysisProgress);
        setProcessingProgress(status.processingProgress);
        setDocumentationProgress(status.documentationProgress);
      } catch (error) {
        console.error('Error fetching processing status:', error);
      }
    }, 5000);
    
    return () => clearInterval(statusInterval);
  }, [currentSessionId]);

  // Sort screenshots when sortOrder changes
  useEffect(() => {
    const sortedScreenshots = [...screenshots].sort((a, b) => {
      const aTime = new Date(a.timestamp).getTime();
      const bTime = new Date(b.timestamp).getTime();
      return sortOrder === 'newest' ? bTime - aTime : aTime - bTime;
    });
    setScreenshots(sortedScreenshots);
  }, [sortOrder]);
  
  // Effect to handle capture area changes and initialize preview
  useEffect(() => {
    // When Full Screen mode is selected, initialize the preview automatically
    if (captureArea === "Full Screen") {
      setCaptureStatus('Initializing preview...');
      
      // Initialize screen capture for preview
      initScreenCapture()
        .then(stream => {
          if (stream) {
            setIsPreviewActive(true);
            setCaptureStatus('Preview active');
            
            // Create a preview frame every second
            const previewInterval = setInterval(async () => {
              try {
                if (!isCapturing) {
                  const frame = await captureFrameFromMediaStream(0.5);
                  if (frame) {
                    setPreviewImageData(frame);
                  }
                }
              } catch (error) {
                console.error('Error updating preview frame:', error);
              }
            }, 1000);
            
            // Clean up the preview interval when changing capture area
            return () => {
              clearInterval(previewInterval);
              if (!isCapturing) {
                cleanupMediaStream();
              }
            };
          } else {
            setIsPreviewActive(false);
            setCaptureStatus('Preview failed');
          }
        })
        .catch(error => {
          console.error('Error initializing preview:', error);
          setIsPreviewActive(false);
          setCaptureStatus('Preview failed');
        });
    } else {
      setIsPreviewActive(false);
      setPreviewImageData(null);
    }
  }, [captureArea, isCapturing]);

  const captureAndSaveScreenshot = useCallback(async () => {
    if (!currentSessionId) return;
    
    try {
      // For full screen captures, we're now releasing the stream immediately after each capture
      // This avoids the issue with browser permission dialog staying open
      const imageData = await captureScreenshot(captureArea);
      
      // Compress if needed to ensure it's not too large for API
      const compressedImageData = await compressImageIfNeeded(imageData);
      
      // Save screenshot to API
      const response = await apiRequest('POST', '/api/screenshots', {
        sessionId: currentSessionId,
        imageData: compressedImageData,
        aiAnalysisStatus: isRealTimeAnalysis ? 'pending' : 'completed'
      });
      
      if (!response.ok) {
        throw new Error('Failed to save screenshot');
      }
      
      const newScreenshot = await response.json();
      
      // Add to state
      setScreenshots(prev => {
        const updated = [newScreenshot, ...prev];
        return sortOrder === 'newest' 
          ? updated 
          : updated.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      });
      
      setLatestScreenshot(newScreenshot);
      setScreenshotCount(prev => prev + 1);
      
      // If real-time analysis is enabled, send for analysis
      if (isRealTimeAnalysis) {
        try {
          const description = await analyzeScreenshot(newScreenshot.id, compressedImageData);
          
          // Update screenshot with description
          const updatedScreenshot = {
            ...newScreenshot,
            description,
            aiAnalysisStatus: 'completed'
          };
          
          // Update in state
          setScreenshots(prev => 
            prev.map(s => s.id === updatedScreenshot.id ? updatedScreenshot : s)
          );
          
          setLatestScreenshot(updatedScreenshot);
          setCurrentDescription(description);
          
          // Also update on server
          await apiRequest('PATCH', `/api/screenshots/${newScreenshot.id}`, {
            description,
            aiAnalysisStatus: 'completed'
          });
        } catch (error) {
          console.error('Error analyzing screenshot:', error);
          
          // Mark as failed
          setScreenshots(prev => 
            prev.map(s => s.id === newScreenshot.id 
              ? { ...s, aiAnalysisStatus: 'failed' } 
              : s
            )
          );
          
          if (newScreenshot.id === latestScreenshot?.id) {
            setLatestScreenshot(prev => prev ? { ...prev, aiAnalysisStatus: 'failed' } : null);
          }
        }
      }
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      toast({
        title: 'Screenshot Capture Failed',
        description: 'There was an error capturing or saving the screenshot.',
        variant: 'destructive',
      });
    }
  }, [currentSessionId, captureArea, isRealTimeAnalysis, sortOrder, latestScreenshot, toast]);

  const startCapture = useCallback(async () => {
    setIsCapturing(true);
    setCaptureStatus('Preparing...');
    
    // For Full Screen mode, initialize the stream first to handle permissions
    try {
      if (captureArea === "Full Screen") {
        // Show a toast while waiting for the user to choose what to share
        toast({
          title: "Select what to share",
          description: "Please select the screen, window, or tab you want to capture",
        });
        
        // Initialize screen capture
        const stream = await initScreenCapture();
        
        if (!stream) {
          toast({
            title: "Screen Capture Failed",
            description: "Unable to access screen capture. Please try again.",
            variant: "destructive",
          });
          setIsCapturing(false);
          setCaptureStatus('Failed');
          return;
        }
        
        // Success - screen is ready to capture
        toast({
          title: "Ready to Capture",
          description: "Screen capture initialized successfully!",
        });
      }
    } catch (error) {
      console.error("Error initializing capture:", error);
      toast({
        title: "Screen Capture Failed",
        description: error instanceof Error ? error.message : "Unknown error initializing capture",
        variant: "destructive",
      });
      setIsCapturing(false);
      setCaptureStatus('Failed');
      return;
    }
    
    setCaptureStatus('Capturing');
    
    // Capture immediately
    captureAndSaveScreenshot();
    
    // Then set interval
    const intervalId = window.setInterval(captureAndSaveScreenshot, captureInterval * 1000);
    setCaptureIntervalId(intervalId);
  }, [captureInterval, captureAndSaveScreenshot, captureArea, toast]);

  const stopCapture = useCallback(() => {
    // Stop the capture interval
    if (captureIntervalId) {
      window.clearInterval(captureIntervalId);
      setCaptureIntervalId(null);
    }
    
    // Clean up any screen capture resources using the global cleanup function
    cleanupMediaStream();
    
    // Also clean up any streams in our ref for backward compatibility
    if (activeScreenStreams.current.length > 0) {
      console.log(`Cleaning up ${activeScreenStreams.current.length} active media streams from ref`);
      
      // Stop all active streams
      activeScreenStreams.current.forEach(stream => {
        stream.getTracks().forEach(track => {
          console.log(`Stopping track: ${track.kind} (${track.id})`);
          track.stop();
        });
      });
      
      // Clear the array
      activeScreenStreams.current = [];
    }
    
    setIsCapturing(false);
    setCaptureStatus('Paused');
    
    toast({
      title: "Screen Capture Stopped",
      description: "All capture resources have been released.",
    });
  }, [captureIntervalId, toast]);

  const restartCapture = useCallback(() => {
    // Clear old interval
    if (captureIntervalId) {
      window.clearInterval(captureIntervalId);
    }
    
    // Clean up any screen capture resources using the global cleanup function
    cleanupMediaStream();
    
    // Also clean up any streams tracked in our ref for backward compatibility
    if (activeScreenStreams.current.length > 0) {
      activeScreenStreams.current.forEach(stream => {
        stream.getTracks().forEach(track => track.stop());
      });
      activeScreenStreams.current = [];
    }
    
    // Reset count
    setScreenshotCount(0);
    setScreenshots([]);
    setLatestScreenshot(null);
    setCurrentDescription('');
    
    // Start new capture - for Full Screen mode, we'll initialize the stream first
    if (captureArea === "Full Screen") {
      // Initialize the stream but don't wait for it, it will be done in captureScreenshot
      initScreenCapture().catch(error => {
        console.error("Failed to initialize screen capture during restart:", error);
      });
    }
    
    setCaptureStatus('Restarted');
    setIsCapturing(true);
    
    // Capture immediately
    captureAndSaveScreenshot();
    
    // Then set interval
    const intervalId = window.setInterval(captureAndSaveScreenshot, captureInterval * 1000);
    setCaptureIntervalId(intervalId);
    
    toast({
      title: "Screen Capture Restarted",
      description: "All previous captures have been cleared.",
    });
  }, [captureInterval, captureIntervalId, captureAndSaveScreenshot, captureArea, toast]);

  const deleteScreenshot = useCallback(async (id: number) => {
    try {
      await apiRequest('DELETE', `/api/screenshots/${id}`, undefined);
      
      setScreenshots(prev => prev.filter(s => s.id !== id));
      setScreenshotCount(prev => prev - 1);
      
      if (latestScreenshot?.id === id) {
        const newLatest = screenshots
          .filter(s => s.id !== id)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0] || null;
        
        setLatestScreenshot(newLatest);
        setCurrentDescription(newLatest?.description || '');
      }
      
      toast({
        title: 'Screenshot Deleted',
        description: 'The screenshot has been deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting screenshot:', error);
      toast({
        title: 'Delete Failed',
        description: 'There was an error deleting the screenshot.',
        variant: 'destructive',
      });
    }
  }, [screenshots, latestScreenshot, toast]);

  const updateScreenshotDescription = useCallback(async (id: number, description: string) => {
    try {
      await apiRequest('PATCH', `/api/screenshots/${id}`, { description });
      
      setScreenshots(prev => 
        prev.map(s => s.id === id ? { ...s, description } : s)
      );
      
      if (latestScreenshot?.id === id) {
        setLatestScreenshot(prev => prev ? { ...prev, description } : null);
        setCurrentDescription(description);
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error updating description:', error);
      return Promise.reject(error);
    }
  }, [latestScreenshot]);

  const value = {
    screenshots,
    latestScreenshot,
    isCapturing,
    captureInterval,
    setCaptureInterval,
    captureArea,
    setCaptureArea,
    formatType,
    setFormatType,
    isRealTimeAnalysis,
    setIsRealTimeAnalysis,
    captureStatus,
    screenshotCount,
    sortOrder,
    setSortOrder,
    currentDescription,
    analysisProgress,
    processingProgress,
    documentationProgress,
    isPreviewActive,
    previewImageData,
    startCapture,
    stopCapture,
    deleteScreenshot,
    updateScreenshotDescription,
  };

  return (
    <ScreenshotContext.Provider value={value}>
      {children}
    </ScreenshotContext.Provider>
  );
};

export const useScreenshotContext = () => {
  const context = useContext(ScreenshotContext);
  if (context === undefined) {
    throw new Error('useScreenshotContext must be used within a ScreenshotProvider');
  }
  return context;
};
