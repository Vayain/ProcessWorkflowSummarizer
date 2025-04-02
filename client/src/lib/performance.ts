/**
 * Performance optimization utilities for handling large screenshot volumes
 * 
 * This module provides functions for optimizing performance when dealing with
 * large numbers of screenshots, including:
 * - Image compression
 * - Lazy loading
 * - Virtualized lists
 * - Data pagination
 * - Screenshot data caching
 */

import { estimateBase64ImageSize } from './screenshot';

// Target sizes for different quality levels (in bytes)
const TARGET_SIZES = {
  high: 500 * 1024, // 500KB
  medium: 300 * 1024, // 300KB
  low: 150 * 1024, // 150KB
  thumbnail: 50 * 1024 // 50KB
};

// Interface for compression options
export interface CompressionOptions {
  quality?: number;       // JPEG quality (0-1)
  maxWidth?: number;      // Maximum width in pixels
  maxHeight?: number;     // Maximum height in pixels
  targetSize?: number;    // Target size in bytes
  maintainAspectRatio?: boolean; // Whether to maintain aspect ratio when resizing
}

/**
 * Aggressively compresses an image for storage and transmission
 * 
 * @param base64Image Base64 encoded image data
 * @param options Compression options
 * @returns Promise resolving to compressed base64 image data
 */
export async function compressImage(
  base64Image: string, 
  options: CompressionOptions = {}
): Promise<string> {
  // Default options
  const {
    quality = 0.7,
    maxWidth = 1280,
    maxHeight = 800,
    maintainAspectRatio = true,
    targetSize = TARGET_SIZES.medium
  } = options;
  
  return new Promise((resolve, reject) => {
    try {
      // Create an image element to load the base64 image
      const img = new Image();
      
      img.onload = () => {
        // Create a canvas for the resized image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        // Calculate dimensions based on options
        let newWidth = img.width;
        let newHeight = img.height;
        
        // Scale down if the image exceeds max dimensions
        if (newWidth > maxWidth || newHeight > maxHeight) {
          if (maintainAspectRatio) {
            const aspectRatio = img.width / img.height;
            
            if (newWidth > maxWidth) {
              newWidth = maxWidth;
              newHeight = newWidth / aspectRatio;
            }
            
            if (newHeight > maxHeight) {
              newHeight = maxHeight;
              newWidth = newHeight * aspectRatio;
            }
          } else {
            newWidth = Math.min(newWidth, maxWidth);
            newHeight = Math.min(newHeight, maxHeight);
          }
        }
        
        // Set canvas dimensions
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        // Draw image on canvas
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
        // Start with the provided quality
        let currentQuality = quality;
        let result = canvas.toDataURL('image/jpeg', currentQuality);
        let currentSize = estimateBase64ImageSize(result);
        
        // If the image is still too large, progressively reduce quality
        // until it meets the target size or reaches a minimum quality
        if (currentSize > targetSize) {
          let attempts = 0;
          const MAX_ATTEMPTS = 5;
          
          while (currentSize > targetSize && currentQuality > 0.3 && attempts < MAX_ATTEMPTS) {
            // Reduce quality by 20% each time
            currentQuality *= 0.8;
            result = canvas.toDataURL('image/jpeg', currentQuality);
            currentSize = estimateBase64ImageSize(result);
            attempts++;
          }
        }
        
        resolve(result);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image for compression'));
      };
      
      img.src = base64Image;
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Creates a thumbnail version of an image
 * 
 * @param base64Image Base64 encoded image data
 * @param maxDimension Maximum width or height
 * @returns Promise resolving to thumbnail as base64 data
 */
export async function createThumbnail(
  base64Image: string,
  maxDimension: number = 200
): Promise<string> {
  return compressImage(base64Image, {
    maxWidth: maxDimension,
    maxHeight: maxDimension,
    quality: 0.6,
    targetSize: TARGET_SIZES.thumbnail || 50 * 1024, // Provide default value
    maintainAspectRatio: true
  });
}

/**
 * Checks if the browser supports IndexedDB for local storage
 * @returns Boolean indicating if IndexedDB is supported
 */
export function isIndexedDBSupported(): boolean {
  return 'indexedDB' in window;
}

// Memory cache for screenshots - use a Map to maintain insertion order
const MEMORY_CACHE = new Map<number, string>();
const THUMBNAIL_CACHE = new Map<number, string>();
const MAX_CACHE_ITEMS = 30; // Maximum number of full images to cache in memory

/**
 * Caches a screenshot image in memory for faster retrieval
 * 
 * @param id Screenshot ID
 * @param imageData Base64 image data
 * @param thumbnailData Optional thumbnail data
 */
export function cacheScreenshot(
  id: number, 
  imageData: string,
  thumbnailData?: string
): void {
  // If the cache is full, remove the oldest item (first in the Map)
  if (MEMORY_CACHE.size >= MAX_CACHE_ITEMS) {
    // Get the first key safely using Array.from
    const keys = Array.from(MEMORY_CACHE.keys());
    if (keys.length > 0) {
      const oldestKey = keys[0];
      MEMORY_CACHE.delete(oldestKey);
    }
  }
  
  // Add the new screenshot to the cache
  MEMORY_CACHE.set(id, imageData);
  
  // Cache thumbnail if provided
  if (thumbnailData) {
    THUMBNAIL_CACHE.set(id, thumbnailData);
  }
}

/**
 * Retrieves a screenshot from the cache
 * 
 * @param id Screenshot ID
 * @returns Cached image data or undefined if not in cache
 */
export function getCachedScreenshot(id: number): string | undefined {
  return MEMORY_CACHE.get(id);
}

/**
 * Retrieves a thumbnail from the cache
 * 
 * @param id Screenshot ID
 * @returns Cached thumbnail data or undefined if not in cache
 */
export function getCachedThumbnail(id: number): string | undefined {
  return THUMBNAIL_CACHE.get(id);
}

/**
 * Clears the screenshot cache
 */
export function clearScreenshotCache(): void {
  MEMORY_CACHE.clear();
  THUMBNAIL_CACHE.clear();
}

/**
 * Removes a specific screenshot from the cache
 * 
 * @param id Screenshot ID
 */
export function removeFromCache(id: number): void {
  MEMORY_CACHE.delete(id);
  THUMBNAIL_CACHE.delete(id);
}

/**
 * Handles garbage collection to free up memory
 * Called periodically or when memory pressure is detected
 */
export function garbageCollect(): void {
  // Clear half of the cache when called, keeping the most recent items
  const itemsToRemove = Math.floor(MEMORY_CACHE.size / 2);
  if (itemsToRemove <= 0) return;
  
  // Remove the oldest items (first in the Map)
  let count = 0;
  // Convert keys to array for safer iteration
  const keys = Array.from(MEMORY_CACHE.keys());
  for (const key of keys) {
    if (count >= itemsToRemove) break;
    MEMORY_CACHE.delete(key);
    count++;
  }
  
  console.log(`Performance optimization: Garbage collected ${count} items from screenshot cache`);
}

// Export target sizes for use in other components
export { TARGET_SIZES };