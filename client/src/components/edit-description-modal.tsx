import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useScreenshotContext } from "@/lib/context/screenshot-context";
import { useToast } from "@/hooks/use-toast";

interface EditDescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  screenshotId: number | null;
}

export default function EditDescriptionModal({
  isOpen,
  onClose,
  screenshotId,
}: EditDescriptionModalProps) {
  const { toast } = useToast();
  const { screenshots, updateScreenshotDescription } = useScreenshotContext();
  const [description, setDescription] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [screenshot, setScreenshot] = useState<any>(null);

  useEffect(() => {
    if (screenshotId && isOpen) {
      const currentScreenshot = screenshots.find((s) => s.id === screenshotId);
      if (currentScreenshot) {
        setScreenshot(currentScreenshot);
        setDescription(currentScreenshot.description || "");
        
        // In a real implementation, this would fetch AI suggestions from the backend
        setSuggestions([
          "The user is viewing a comprehensive analytics dashboard featuring multiple data visualization charts that show website traffic metrics over time.",
          "A project dashboard is displayed showing performance analytics with graphs tracking visitor metrics. The central chart indicates traffic trends with color-coded data points."
        ]);
      }
    }
  }, [screenshotId, isOpen, screenshots]);

  const handleSave = async () => {
    if (screenshotId) {
      try {
        await updateScreenshotDescription(screenshotId, description);
        toast({
          title: "Description updated",
          description: "The screenshot description has been updated successfully.",
        });
        onClose();
      } catch (error) {
        toast({
          title: "Error updating description",
          description: "There was a problem updating the screenshot description.",
          variant: "destructive",
        });
      }
    }
  };

  const applySuggestion = (suggestionText: string) => {
    setDescription(suggestionText);
  };

  if (!screenshot) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl w-full max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Screenshot Description</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto p-4">
          <div className="mb-4">
            <div className="aspect-video bg-neutral-100 mb-4 rounded-lg overflow-hidden">
              <img 
                src={screenshot.imageData} 
                alt="Screenshot being edited" 
                className="w-full h-full object-contain"
              />
            </div>
            
            <div className="mb-4">
              <Label className="block text-sm font-medium text-neutral-700 mb-1">Timestamp</Label>
              <div className="text-sm text-neutral-600 p-2 bg-neutral-50 border border-neutral-200 rounded-md">
                {format(new Date(screenshot.timestamp), 'PPP - h:mm:ss a')}
              </div>
            </div>
            
            <div>
              <Label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1">Description</Label>
              <Textarea
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-neutral-300 rounded-md py-2 px-3 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                placeholder="Enter screenshot description"
              />
            </div>
          </div>
          
          <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200 mb-4">
            <h4 className="text-sm font-medium text-neutral-700 mb-2">AI Suggestions</h4>
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <div 
                  key={index}
                  className="text-xs text-neutral-600 p-2 bg-white rounded border border-neutral-200 cursor-pointer hover:border-primary-200 hover:bg-primary-50"
                  onClick={() => applySuggestion(suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
