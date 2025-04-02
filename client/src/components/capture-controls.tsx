import { useScreenshotContext } from "@/lib/context/screenshot-context";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function CaptureControls() {
  const { 
    isCapturing, 
    startCapture, 
    stopCapture,
    captureStatus,
    captureInterval,
    setCaptureInterval,
    captureArea,
    setCaptureArea,
    screenshotCount,
    isPreviewActive
  } = useScreenshotContext();

  const [showSettings, setShowSettings] = useState(false);
  const { toast } = useToast();
  
  // Show informational message when user switches to Full Screen mode
  useEffect(() => {
    if (captureArea === "Full Screen") {
      toast({
        title: "Full Screen Capture Mode Selected",
        description: "This will show a live preview. Click 'Start Capture' when you're ready to begin capturing screenshots.",
        duration: 6000,
      });
    }
  }, [captureArea, toast]);

  return (
    <div className="bg-white p-4 border-b border-neutral-200">
      {/* Full screen capture warning banner - only shown during active full screen capture */}
      {isCapturing && captureArea === "Full Screen" && (
        <div className="w-full bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 fixed top-0 left-0 right-0 z-50">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold">Screen Capture Active</p>
              <p>Your screen is being captured. Click the "Stop" button to end the session.</p>
            </div>
            <Button
              variant="destructive"
              className="inline-flex items-center"
              onClick={stopCapture}
            >
              <span className="material-icons mr-1">stop</span>
              Stop
            </Button>
          </div>
        </div>
      )}
      
      <div className="flex flex-wrap items-center justify-between mb-4">
        <div className="flex items-center space-x-2 mb-2 md:mb-0">
          <Button
            variant="default"
            className="inline-flex items-center"
            onClick={startCapture}
            disabled={isCapturing || !isPreviewActive}
          >
            <span className="material-icons mr-1">photo_camera</span>
            Start Capture
          </Button>
          
          <Button
            variant={isCapturing ? "destructive" : "secondary"}
            className="inline-flex items-center"
            onClick={stopCapture}
            disabled={!isCapturing}
          >
            <span className="material-icons mr-1">stop</span>
            Stop
          </Button>

          <Popover open={showSettings} onOpenChange={setShowSettings}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="inline-flex items-center"
              >
                <span className="material-icons mr-1">settings</span>
                Settings
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Capture Settings</h4>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Capture Area</label>
                  <Select
                    value={captureArea}
                    onValueChange={(value) => {
                      // When selecting Full Screen mode, show an info popup
                      if (value === "Full Screen" && captureArea !== "Full Screen") {
                        // Close settings popover first
                        setShowSettings(false);
                        
                        // Update capture area
                        setCaptureArea(value);
                        
                        // If currently capturing, stop it first
                        if (isCapturing) {
                          stopCapture();
                        }
                      } else {
                        // For other capture types, just update the setting
                        setCaptureArea(value);
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select capture area" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full Browser Tab">Full Browser Tab</SelectItem>
                      <SelectItem value="Current Window">Current Window</SelectItem>
                      <SelectItem value="Full Screen">Full Screen</SelectItem>
                      <SelectItem value="Selected Element">Selected Element</SelectItem>
                    </SelectContent>
                  </Select>
                  {captureArea === "Full Screen" && (
                    <div className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                      <p>Screen capture will request browser permission to access your screen. You'll be able to select which tab, window, or your entire screen to capture.</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">Capture Interval</label>
                    <span className="text-sm text-neutral-600">{captureInterval} seconds</span>
                  </div>
                  <Slider 
                    min={1}
                    max={30}
                    step={1}
                    value={[captureInterval]}
                    onValueChange={(value) => setCaptureInterval(value[0])}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="flex items-center">
          <div className="mr-4 text-sm">
            <span className="font-medium text-neutral-700">Status:</span>
            <span className="text-secondary-400 font-medium ml-1">{captureStatus}</span>
          </div>
          
          <div className="hidden md:flex items-center">
            <div className="mr-4 text-sm">
              <span className="font-medium text-neutral-700">Interval:</span>
              <span className="text-neutral-600 ml-1">{captureInterval}s</span>
            </div>
            
            <div className="text-sm">
              <span className="font-medium text-neutral-700">Screenshots:</span>
              <span className="text-neutral-600 ml-1">{screenshotCount}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center text-sm text-neutral-600">
        <span className="material-icons mr-1 text-neutral-400" style={{ fontSize: "16px" }}>info</span>
        <span>Currently capturing: <span className="font-medium">{captureArea}</span></span>
        {isPreviewActive && !isCapturing && (
          <span className="ml-2 text-green-600 font-medium flex items-center">
            <span className="material-icons mr-1 text-green-500" style={{ fontSize: "16px" }}>preview</span>
            Preview active - press "Start Capture" to begin
          </span>
        )}
      </div>
    </div>
  );
}
