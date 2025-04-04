import { useLocation } from "wouter";
import Sidebar from "@/components/sidebar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useWorkflow } from "@/lib/context/workflow-context";

const agentSchema = z.object({
  analyzer: z.object({
    systemPrompt: z.string().min(10, "System prompt must be at least 10 characters"),
    isActive: z.boolean(),
  }),
  writer: z.object({
    systemPrompt: z.string().min(10, "System prompt must be at least 10 characters"),
    isActive: z.boolean(),
  }),
  reviewer: z.object({
    systemPrompt: z.string().min(10, "System prompt must be at least 10 characters"),
    isActive: z.boolean(),
  }),
  orchestrator: z.object({
    systemPrompt: z.string().min(10, "System prompt must be at least 10 characters"),
    isActive: z.boolean(),
  }),
});

type AgentFormValues = z.infer<typeof agentSchema>;

export default function AgentConfig() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { currentStep, getStepStatus, completeStep, setCurrentStep } = useWorkflow();
  
  // Check if Documentation tab should be highlighted
  const isDocumentationHighlighted = 
    currentStep === 'documentation' || 
    getStepStatus('analysis-completed') === 'completed';
    
  const [previewOutput, setPreviewOutput] = useState<string>("");

  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      analyzer: {
        systemPrompt: "You are an Analyzer agent. Your role is to process LLM-generated descriptions for accuracy and completeness. Look for inconsistencies or missing information in the activity descriptions.",
        isActive: true,
      },
      writer: {
        systemPrompt: "You are a Writer agent. Your role is to create cohesive documentation from individual descriptions. Organize the information in a logical flow and maintain a consistent tone.",
        isActive: true,
      },
      reviewer: {
        systemPrompt: "You are a Reviewer agent. Your role is to check for consistency, clarity, and usefulness in the documentation. Identify areas that need improvement or clarification.",
        isActive: true,
      },
      orchestrator: {
        systemPrompt: "You are an Orchestrator agent. Your role is to manage workflow between agents. Coordinate the analysis, writing, and review process to ensure high-quality documentation.",
        isActive: true,
      },
    },
  });

  async function onSubmit(values: AgentFormValues) {
    try {
      await fetch("/api/agent-configs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      // Update workflow context to indicate agent configuration is complete
      completeStep('agent-config');
      
      // Navigate to documentation page
      setTimeout(() => {
        setLocation("/documentation");
      }, 500);

      toast({
        title: "Agent configurations saved",
        description: "Your agent configurations have been updated successfully. Ready to generate documentation!",
      });
    } catch (error) {
      toast({
        title: "Error saving configurations",
        description: "There was a problem saving your agent configurations.",
        variant: "destructive",
      });
    }
  }

  const handlePreview = () => {
    // In a real implementation, this would send the current configurations to the backend
    // and get a preview of the agent processing results
    const previewText = "Example output from CrewAI agents based on the current configuration:\n\n" +
      "1. Analyzer: Identified key activities from screenshots, verified descriptions\n" +
      "2. Writer: Created structured documentation with proper flow between activities\n" +
      "3. Reviewer: Ensured consistency and clarity in final documentation\n" +
      "4. Orchestrator: Coordinated agent workflow, handled edge cases";
    
    setPreviewOutput(previewText);
  };

  return (
    <>
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tab Navigation */}
        <div className="bg-white border-b border-neutral-200">
          <Tabs defaultValue="agent-config" className="w-full">
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
              >
                Agent Configuration
              </TabsTrigger>
              <TabsTrigger
                value="documentation"
                className={`px-4 py-3 ${
                  isDocumentationHighlighted ? 
                  "text-green-600 border-b-2 border-green-600 font-medium" : 
                  "data-[state=active]:text-primary-400 data-[state=active]:border-b-2 data-[state=active]:border-primary-400 data-[state=active]:font-medium"
                }`}
                onClick={() => setLocation("/documentation")}
              >
                Documentation
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-semibold text-neutral-700 mb-6">Configure CrewAI Agents</h1>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Analyzer Agent */}
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>Analyzer Agent</CardTitle>
                        <FormField
                          control={form.control}
                          name="analyzer.isActive"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {field.value ? "Active" : "Disabled"}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                      <CardDescription>
                        Processes LLM-generated descriptions for accuracy and completeness
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="analyzer.systemPrompt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>System Prompt</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter system prompt for Analyzer agent"
                                className="min-h-[120px]"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Define how the Analyzer agent should process screenshots
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Writer Agent */}
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>Writer Agent</CardTitle>
                        <FormField
                          control={form.control}
                          name="writer.isActive"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {field.value ? "Active" : "Disabled"}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                      <CardDescription>
                        Creates cohesive documentation from individual descriptions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="writer.systemPrompt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>System Prompt</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter system prompt for Writer agent"
                                className="min-h-[120px]"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Define how the Writer agent should create documentation
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Reviewer Agent */}
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>Reviewer Agent</CardTitle>
                        <FormField
                          control={form.control}
                          name="reviewer.isActive"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {field.value ? "Active" : "Disabled"}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                      <CardDescription>
                        Checks for consistency, clarity, and usefulness
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="reviewer.systemPrompt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>System Prompt</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter system prompt for Reviewer agent"
                                className="min-h-[120px]"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Define how the Reviewer agent should check documentation
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Orchestrator Agent */}
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>Orchestrator Agent</CardTitle>
                        <FormField
                          control={form.control}
                          name="orchestrator.isActive"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {field.value ? "Active" : "Disabled"}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                      <CardDescription>
                        Manages workflow between agents
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="orchestrator.systemPrompt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>System Prompt</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter system prompt for Orchestrator agent"
                                className="min-h-[120px]"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Define how the Orchestrator agent should coordinate workflow
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Preview Output */}
                {previewOutput && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Agent Output Preview</CardTitle>
                      <CardDescription>
                        Preview of how agents will process your screenshots
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <pre className="p-4 bg-neutral-50 rounded-md text-sm whitespace-pre-wrap">
                        {previewOutput}
                      </pre>
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-end space-x-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={handlePreview}
                  >
                    Preview Agent Output
                  </Button>
                  <Button type="submit">Save Configuration</Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
}
