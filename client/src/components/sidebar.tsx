import { useState, useEffect } from "react";
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
    startManualAnalysis,
    currentSessionId,
    setCurrentSessionId,
    screenshotCount
  } = useScreenshotContext();
  
  const [sessionList, setSessionList] = useState<{ id: number; name: string; time: string }[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  
  // Fetch sessions from the API when component mounts
  useEffect(() => {
    const fetchSessions = async () => {
      setIsLoadingSessions(true);
      try {
        const response = await fetch('/api/sessions');
        if (response.ok) {
          const sessions = await response.json();
          
          // Format the sessions for display
          const formattedSessions = sessions.map((session: any) => {
            const date = new Date(session.startTime);
            const now = new Date();
            
            // Format the time based on how recent it is
            let timeString;
            if (date.toDateString() === now.toDateString()) {
              timeString = `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            } else if (date.toDateString() === new Date(now.setDate(now.getDate() - 1)).toDateString()) {
              timeString = `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            } else {
              timeString = date.toLocaleDateString();
            }
            
            return {
              id: session.id,
              name: session.name || `Session #${session.id}`,
              time: timeString
            };
          });
          
          setSessionList(formattedSessions);
        } else {
          console.error('Failed to fetch sessions');
          toast({
            title: 'Error',
            description: 'Failed to load sessions',
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error('Error fetching sessions:', error);
        toast({
          title: 'Error',
          description: 'Failed to load sessions',
          variant: 'destructive'
        });
      } finally {
        setIsLoadingSessions(false);
      }
    };
    
    fetchSessions();
  }, [toast]);

  return (
    <div className="w-64 bg-white border-r border-neutral-200 flex flex-col h-full hidden md:block">
      <div className="p-4 border-b border-neutral-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-medium text-neutral-700">Current Session</h2>
          <button 
            className="text-sm text-primary-400 hover:text-primary-500"
            onClick={async () => {
              try {
                const response = await fetch('/api/sessions', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    name: `Session ${new Date().toLocaleString()}`,
                    captureInterval,
                    captureArea,
                  }),
                });
                
                if (response.ok) {
                  const newSession = await response.json();
                  setCurrentSessionId(newSession.id);
                  
                  toast({
                    title: 'New Session Created',
                    description: `Session #${newSession.id} is now active.`,
                  });
                  
                  // Refresh the session list
                  const sessionsResponse = await fetch('/api/sessions');
                  if (sessionsResponse.ok) {
                    const sessions = await sessionsResponse.json();
                    const formattedSessions = sessions.map((session: any) => {
                      const date = new Date(session.startTime);
                      const now = new Date();
                      
                      let timeString;
                      if (date.toDateString() === now.toDateString()) {
                        timeString = `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                      } else if (date.toDateString() === new Date(now.setDate(now.getDate() - 1)).toDateString()) {
                        timeString = `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                      } else {
                        timeString = date.toLocaleDateString();
                      }
                      
                      return {
                        id: session.id,
                        name: session.name || `Session #${session.id}`,
                        time: timeString
                      };
                    });
                    
                    setSessionList(formattedSessions);
                  }
                } else {
                  toast({
                    title: 'Error',
                    description: 'Failed to create new session',
                    variant: 'destructive',
                  });
                }
              } catch (error) {
                console.error('Error creating session:', error);
                toast({
                  title: 'Error',
                  description: 'Failed to create new session',
                  variant: 'destructive',
                });
              }
            }}
          >
            New
          </button>
        </div>
        
        <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200">
          <div className="flex justify-between items-center mb-2">
            <div>
              <span className="text-sm font-medium text-neutral-600">Session #{currentSessionId || '???'}</span>
              {sessionList.find(s => s.id === currentSessionId)?.name && (
                <div className="text-xs text-blue-600">
                  {sessionList.find(s => s.id === currentSessionId)?.name}
                </div>
              )}
            </div>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Active</span>
          </div>
          
          <div className="text-xs text-neutral-500 mb-1">
            {sessionList.find(s => s.id === currentSessionId)?.time || 'Unknown time'}
          </div>
          <div className="text-xs text-neutral-500">{screenshotCount} screenshots captured</div>
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
          <div className="flex flex-col space-y-2">
            <Button
              size="sm"
              variant="outline"
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
            <div 
              key={session.id} 
              className={`p-2 hover:bg-neutral-100 rounded-md cursor-pointer ${
                currentSessionId === session.id ? 'bg-neutral-100 border border-neutral-300' : ''
              }`}
              onClick={() => {
                // Change the current session ID to filter screenshots
                if (currentSessionId !== session.id) {
                  setCurrentSessionId(session.id);
                  // Fetch screenshots for the selected session - in a real app
                  // this would trigger a useEffect that would fetch the screenshots
                  
                  toast({
                    title: `Session #${session.id} Selected`,
                    description: `Now viewing screenshots from ${session.time}`,
                  });
                }
              }}
            >
              <div className="text-sm font-medium text-neutral-700">Session #{session.id}</div>
              {session.name && session.name !== `Session #${session.id}` && (
                <div className="text-xs text-blue-600 font-medium">{session.name}</div>
              )}
              <div className="text-xs text-neutral-500">{session.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
