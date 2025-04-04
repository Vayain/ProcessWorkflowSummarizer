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
  setScreenshots: React.Dispatch<React.SetStateAction<Screenshot[]>>;
  latestScreenshot: Screenshot | null;
  setLatestScreenshot: React.Dispatch<React.SetStateAction<Screenshot | null>>;
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
  setCurrentDescription: React.Dispatch<React.SetStateAction<string>>;
  analysisProgress: { current: number; total: number };
  processingProgress: { status: string; percent: number };
  documentationProgress: { status: string; percent: number };
  isPreviewActive: boolean;
  previewImageData: string | null;
  currentSessionId: number | null;
  setCurrentSessionId: (sessionId: number | null) => void;
  isSessionModalOpen: boolean;
  setIsSessionModalOpen: (isOpen: boolean) => void;
  handleSessionCreated: (sessionId: number) => void;
  startCapture: () => void;
  stopCapture: () => void;
  deleteScreenshot: (id: number) => Promise<void>;
  deleteAllScreenshots: (sessionId?: number) => Promise<void>;
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
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [pendingCapture, setPendingCapture] = useState(false);

  // Reference to track any legacy active display media streams
  const activeScreenStreams = useRef<MediaStream[]>([]);
  
  // Analysis progress tracking
  const [analysisProgress, setAnalysisProgress] = useState({ current: 0, total: 0 });
  const [processingProgress, setProcessingProgress] = useState({ status: 'Waiting...', percent: 0 });
  const [documentationProgress, setDocumentationProgress] = useState({ status: 'Waiting...', percent: 0 });

  // Set initial session ID when component mounts
  useEffect(() => {
    // For demo purposes, use a fixed session ID initially
    if (!currentSessionId) {
      setCurrentSessionId(248);
    }
    
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
  
  // Fetch screenshots whenever currentSessionId changes
  useEffect(() => {
    if (!currentSessionId) return;
    
    const fetchScreenshots = async () => {
      try {
        const response = await fetch(`/api/screenshots?sessionId=${currentSessionId}`);
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
          } else {
            setLatestScreenshot(null);
            setCurrentDescription('');
          }
        }
      } catch (error) {
        console.error('Error fetching screenshots:', error);
      }
    };
    
    fetchScreenshots();
  }, [currentSessionId]);

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

  // Function to show session modal
  const showSessionModal = useCallback(() => {
    setIsSessionModalOpen(true);
    setPendingCapture(true);
  }, []);
  
  // Internal capture function
  const beginCapture = useCallback(async (sessionId: number) => {
    // Only start if preview is active
    if (isPreviewActive && previewImageData) {
      setIsCapturing(true);
      setCaptureStatus('Capturing');
      
      // Create a function that captures and saves a frame
      const saveCurrentFrame = async () => {
        if (!sessionId) return;
        
        try {
          // Get a frame from our capture engine
          const frameData = await captureFrame(0.8);
          if (!frameData) {
            console.warn('Empty frame from capture engine - will try again next interval');
            return; // Just return without showing error, we'll try again next interval
          }
          
          // Compress the image if needed
          const compressedImageData = await compressImage(frameData);
          
          try {
            // Save screenshot to API
            const newScreenshot = await apiRequest('POST', '/api/screenshots', {
              sessionId: sessionId,
              imageData: compressedImageData,
              aiAnalysisStatus: isRealTimeAnalysis ? 'pending' : 'completed'
            });
            
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
          } catch (saveError) {
            console.error('Error saving screenshot:', saveError);
          }
        } catch (captureError) {
          console.error('Error capturing and saving frame:', captureError);
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
    isRealTimeAnalysis,
    sortOrder,
    latestScreenshot,
    toast
  ]);
  
  // Function to handle session creation after beginCapture is defined
  const handleSessionCreated = useCallback((sessionId: number) => {
    setCurrentSessionId(sessionId);
    setPendingCapture(false);
    
    // Begin capture with the new session ID
    beginCapture(sessionId);
  }, [beginCapture, setCurrentSessionId]);

  // Public start capture function - shows the session modal
  const startCapture = useCallback(() => {
    // Show session modal if preview is active
    if (isPreviewActive && previewImageData) {
      showSessionModal();
    } else {
      toast({
        title: "Screen Capture Failed",
        description: "No preview active. Please select a capture source first.",
        variant: "destructive",
      });
    }
  }, [isPreviewActive, previewImageData, showSessionModal, toast]);

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
  
  // Delete all screenshots for the current session or specified session
  const deleteAllScreenshots = useCallback(async (sessionId?: number) => {
    try {
      const targetSessionId = sessionId || currentSessionId;
      if (!targetSessionId) return;
      
      // Confirm before deleting
      if (!window.confirm(`Are you sure you want to delete all screenshots for session #${targetSessionId}?`)) {
        return;
      }
      
      // Get the screenshots to delete
      const screenshotsToDelete = screenshots.filter(s => s.sessionId === targetSessionId);
      
      if (screenshotsToDelete.length === 0) {
        toast({
          title: 'No Screenshots',
          description: 'There are no screenshots to delete for this session.',
        });
        return;
      }
      
      // Delete each screenshot on the server
      for (const screenshot of screenshotsToDelete) {
        await apiRequest('DELETE', `/api/screenshots/${screenshot.id}`, undefined);
      }
      
      // Update state
      setScreenshots(prev => prev.filter(s => s.sessionId !== targetSessionId));
      setScreenshotCount(prev => prev - screenshotsToDelete.length);
      
      // Update latest screenshot if needed
      if (latestScreenshot && latestScreenshot.sessionId === targetSessionId) {
        setLatestScreenshot(null);
        setCurrentDescription('');
      }
      
      toast({
        title: 'Screenshots Deleted',
        description: `Deleted ${screenshotsToDelete.length} screenshots from session #${targetSessionId}.`,
      });
    } catch (error) {
      console.error('Error deleting all screenshots:', error);
      toast({
        title: 'Delete Failed',
        description: 'There was an error deleting the screenshots.',
        variant: 'destructive',
      });
    }
  }, [screenshots, currentSessionId, latestScreenshot, toast]);

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
    setScreenshots,
    latestScreenshot,
    setLatestScreenshot,
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
    setCurrentDescription,
    analysisProgress,
    processingProgress,
    documentationProgress,
    isPreviewActive,
    previewImageData,
    currentSessionId,
    setCurrentSessionId,
    isSessionModalOpen,
    setIsSessionModalOpen,
    handleSessionCreated,
    startCapture,
    stopCapture,
    deleteScreenshot,
    deleteAllScreenshots,
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