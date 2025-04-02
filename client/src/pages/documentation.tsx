import { useState } from "react";
import { useLocation } from "wouter";
import Sidebar from "@/components/sidebar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";

export default function Documentation() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [format, setFormat] = useState("markdown");
  const [detailLevel, setDetailLevel] = useState(2);
  const [isGenerating, setIsGenerating] = useState(false);
  const [documentationContent, setDocumentationContent] = useState("");
  
  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      // In a real implementation, this would call the backend to generate documentation
      const response = await fetch("/api/documentation/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: 248, // Current session
          format,
          detailLevel: ["minimal", "standard", "detailed"][detailLevel - 1],
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to generate documentation");
      }
      
      const data = await response.json();
      setDocumentationContent(data.content);
      
      toast({
        title: "Documentation generated",
        description: "Your documentation has been generated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error generating documentation",
        description: "There was a problem generating your documentation.",
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
                Capture & Review
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
            <h1 className="text-2xl font-semibold text-neutral-700 mb-6">Generate Documentation</h1>
            
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
                      {isGenerating ? "Generating..." : "Generate Documentation"}
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
