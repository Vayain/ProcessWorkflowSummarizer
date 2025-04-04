import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Sidebar from "@/components/sidebar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function Documentation() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [format, setFormat] = useState("markdown");
  const [detailLevel, setDetailLevel] = useState(2);
  const [isGenerating, setIsGenerating] = useState(false);
  const [documentationContent, setDocumentationContent] = useState("");
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  
  // Fetch sessions when component mounts
  useEffect(() => {
    async function fetchSessions() {
      setIsLoadingSessions(true);
      try {
        const response = await fetch('/api/sessions');
        if (!response.ok) {
          throw new Error('Failed to fetch sessions');
        }
        const data = await response.json();
        setSessions(data);
        
        // Set current session to the most recent one
        if (data.length > 0) {
          // Sort by start time descending and get the latest session
          const latestSession = [...data].sort((a, b) => 
            new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
          )[0];
          
          setCurrentSessionId(latestSession.id);
        }
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setIsLoadingSessions(false);
      }
    }
    
    fetchSessions();
  }, []);
  
  const handleGenerate = async () => {
    if (!currentSessionId) {
      toast({
        title: "No session selected",
        description: "Please create a session first before generating documentation.",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const response = await fetch("/api/documentation/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: currentSessionId,
          format,
          detailLevel: ["minimal", "standard", "detailed"][detailLevel - 1],
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to generate documentation");
      }
      
      setDocumentationContent(data.content);
      
      toast({
        title: "Documentation generated",
        description: "Your documentation has been generated successfully using CrewAI agents.",
      });
    } catch (error) {
      console.error("Error generating documentation:", error);
      toast({
        title: "Error generating documentation",
        description: error instanceof Error ? error.message : "There was a problem generating your documentation.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleDownload = () => {
    // This would handle downloading the documentation in the selected format
    const element = document.createElement("a");
    const file = new Blob([documentationContent], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `documentation.${format === "markdown" ? "md" : format.toLowerCase()}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "Documentation downloaded",
      description: `Your documentation has been downloaded in ${format.toUpperCase()} format.`,
    });
  };
  
  return (
    <>
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tab Navigation */}
        <div className="bg-white border-b border-neutral-200">
          <Tabs defaultValue="documentation" className="w-full">
            <TabsList className="flex">
              <TabsTrigger
                value="capture"
                className="px-4 py-3 data-[state=active]:text-primary-400 data-[state=active]:border-b-2 data-[state=active]:border-primary-400 data-[state=active]:font-medium"
                onClick={() => setLocation("/")}
              >
                Screen Capture
              </TabsTrigger>
              <TabsTrigger
                value="agent-config"
                className="px-4 py-3 data-[state=active]:text-primary-400 data-[state=active]:border-b-2 data-[state=active]:border-primary-400 data-[state=active]:font-medium"
                onClick={() => setLocation("/agent-config")}
              >
                Agent Configuration
              </TabsTrigger>
              <TabsTrigger
                value="documentation"
                className="px-4 py-3 data-[state=active]:text-primary-400 data-[state=active]:border-b-2 data-[state=active]:border-primary-400 data-[state=active]:font-medium"
              >
                Documentation
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-semibold text-neutral-700 mb-2">Generate Documentation</h1>
            {currentSessionId && sessions.length > 0 && (
              <p className="text-neutral-500 mb-6">
                Current session: {sessions.find(s => s.id === currentSessionId)?.name || `Session #${currentSessionId}`}
              </p>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Format Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Output Format</CardTitle>
                  <CardDescription>
                    Choose the format for your documentation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Select
                    value={format}
                    onValueChange={setFormat}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="markdown">Markdown</SelectItem>
                      <SelectItem value="HTML">HTML</SelectItem>
                      <SelectItem value="PDF">PDF</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
              
              {/* Detail Level */}
              <Card>
                <CardHeader>
                  <CardTitle>Detail Level</CardTitle>
                  <CardDescription>
                    Set the amount of detail to include
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Slider
                      value={[detailLevel]}
                      min={1}
                      max={3}
                      step={1}
                      onValueChange={(value) => setDetailLevel(value[0])}
                    />
                    <div className="flex justify-between text-xs text-neutral-500">
                      <span>Minimal</span>
                      <span>Standard</span>
                      <span>Detailed</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                  <CardDescription>
                    Generate and download documentation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button 
                      className="w-full"
                      onClick={handleGenerate}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating with CrewAI...
                        </>
                      ) : "Generate Documentation"}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleDownload}
                      disabled={!documentationContent}
                    >
                      Download Documentation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Documentation Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Documentation Preview</CardTitle>
                <CardDescription>
                  Preview of your generated documentation
                </CardDescription>
              </CardHeader>
              <CardContent>
                {documentationContent ? (
                  <div className="p-4 bg-neutral-50 rounded-md border border-neutral-200 min-h-[300px] max-h-[600px] overflow-auto whitespace-pre-wrap font-mono text-sm">
                    {documentationContent}
                  </div>
                ) : (
                  <div className="p-4 bg-neutral-50 rounded-md border border-neutral-200 min-h-[300px] flex items-center justify-center">
                    <p className="text-neutral-400">No documentation generated yet. Click "Generate Documentation" to create documentation.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
