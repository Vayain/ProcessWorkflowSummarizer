import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';
import { createThumbnail, cacheScreenshot, getCachedThumbnail } from '@/lib/performance';
import { Screenshot } from '@shared/schema';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { usePagination } from '@/hooks/use-pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  Loader2 
} from 'lucide-react';

interface OptimizedScreenshotGalleryProps {
  sessionId?: number;
  onEdit: (screenshotId: number) => void;
  onDelete?: (screenshotId: number) => void;
  pageSize?: number;
}

export default function OptimizedScreenshotGallery({ 
  sessionId, 
  onEdit, 
  onDelete,
  pageSize = 10
}: OptimizedScreenshotGalleryProps) {
  const { toast } = useToast();
  const [selectedScreenshot, setSelectedScreenshot] = useState<Screenshot | null>(null);
  const [viewingFullSize, setViewingFullSize] = useState(false);
  const [processingImages, setProcessingImages] = useState<Record<number, boolean>>({});
  
  // Load screenshots
  const { data, isLoading, error } = useQuery({
    queryKey: sessionId ? ['/api/screenshots', sessionId] : ['/api/screenshots'],
    queryFn: async () => {
      const url = sessionId 
        ? `/api/screenshots?sessionId=${sessionId}` 
        : '/api/screenshots';
      return apiRequest('GET', url) as Promise<Screenshot[]>;
    }
  });
  
  // Ensure data is always an array
  const screenshots = Array.isArray(data) ? data : [];
  
  // Set up pagination
  const pagination = usePagination({
    initialPageSize: pageSize,
    totalItems: screenshots.length
  });
  
  // Get paginated data
  const paginatedScreenshots = pagination.paginatedData(screenshots);
  
  // Load and process thumbnails
  useEffect(() => {
    const loadThumbnails = async () => {
      for (const screenshot of paginatedScreenshots) {
        if (!getCachedThumbnail(screenshot.id)) {
          // Only process if not already processing
          if (!processingImages[screenshot.id]) {
            setProcessingImages(prev => ({ ...prev, [screenshot.id]: true }));
            
            try {
              // Generate thumbnail from image data
              if (screenshot.imageData) {
                const thumbnail = await createThumbnail(screenshot.imageData);
                cacheScreenshot(screenshot.id, screenshot.imageData, thumbnail);
              }
            } catch (err) {
              console.error(`Failed to process thumbnail for screenshot ${screenshot.id}:`, err);
            } finally {
              setProcessingImages(prev => ({ ...prev, [screenshot.id]: false }));
            }
          }
        }
      }
    };
    
    loadThumbnails();
  }, [paginatedScreenshots, processingImages]);
  
  // Handle view screenshot
  const handleViewScreenshot = useCallback((screenshot: Screenshot) => {
    setSelectedScreenshot(screenshot);
    setViewingFullSize(false);
  }, []);
  
  // Handle download screenshot
  const handleDownloadScreenshot = useCallback((screenshot: Screenshot) => {
    if (!screenshot.imageData) return;
    
    const link = document.createElement('a');
    link.href = screenshot.imageData;
    link.download = `screenshot-${screenshot.id}-${new Date(screenshot.timestamp).toISOString().replace(/:/g, '-')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: 'Screenshot Downloaded',
      description: 'The screenshot has been downloaded to your device.',
    });
  }, [toast]);
  
  // Handle delete screenshot
  const handleDeleteScreenshot = useCallback(async (id: number) => {
    if (!onDelete) return;
    
    try {
      await apiRequest('DELETE', `/api/screenshots/${id}`);
      
      onDelete(id);
      
      toast({
        title: 'Screenshot Deleted',
        description: 'The screenshot has been permanently removed.',
      });
      
      // Close viewer if the deleted screenshot was being viewed
      if (selectedScreenshot?.id === id) {
        setSelectedScreenshot(null);
      }
    } catch (err) {
      console.error('Failed to delete screenshot:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete the screenshot. Please try again.',
        variant: 'destructive',
      });
    }
  }, [onDelete, selectedScreenshot, toast]);
  
  // Toggle full size view
  const toggleFullSize = useCallback(() => {
    setViewingFullSize(!viewingFullSize);
  }, [viewingFullSize]);
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <Skeleton className="h-[200px] w-full" />
            <CardContent className="p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">Failed to load screenshots</p>
        <Button 
          onClick={() => window.location.reload()}
          variant="outline"
        >
          Try Again
        </Button>
      </div>
    );
  }
  
  if (screenshots.length === 0) {
    return (
      <div className="p-8 text-center border rounded-lg">
        <p className="text-muted-foreground mb-4">No screenshots available</p>
        <p className="text-sm text-muted-foreground">
          Capture your first screenshot using the controls above.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Screenshot Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedScreenshots.map((screenshot) => {
          const thumbnailData = getCachedThumbnail(screenshot.id);
          const isProcessing = processingImages[screenshot.id];
          
          return (
            <Card key={screenshot.id} className="overflow-hidden group">
              <div className="relative h-[200px] bg-muted">
                {isProcessing ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
                  </div>
                ) : (
                  <>
                    <div 
                      className="h-full w-full bg-cover bg-center cursor-pointer"
                      style={{ 
                        backgroundImage: `url(${thumbnailData || screenshot.imageData})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                      onClick={() => handleViewScreenshot(screenshot)}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex gap-2">
                        <Button 
                          size="icon" 
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewScreenshot(screenshot);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(screenshot.id);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {onDelete && (
                          <Button 
                            size="icon" 
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteScreenshot(screenshot.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs text-muted-foreground">
                    {new Date(screenshot.timestamp).toLocaleString()}
                  </p>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      screenshot.aiAnalysisStatus === "completed" 
                        ? "bg-green-100 text-green-800" 
                        : screenshot.aiAnalysisStatus === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    } px-2 py-0.5 rounded-full`}
                  >
                    {screenshot.aiAnalysisStatus === "completed" 
                      ? "Analyzed" 
                      : screenshot.aiAnalysisStatus === "pending"
                      ? "Pending"
                      : "Failed"}
                  </Badge>
                </div>
                <div className="mt-2">
                  <h4 className="text-xs font-medium text-neutral-700 mb-1">Description:</h4>
                  <p className={`text-xs ${screenshot.description ? 'text-neutral-600' : 'text-neutral-400 italic'} line-clamp-3`}>
                    {screenshot.description || "No description available yet. Use the 'Start LLM Analysis' button to generate descriptions."}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Pagination Controls */}
      {screenshots.length > pageSize && (
        <div className="flex justify-center mt-6">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={pagination.goToPage}
            onPageSizeChange={pagination.setPageSize}
            pageSize={pagination.pageSize}
            pageSizeOptions={[5, 10, 20, 50]}
          />
        </div>
      )}
      
      {/* Screenshot Viewer Modal */}
      {selectedScreenshot && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg max-w-6xl w-full max-h-[90vh] flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {selectedScreenshot.description || 'Screenshot View'}
              </h3>
              <div className="flex items-center gap-2">
                <Button 
                  size="icon" 
                  variant="outline"
                  onClick={toggleFullSize}
                >
                  {viewingFullSize ? (
                    <ZoomOut className="h-4 w-4" />
                  ) : (
                    <ZoomIn className="h-4 w-4" />
                  )}
                </Button>
                <Button 
                  size="icon" 
                  variant="outline"
                  onClick={() => handleDownloadScreenshot(selectedScreenshot)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="outline"
                  onClick={() => setSelectedScreenshot(null)}
                >
                  &times;
                </Button>
              </div>
            </div>
            <div className="p-4 overflow-auto flex-1">
              <div className={`mx-auto ${viewingFullSize ? '' : 'max-w-4xl'}`}>
                {selectedScreenshot.imageData && (
                  <img 
                    src={selectedScreenshot.imageData} 
                    alt={selectedScreenshot.description || 'Screenshot'} 
                    className={`mx-auto ${viewingFullSize ? 'w-full' : 'max-w-full max-h-[70vh]'} object-contain`}
                  />
                )}
              </div>
              <div className="mt-4 p-4 bg-muted rounded-md">
                <h3 className="text-sm font-medium mb-2">AI Analysis:</h3>
                <p className={`text-sm ${selectedScreenshot.description ? '' : 'text-muted-foreground italic'}`}>
                  {selectedScreenshot.description || "No AI analysis available yet. Use the 'Start LLM Analysis' button to generate a description for this screenshot."}
                </p>
              </div>
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedScreenshot(null)}>
                Close
              </Button>
              <Button onClick={() => onEdit(selectedScreenshot.id)}>
                Edit Description
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}