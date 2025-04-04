import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeScreenshotImage, generateSuggestions, generateDocumentation } from "./openai";
import { processSessionWithCrewAI, generateDocumentationWithCrewAI } from "./crewai";
import { body, param, validationResult } from "express-validator";

export async function registerRoutes(app: Express): Promise<Server> {
  // prefix all routes with /api
  
  // Screenshots endpoints
  app.get("/api/screenshots", async (req, res) => {
    try {
      // Allow getting screenshots without a session ID
      const sessionIdParam = req.query.sessionId as string;
      
      if (sessionIdParam) {
        const sessionId = Number(sessionIdParam);
        if (isNaN(sessionId)) {
          return res.status(400).json({ message: "Invalid session ID" });
        }
        
        const screenshots = await storage.getScreenshotsBySessionId(sessionId);
        res.json(screenshots);
      } else {
        // If no session ID provided, get the latest session and return its screenshots
        const sessions = await storage.getAllSessions();
        if (sessions.length === 0) {
          return res.json([]);
        }
        
        // Sort by start time descending and get the latest session
        const latestSession = sessions.sort((a, b) => 
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        )[0];
        
        const screenshots = await storage.getScreenshotsBySessionId(latestSession.id);
        res.json(screenshots);
      }
    } catch (error) {
      console.error("Error fetching screenshots:", error);
      res.status(500).json({ message: "Failed to fetch screenshots" });
    }
  });

  app.post(
    "/api/screenshots",
    body("sessionId").isNumeric(),
    body("imageData").isString(),
    body("aiAnalysisStatus").isString(),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      try {
        const { sessionId, imageData, description, aiAnalysisStatus } = req.body;
        const screenshot = await storage.createScreenshot({
          sessionId,
          imageData,
          description,
          aiAnalysisStatus
        });
        res.status(201).json(screenshot);
      } catch (error) {
        console.error("Error creating screenshot:", error);
        res.status(500).json({ message: "Failed to create screenshot" });
      }
    }
  );

  app.patch(
    "/api/screenshots/:id",
    param("id").isNumeric(),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      try {
        // Check that params exists to satisfy TypeScript
        if (!req.params) {
          return res.status(400).json({ message: "Missing parameters" });
        }
        
        const id = Number(req.params.id);
        const screenshot = await storage.getScreenshot(id);
        
        if (!screenshot) {
          return res.status(404).json({ message: "Screenshot not found" });
        }
        
        const { description, aiAnalysisStatus } = req.body;
        const updatedScreenshot = await storage.updateScreenshot(id, { 
          description, 
          aiAnalysisStatus 
        });
        
        res.json(updatedScreenshot);
      } catch (error) {
        console.error("Error updating screenshot:", error);
        res.status(500).json({ message: "Failed to update screenshot" });
      }
    }
  );

  app.delete(
    "/api/screenshots/:id",
    param("id").isNumeric(),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      try {
        // Check that params exists to satisfy TypeScript
        if (!req.params) {
          return res.status(400).json({ message: "Missing parameters" });
        }
        
        const id = Number(req.params.id);
        await storage.deleteScreenshot(id);
        res.status(204).send();
      } catch (error) {
        console.error("Error deleting screenshot:", error);
        res.status(500).json({ message: "Failed to delete screenshot" });
      }
    }
  );

  // Sessions endpoints
  app.get("/api/sessions", async (_req, res) => {
    try {
      const sessions = await storage.getAllSessions();
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });

  app.post(
    "/api/sessions",
    body("name").optional().isString(),
    body("captureInterval").optional().isNumeric(),
    body("captureArea").optional().isString(),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      try {
        const { name, captureInterval, captureArea } = req.body;
        const session = await storage.createSession({
          name,
          captureInterval,
          captureArea
        });
        res.status(201).json(session);
      } catch (error) {
        console.error("Error creating session:", error);
        res.status(500).json({ message: "Failed to create session" });
      }
    }
  );

  // OpenAI integration endpoints
  app.post(
    "/api/analyze-screenshot",
    body("screenshotId").isNumeric(),
    body("imageData").isString(),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      try {
        const { screenshotId, imageData } = req.body;
        
        // Use OpenAI to analyze the screenshot
        const description = await analyzeScreenshotImage(imageData);
        
        // Update the screenshot in the database
        await storage.updateScreenshot(screenshotId, {
          description,
          aiAnalysisStatus: "completed"
        });
        
        res.json({ description });
      } catch (error) {
        console.error("Error analyzing screenshot:", error);
        res.status(500).json({ message: "Failed to analyze screenshot" });
      }
    }
  );

  app.post(
    "/api/description-suggestions",
    body("imageData").isString(),
    body("currentDescription").optional().isString(),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      try {
        const { imageData, currentDescription } = req.body;
        const suggestions = await generateSuggestions(imageData, currentDescription);
        res.json({ suggestions });
      } catch (error) {
        console.error("Error generating suggestions:", error);
        res.status(500).json({ message: "Failed to generate suggestions" });
      }
    }
  );

  // CrewAI integration endpoints
  app.post(
    "/api/process-session",
    body("sessionId").isNumeric(),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      try {
        const { sessionId } = req.body;
        
        // Start CrewAI processing (runs asynchronously)
        processSessionWithCrewAI(sessionId);
        
        res.json({ message: "Processing started" });
      } catch (error) {
        console.error("Error starting CrewAI processing:", error);
        res.status(500).json({ message: "Failed to start processing" });
      }
    }
  );

  app.get(
    "/api/processing-status/:sessionId",
    param("sessionId").isNumeric(),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      try {
        // Check that params exists to satisfy TypeScript
        if (!req.params) {
          return res.status(400).json({ message: "Missing parameters" });
        }
        
        const sessionId = Number(req.params.sessionId);
        
        // Get screenshots for analysis progress
        const screenshots = await storage.getScreenshotsBySessionId(sessionId);
        const analyzedCount = screenshots.filter(s => s.aiAnalysisStatus === "completed").length;
        
        // For demo purposes, we'll return simulated status data
        res.json({
          analysisProgress: {
            current: analyzedCount,
            total: screenshots.length
          },
          processingProgress: {
            status: "Processing...",
            percent: 65 // Simulated progress
          },
          documentationProgress: {
            status: "Waiting...",
            percent: 0 // Simulated progress
          }
        });
      } catch (error) {
        console.error("Error fetching processing status:", error);
        res.status(500).json({ message: "Failed to fetch processing status" });
      }
    }
  );

  // Agent configuration endpoints
  app.get("/api/agent-configs", async (_req, res) => {
    try {
      const configs = await storage.getAllAgentConfigs();
      
      // Convert to expected format
      const formattedConfigs: Record<string, any> = {};
      configs.forEach(config => {
        formattedConfigs[config.type] = {
          systemPrompt: config.systemPrompt,
          isActive: Boolean(config.isActive)
        };
      });
      
      res.json(formattedConfigs);
    } catch (error) {
      console.error("Error fetching agent configs:", error);
      res.status(500).json({ message: "Failed to fetch agent configurations" });
    }
  });

  app.post("/api/agent-configs", async (req, res) => {
    try {
      const configs = req.body;
      
      // Save each agent config
      for (const [type, config] of Object.entries(configs)) {
        const { systemPrompt, isActive } = config as { systemPrompt: string; isActive: boolean };
        
        // Check if config exists
        const existingConfig = await storage.getAgentConfigByType(type);
        
        if (existingConfig) {
          await storage.updateAgentConfig(existingConfig.id, {
            systemPrompt,
            isActive: isActive ? 1 : 0
          });
        } else {
          await storage.createAgentConfig({
            type,
            systemPrompt,
            isActive: isActive ? 1 : 0
          });
        }
      }
      
      res.json({ message: "Agent configurations updated" });
    } catch (error) {
      console.error("Error updating agent configs:", error);
      res.status(500).json({ message: "Failed to update agent configurations" });
    }
  });

  // Preview agent output
  app.post("/api/preview-agents", async (req, res) => {
    try {
      // In a real implementation, this would use the agent configs to generate a preview
      res.json({ 
        preview: "Example output from CrewAI agents based on the current configuration:\n\n" +
          "1. Analyzer: Identified key activities from screenshots, verified descriptions\n" +
          "2. Writer: Created structured documentation with proper flow between activities\n" +
          "3. Reviewer: Ensured consistency and clarity in final documentation\n" +
          "4. Orchestrator: Coordinated agent workflow, handled edge cases"
      });
    } catch (error) {
      console.error("Error generating agent preview:", error);
      res.status(500).json({ message: "Failed to generate agent preview" });
    }
  });

  // Documentation generation
  app.post(
    "/api/documentation/generate",
    body("sessionId").isNumeric(),
    body("format").isString(),
    body("detailLevel").isString(),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      try {
        const { sessionId, format, detailLevel } = req.body;
        
        // Generate documentation using CrewAI
        console.log(`Generating documentation for session ${sessionId} with CrewAI agents`);
        const content = await generateDocumentationWithCrewAI(sessionId, format, detailLevel);
        
        // Check if content is an error message
        if (content.startsWith("No screenshots found") || content.includes("have not been analyzed yet")) {
          return res.status(400).json({ message: content });
        }
        
        // Get session details for title
        const session = await storage.getSession(sessionId);
        let title = `Session #${sessionId} Documentation`;
        if (session && session.name) {
          title = `${session.name} Documentation`;
        }
        
        // Save the documentation
        const documentation = await storage.createDocumentation({
          sessionId,
          title,
          content,
          format,
          detailLevel
        });
        
        res.json({ content, documentationId: documentation.id });
      } catch (error) {
        console.error("Error generating documentation:", error);
        res.status(500).json({ message: "Failed to generate documentation" });
      }
    }
  );

  const httpServer = createServer(app);
  return httpServer;
}
