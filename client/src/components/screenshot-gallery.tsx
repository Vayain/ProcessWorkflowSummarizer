import { useScreenshotContext } from "@/lib/context/screenshot-context";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ScreenshotGalleryProps {
  onEdit: (screenshotId: number) => void;
}

export default function ScreenshotGallery({ onEdit }: ScreenshotGalleryProps) {
  const { screenshots, sortOrder, setSortOrder, deleteScreenshot } = useScreenshotContext();

  return (
    <div className="w-full lg:w-2/5 border-t lg:border-t-0 lg:border-l border-neutral-200 bg-neutral-50 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-neutral-200 bg-white flex justify-between items-center">
        <h2 className="text-lg font-medium text-neutral-700">Screenshot Gallery</h2>
        
        <div className="flex items-center space-x-2">
          <button className="p-1.5 rounded-md hover:bg-neutral-100">
            <span className="material-icons text-neutral-600" style={{ fontSize: "20px" }}>filter_list</span>
          </button>
          
          <button className="p-1.5 rounded-md hover:bg-neutral-100">
            <span className="material-icons text-neutral-600" style={{ fontSize: "20px" }}>search</span>
          </button>
          
          <Select 
            value={sortOrder} 
            onValueChange={setSortOrder}
          >
            <SelectTrigger className="text-sm border border-neutral-300 rounded-md py-1 px-2 h-auto">
              <SelectValue placeholder="Sort order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="space-y-4">
          {screenshots.length === 0 ? (
            <div className="text-center p-6">
              <p className="text-neutral-400">No screenshots captured yet.</p>
            </div>
          ) : (
            screenshots.map((screenshot) => (
              <div key={screenshot.id} className="screenshot-card bg-white rounded-lg border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md">
                <div className="aspect-video bg-neutral-100 overflow-hidden">
                  <img 
                    src={screenshot.imageData} 
                    alt={`Screenshot from ${format(new Date(screenshot.timestamp), 'h:mm a')}`} 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-neutral-700">
                      {format(new Date(screenshot.timestamp), 'h:mm a')}
                    </span>
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
                  
                  <p className="text-xs text-neutral-600 line-clamp-2">
                    {screenshot.description || "No description available yet."}
                  </p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <Button 
                      variant="link" 
                      className="text-xs text-primary-400 hover:text-primary-500 p-0 h-auto"
                      onClick={() => onEdit(screenshot.id)}
                    >
                      Edit Description
                    </Button>
                    
                    <div className="flex space-x-1">
                      <button className="p-1 rounded-md hover:bg-neutral-100">
                        <span className="material-icons text-neutral-500" style={{ fontSize: "16px" }}>visibility</span>
                      </button>
                      <button 
                        className="p-1 rounded-md hover:bg-neutral-100"
                        onClick={() => deleteScreenshot(screenshot.id)}
                      >
                        <span className="material-icons text-neutral-500" style={{ fontSize: "16px" }}>delete_outline</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
