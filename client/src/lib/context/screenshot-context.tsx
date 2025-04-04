import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { analyzeScreenshot } from '@/lib/openai';
import { getProcessingStatus, processSessionWithCrewAI } from '@/lib/crewai';
import { captureFrame, cleanupCapture, compressImage, isCaptureActive } from '@/lib/capture-engine';

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
  startManualAnalysis: (screenshotIds?: number[]) => Promise<void>;
}

const ScreenshotContext = createContext<ScreenshotContextType | undefined>(undefined);

export const ScreenshotProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureInterval, setCaptureInterval] = useState(2);
  const [captureArea, setCapArea] = useState('Full Screen');
  const [formatType, setFormatType] = useState('PNG');
  const [isRealTimeAnalysis, setIsRealTimeAnalysis] = useState(false);
  const [captureStatus, setCaptureStatus] = useState('Ready');
  const [screenshotCount, setScreenshotCount] = useState(0);
  const [sortOrder, setSortOrder] = useState('newest');
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [captureIntervalId, setCaptureIntervalId] = useState<number | null>(null);
  const [currentDescription, setCurrentDescription] = useState('');
  const [latestScreenshot, setLatestScreenshot] = useState<Screenshot | null>(null);
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const [previewImageData, setPreviewImageData] = useState<string | null>(null);
  const [previewIntervalId, setPreviewIntervalId] = useState<number | null>(null);

  // Reference to track any legacy active display media streams
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
      
      // Clean up using our capture engine
      cleanupCapture();
      
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
  
  // Handler for preview frame updates from the capture engine
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Listen for custom events from our capture engine
      const handlePreviewFrame = (event: Event) => {
        const customEvent = event as CustomEvent;
        if (customEvent.detail && customEvent.detail.previewImage) {
          setPreviewImageData(customEvent.detail.previewImage);
          setIsPreviewActive(true);
        }
      };
      
      window.addEventListener('screenshot-preview-update', handlePreviewFrame);
      
      return () => {
        window.removeEventListener('screenshot-preview-update', handlePreviewFrame);
      };
    }
  }, []);

  // Function to update the capture area
  const setCaptureArea = useCallback((area: string) => {
    setCapArea(area);
  }, []);

  // Start capture function using our new engine
  const startCapture = useCallback(async () => {
    // Only start if preview is active
    if (isPreviewActive && previewImageData) {
      setIsCapturing(true);
      setCaptureStatus('Capturing');
      
      // Create a function that captures and saves a frame
      const saveCurrentFrame = async () => {
        if (!currentSessionId) return;
        
        try {
          // Get a frame from our capture engine
          const frameData = await captureFrame(0.8);
          if (!frameData) {
            console.warn('Empty frame from capture engine - will try again next interval');
            return; // Just return without showing error, we'll try again next interval
          }
          
          // Compress the image if needed
          const compressedImageData = await compressImage(frameData);
          
          // Save screenshot to API
          const response = await apiRequest('POST', '/api/screenshots', {
            sessionId: currentSessionId,
            imageData: compressedImageData,
            aiAnalysisStatus: isRealTimeAnalysis ? 'pending' : 'completed'
          });
          
          if (!response.ok) {
            console.error('Failed to save screenshot, server returned:', response.status);
            return; // Don't show an error since the server itself might be working fine
          }
          
          const newScreenshot = await response.json();
          console.log('Successfully captured screenshot with ID:', newScreenshot.id);
          
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
          console.error('Error capturing and saving frame:', error);
          // Don't show error toasts for individual frame captures as they're distracting
          // and the user will see the frames appear in the gallery anyway
        }
      };
      
      // Capture immediately
      await saveCurrentFrame();
      
      // Set up interval for regular captures
      const intervalId = window.setInterval(saveCurrentFrame, captureInterval * 1000);
      setCaptureIntervalId(intervalId);
      
      toast({
        title: "Screen Capture Started",
        description: `Taking screenshots every ${captureInterval} seconds.`,
      });
    } else {
      toast({
        title: "Screen Capture Failed",
        description: "No preview active. Please select a capture source first.",
        variant: "destructive",
      });
    }
  }, [
    captureInterval,
    isPreviewActive,
    previewImageData,
    currentSessionId,
    isRealTimeAnalysis,
    sortOrder,
    latestScreenshot,
    toast
  ]);

  // Stop capture function
  const stopCapture = useCallback(() => {
    // Stop the capture interval
    if (captureIntervalId) {
      window.clearInterval(captureIntervalId);
      setCaptureIntervalId(null);
    }
    
    // Clean up the capture resources
    cleanupCapture();
    
    // Clean up any legacy streams
    if (activeScreenStreams.current.length > 0) {
      activeScreenStreams.current.forEach(stream => {
        stream.getTracks().forEach(track => track.stop());
      });
      activeScreenStreams.current = [];
    }
    
    setIsCapturing(false);
    setCaptureStatus('Stopped');
    setIsPreviewActive(false);
    setPreviewImageData(null);
    
    toast({
      title: "Screen Capture Stopped",
      description: "All capture resources have been released.",
    });
  }, [captureIntervalId, toast]);

  // Delete a screenshot
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

  // Update screenshot description
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

  // Function to manually start analysis for specific screenshots or all screenshots in the session
  const startManualAnalysis = useCallback(async (screenshotIds?: number[]) => {
    if (!currentSessionId) return;
    
    try {
      // If specific screenshot IDs are provided, analyze only those
      if (screenshotIds && screenshotIds.length > 0) {
        // Mark the selected screenshots as pending analysis
        setScreenshots(prev => 
          prev.map(s => 
            screenshotIds.includes(s.id) 
              ? { ...s, aiAnalysisStatus: 'pending' } 
              : s
          )
        );
        
        // Process each screenshot
        for (const id of screenshotIds) {
          const screenshot = screenshots.find(s => s.id === id);
          if (!screenshot) continue;
          
          try {
            // Analyze the screenshot
            const description = await analyzeScreenshot(id, screenshot.imageData);
            
            // Update in state
            setScreenshots(prev => 
              prev.map(s => s.id === id 
                ? { ...s, description, aiAnalysisStatus: 'completed' } 
                : s
              )
            );
            
            // Update on server
            await apiRequest('PATCH', `/api/screenshots/${id}`, {
              description,
              aiAnalysisStatus: 'completed'
            });
            
            if (latestScreenshot?.id === id) {
              setLatestScreenshot(prev => 
                prev ? { ...prev, description, aiAnalysisStatus: 'completed' } : null
              );
              setCurrentDescription(description);
            }
          } catch (error) {
            console.error(`Error analyzing screenshot ${id}:`, error);
            
            // Mark as failed
            setScreenshots(prev => 
              prev.map(s => s.id === id 
                ? { ...s, aiAnalysisStatus: 'failed' } 
                : s
              )
            );
            
            if (latestScreenshot?.id === id) {
              setLatestScreenshot(prev => 
                prev ? { ...prev, aiAnalysisStatus: 'failed' } : null
              );
            }
          }
        }
        
        toast({
          title: "Analysis Complete",
          description: `Analyzed ${screenshotIds.length} selected screenshots.`,
        });
      } else {
        // No specific IDs provided, use the server-side batch processing
        await processSessionWithCrewAI(currentSessionId);
        
        toast({
          title: "LLM Analysis Started",
          description: "Processing all screenshots in this session.",
        });
      }
    } catch (error) {
      console.error('Error starting manual analysis:', error);
      toast({
        title: "Analysis Failed",
        description: "Could not start LLM analysis. Please try again.",
        variant: "destructive",
      });
    }
  }, [currentSessionId, screenshots, latestScreenshot, toast]);

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
    startManualAnalysis,
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