import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useScreenshotContext } from "@/lib/context/screenshot-context";

export default function Sidebar() {
  const { 
    captureInterval, 
    setCaptureInterval, 
    captureArea, 
    setCaptureArea,
    formatType,
    setFormatType,
    isRealTimeAnalysis,
    setIsRealTimeAnalysis
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
          <Label className="block text-sm text-neutral-600 mb-1">Capture Area</Label>
          <Select
            value={captureArea}
            onValueChange={setCaptureArea}
          >
            <SelectTrigger className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm">
              <SelectValue placeholder="Select area" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Full Browser Tab">Full Browser Tab</SelectItem>
              <SelectItem value="Current Window">Current Window</SelectItem>
              <SelectItem value="Full Screen">Full Screen</SelectItem>
            </SelectContent>
          </Select>
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
        
        <div className="mb-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="real-time-analysis" 
              checked={isRealTimeAnalysis}
              onCheckedChange={(checked) => setIsRealTimeAnalysis(checked as boolean)}
            />
            <Label htmlFor="real-time-analysis" className="text-sm">Real-time LLM Analysis</Label>
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
