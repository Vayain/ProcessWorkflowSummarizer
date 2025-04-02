import React, { useRef, useEffect, useState, useCallback } from 'react';
import { getCachedThumbnail, createThumbnail, cacheScreenshot } from '@/lib/performance';
import { Screenshot } from '@shared/schema';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, Edit, Trash2, Download } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface VirtualizedScreenshotListProps {
  screenshots: Screenshot[];
  onEdit: (screenshotId: number) => void;
  onView: (screenshot: Screenshot) => void;
  onDelete?: (screenshotId: number) => void;
  isLoading?: boolean;
  rowHeight?: number;
  overscan?: number;
}

export default function VirtualizedScreenshotList({
  screenshots,
  onEdit,
  onView,
  onDelete,
  isLoading = false,
  rowHeight = 280, // Card height + margin
  overscan = 5 // Number of items to render above/below visible area
}: VirtualizedScreenshotListProps) {
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  const [containerWidth, setContainerWidth] = useState(0);
  const [processingImages, setProcessingImages] = useState<Record<number, boolean>>({});
  
  // Calculate number of columns based on container width
  const getColumnsCount = useCallback((width: number) => {
    if (width < 640) return 1; // Mobile
    if (width < 1024) return 2; // Tablet
    return 3; // Desktop
  }, []);
  
  // Calculate the total height of the virtual content
  const getTotalHeight = useCallback((items: any[], cols: number) => {
    const rows = Math.ceil(items.length / cols);
    return rows * rowHeight;
  }, [rowHeight]);
  
  // Update visible range based on scroll position
  const updateVisibleRange = useCallback(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const { scrollTop, clientHeight } = container;
    const cols = getColumnsCount(containerWidth);
    
    // Calculate visible range
    const startRow = Math.floor(scrollTop / rowHeight);
    const visibleRows = Math.ceil(clientHeight / rowHeight);
    const endRow = startRow + visibleRows + overscan;
    
    const startIndex = Math.max(0, (startRow - overscan) * cols);
    const endIndex = Math.min(screenshots.length, endRow * cols);
    
    setVisibleRange({ start: startIndex, end: endIndex });
  }, [containerWidth, getColumnsCount, overscan, rowHeight, screenshots.length]);
  
  // Handle container resize
  useEffect(() => {
    if (!containerRef.current) return;
    
    const observer = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      setContainerWidth(width);
      updateVisibleRange();
    });
    
    observer.observe(containerRef.current);
    
    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [updateVisibleRange]);
  
  // Handle scroll events
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handleScroll = () => {
      updateVisibleRange();
    };
    
    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [updateVisibleRange]);
  
  // Process thumbnails for visible items
  useEffect(() => {
    const processThumbnails = async () => {
      const visibleScreenshots = screenshots.slice(visibleRange.start, visibleRange.end);
      
      for (const screenshot of visibleScreenshots) {
        if (!getCachedThumbnail(screenshot.id) && !processingImages[screenshot.id]) {
          setProcessingImages(prev => ({ ...prev, [screenshot.id]: true }));
          
          try {
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
    };
    
    processThumbnails();
  }, [screenshots, visibleRange, processingImages]);
  
  // Handle download screenshot
  const handleDownloadScreenshot = useCallback((screenshot: Screenshot, e: React.MouseEvent) => {
    e.stopPropagation();
    
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
  const handleDeleteScreenshot = useCallback(async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onDelete) return;
    
    try {
      await apiRequest('DELETE', `/api/screenshots/${id}`);
      
      onDelete(id);
      
      toast({
        title: 'Screenshot Deleted',
        description: 'The screenshot has been permanently removed.',
      });
    } catch (err) {
      console.error('Failed to delete screenshot:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete the screenshot. Please try again.',
        variant: 'destructive',
      });
    }
  }, [onDelete, toast]);
  
  // Get columns count based on current container width
  const columns = getColumnsCount(containerWidth);
  
  // Calculate total height of virtual content
  const totalHeight = getTotalHeight(screenshots, columns);
  
  // Get visible items
  const visibleItems = screenshots.slice(visibleRange.start, visibleRange.end);
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index}>
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
    <div 
      ref={containerRef}
      className="overflow-auto"
      style={{ height: '70vh', maxHeight: '800px' }}
    >
      <div 
        style={{ 
          height: totalHeight, 
          position: 'relative',
        }}
      >
        <div 
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`}
          style={{
            position: 'absolute',
            top: Math.floor(visibleRange.start / columns) * rowHeight,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((screenshot) => {
            const thumbnailData = getCachedThumbnail(screenshot.id);
            const isProcessing = processingImages[screenshot.id];
            
            return (
              <Card 
                key={screenshot.id} 
                className="overflow-hidden group cursor-pointer"
                onClick={() => onView(screenshot)}
              >
                <div className="relative h-[200px] bg-muted">
                  {isProcessing ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                  ) : (
                    <>
                      <div 
                        className="h-full w-full bg-cover bg-center"
                        style={{ 
                          backgroundImage: `url(${thumbnailData || screenshot.imageData})` 
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex gap-2">
                          <Button 
                            size="icon" 
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              onView(screenshot);
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
                          <Button 
                            size="icon" 
                            variant="secondary"
                            onClick={(e) => handleDownloadScreenshot(screenshot, e)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          {onDelete && (
                            <Button 
                              size="icon" 
                              variant="destructive"
                              onClick={(e) => handleDeleteScreenshot(screenshot.id, e)}
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
                  <p className="text-sm font-medium truncate">
                    {screenshot.description || 'Untitled Screenshot'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(screenshot.timestamp).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}