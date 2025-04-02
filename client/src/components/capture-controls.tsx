import { useScreenshotContext } from "@/lib/context/screenshot-context";
import { Button } from "@/components/ui/button";

export default function CaptureControls() {
  const { 
    isCapturing, 
    startCapture, 
    stopCapture, 
    restartCapture,
    captureStatus,
    captureInterval,
    screenshotCount
  } = useScreenshotContext();

  return (
    <div className="bg-white p-4 border-b border-neutral-200 flex flex-wrap items-center justify-between">
      <div className="flex items-center space-x-2 mb-2 md:mb-0">
        <Button
          variant="default"
          className="inline-flex items-center"
          onClick={startCapture}
          disabled={isCapturing}
        >
          <span className="material-icons mr-1">play_arrow</span>
          Start Capture
        </Button>
        
        <Button
          variant="secondary"
          className="inline-flex items-center"
          onClick={stopCapture}
          disabled={!isCapturing}
        >
          <span className="material-icons mr-1">stop</span>
          Stop
        </Button>
        
        <Button
          variant="secondary"
          className="inline-flex items-center"
          onClick={restartCapture}
          disabled={!isCapturing}
        >
          <span className="material-icons mr-1">refresh</span>
          Restart
        </Button>
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
  );
}
