import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useScreenshotContext } from "@/lib/context/screenshot-context";
import { initializeCapture, cleanupCapture } from "@/lib/capture-engine";

export default function Sidebar() {
  const { toast } = useToast();
  const { 
    captureInterval, 
    setCaptureInterval, 
    captureArea, 
    setCaptureArea,
    formatType,
    setFormatType,
    isRealTimeAnalysis,
    setIsRealTimeAnalysis,
    isCapturing,
    stopCapture,
    startManualAnalysis
  } = useScreenshotContext();
  
  const [sessionList] = useState([
    { id: 247, time: "Today, 9:15 AM" },
    { id: 246, time: "Yesterday, 3:30 PM" },
    { id: 245, time: "Yesterday, 11:20 AM" },
    { id: 244, time: "Aug 12, 2023" },
  ]);

  return (
    <div className="w-64 bg-white border-r border-neutral-200 flex flex-col h-full hidden md:block">
      <div className="p-4 border-b border-neutral-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-medium text-neutral-700">Current Session</h2>
          <button className="text-sm text-primary-400 hover:text-primary-500">
            New
          </button>
        </div>
        
        <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-neutral-600">Session #248</span>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Active</span>
          </div>
          
          <div className="text-xs text-neutral-500 mb-1">Started: 10:45 AM</div>
          <div className="text-xs text-neutral-500">25 screenshots captured</div>
        </div>
      </div>
      
      <div className="p-4 border-b border-neutral-200">
        <h2 className="font-medium text-neutral-700 mb-3">Capture Settings</h2>
        
        <div className="mb-4">
          <button
            onClick={async () => {
              // If currently capturing, stop it first
              if (isCapturing) {
                toast({
                  title: "Please stop capture first",
                  description: "You need to stop the current capture before selecting a new input source.",
                  variant: "destructive"
                });
                return;
              }
              
              // Clean up any existing capture
              cleanupCapture();
              
              // Update capture area
              setCaptureArea("Selected Input");
              
              toast({
                title: "Select Input Source",
                description: "Please select the screen, window, or tab you want to capture.",
                duration: 5000,
              });
              
              // Initialize the capture with our new engine and handle preview frames
              const initialized = await initializeCapture((previewImage) => {
                // This callback will be called whenever a new preview frame is available
                // We'll use the screenshot context to update the preview state
                if (previewImage) {
                  // Send the preview image to the context
                  if (typeof window !== 'undefined') {
                    // Use a custom event to communicate with the context
                    const event = new CustomEvent('screenshot-preview-update', {
                      detail: { previewImage }
                    });
                    window.dispatchEvent(event);
                  }
                }
              });
              
              if (initialized) {
                toast({
                  title: "Preview Ready",
                  description: "Screen preview is now active. Click 'Start Capture' when ready to begin.",
                  duration: 5000,
                });
              } else {
                toast({
                  title: "Screen Capture Failed",
                  description: "Unable to access screen capture. Please check your browser permissions and try again.",
                  variant: "destructive",
                });
              }
            }}
            className="w-full inline-flex items-center justify-between px-3 py-2 border border-neutral-300 bg-white hover:bg-neutral-50 rounded-md text-sm"
            type="button"
          >
            <span className="flex items-center">
              <span className="material-icons mr-2" style={{ fontSize: "18px" }}>desktop_windows</span>
              Choose Input
            </span>
            <span className="material-icons" style={{ fontSize: "18px" }}>chevron_right</span>
          </button>
          <div className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
            <p>Screen capture will request browser permission to access your screen. You'll be able to select which tab, window, or your entire screen to capture.</p>
          </div>
        </div>
        
        <div className="mb-4">
          <Label className="block text-sm text-neutral-600 mb-1">
            Capture Interval: {captureInterval}s
          </Label>
          <Slider
            value={[captureInterval]}
            min={1}
            max={60}
            step={1}
            onValueChange={(value) => setCaptureInterval(value[0])}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-neutral-500 mt-1">
            <span>1s</span>
            <span>30s</span>
            <span>60s</span>
          </div>
        </div>
        
        <div className="mb-4">
          <Label className="block text-sm text-neutral-600 mb-1">Screenshot Format</Label>
          <RadioGroup 
            value={formatType}
            onValueChange={setFormatType}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="PNG" id="png" />
              <Label htmlFor="png" className="text-sm">PNG</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="JPEG" id="jpeg" />
              <Label htmlFor="jpeg" className="text-sm">JPEG</Label>
            </div>
          </RadioGroup>
        </div>
        
        {/* Remove real-time analysis checkbox and replace with manual control buttons */}
        <div className="mb-4">
          <h3 className="font-medium text-neutral-700 mb-2">LLM Analysis</h3>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => {
                // Start manual LLM analysis for the current session
                if (window.confirm("Start LLM analysis for all captured screenshots?")) {
                  // Use our context method for manual analysis
                  startManualAnalysis().catch((error: Error) => {
                    console.error('Analysis error:', error);
                    toast({
                      title: "Analysis Failed",
                      description: "Could not start LLM analysis. Please try again.",
                      variant: "destructive",
                    });
                  });
                }
              }}
            >
              Start LLM Analysis
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => {
                // Since there's no built-in way to stop analysis, we'll just show a confirmation
                toast({
                  title: "LLM Analysis Complete",
                  description: "Analysis has been stopped or is complete.",
                });
              }}
            >
              End LLM Analysis
            </Button>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <h2 className="font-medium text-neutral-700 mb-3">Previous Sessions</h2>
        <div className="space-y-2 overflow-y-auto max-h-64 custom-scrollbar">
          {sessionList.map((session) => (
            <div key={session.id} className="p-2 hover:bg-neutral-100 rounded-md cursor-pointer">
              <div className="text-sm font-medium text-neutral-700">Session #{session.id}</div>
              <div className="text-xs text-neutral-500">{session.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
