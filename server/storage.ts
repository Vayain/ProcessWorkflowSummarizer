import { 
  users, 
  sessions,
  screenshots,
  agentConfigs,
  documentations,
  type User, 
  type InsertUser,
  type Session,
  type InsertSession,
  type Screenshot,
  type InsertScreenshot,
  type AgentConfig,
  type InsertAgentConfig,
  type Documentation,
  type InsertDocumentation
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Session methods
  getSession(id: number): Promise<Session | undefined>;
  getAllSessions(): Promise<Session[]>;
  createSession(session: InsertSession): Promise<Session>;
  updateSession(id: number, data: Partial<Session>): Promise<Session>;
  
  // Screenshot methods
  getScreenshot(id: number): Promise<Screenshot | undefined>;
  getScreenshotsBySessionId(sessionId: number): Promise<Screenshot[]>;
  createScreenshot(screenshot: InsertScreenshot): Promise<Screenshot>;
  updateScreenshot(id: number, data: Partial<Screenshot>): Promise<Screenshot>;
  deleteScreenshot(id: number): Promise<void>;
  
  // Agent config methods
  getAgentConfig(id: number): Promise<AgentConfig | undefined>;
  getAgentConfigByType(type: string): Promise<AgentConfig | undefined>;
  getAllAgentConfigs(): Promise<AgentConfig[]>;
  createAgentConfig(config: InsertAgentConfig): Promise<AgentConfig>;
  updateAgentConfig(id: number, data: Partial<AgentConfig>): Promise<AgentConfig>;
  
  // Documentation methods
  getDocumentation(id: number): Promise<Documentation | undefined>;
  getDocumentationsBySessionId(sessionId: number): Promise<Documentation[]>;
  createDocumentation(doc: InsertDocumentation): Promise<Documentation>;
  updateDocumentation(id: number, data: Partial<Documentation>): Promise<Documentation>;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Session methods
  async getSession(id: number): Promise<Session | undefined> {
    const [session] = await db.select().from(sessions).where(eq(sessions.id, id));
    return session || undefined;
  }
  
  async getAllSessions(): Promise<Session[]> {
    return await db.select().from(sessions).orderBy(desc(sessions.startTime));
  }
  
  async createSession(insertSession: InsertSession): Promise<Session> {
    const session = {
      ...insertSession,
      startTime: new Date().toISOString(),
      status: "active"
    };
    
    const [createdSession] = await db.insert(sessions).values(session).returning();
    return createdSession;
  }
  
  async updateSession(id: number, data: Partial<Session>): Promise<Session> {
    const [updatedSession] = await db
      .update(sessions)
      .set(data)
      .where(eq(sessions.id, id))
      .returning();
    
    if (!updatedSession) {
      throw new Error(`Session with ID ${id} not found`);
    }
    
    return updatedSession;
  }
  
  // Screenshot methods
  async getScreenshot(id: number): Promise<Screenshot | undefined> {
    const [screenshot] = await db.select().from(screenshots).where(eq(screenshots.id, id));
    return screenshot || undefined;
  }
  
  async getScreenshotsBySessionId(sessionId: number): Promise<Screenshot[]> {
    return await db
      .select()
      .from(screenshots)
      .where(eq(screenshots.sessionId, sessionId))
      .orderBy(desc(screenshots.timestamp));
  }
  
  async createScreenshot(insertScreenshot: InsertScreenshot): Promise<Screenshot> {
    const screenshot = {
      ...insertScreenshot,
      timestamp: new Date().toISOString()
    };
    
    const [createdScreenshot] = await db.insert(screenshots).values(screenshot).returning();
    return createdScreenshot;
  }
  
  async updateScreenshot(id: number, data: Partial<Screenshot>): Promise<Screenshot> {
    const [updatedScreenshot] = await db
      .update(screenshots)
      .set(data)
      .where(eq(screenshots.id, id))
      .returning();
    
    if (!updatedScreenshot) {
      throw new Error(`Screenshot with ID ${id} not found`);
    }
    
    return updatedScreenshot;
  }
  
  async deleteScreenshot(id: number): Promise<void> {
    const result = await db
      .delete(screenshots)
      .where(eq(screenshots.id, id))
      .returning({ deletedId: screenshots.id });
    
    if (result.length === 0) {
      throw new Error(`Screenshot with ID ${id} not found`);
    }
  }
  
  // Agent config methods
  async getAgentConfig(id: number): Promise<AgentConfig | undefined> {
    const [config] = await db.select().from(agentConfigs).where(eq(agentConfigs.id, id));
    return config || undefined;
  }
  
  async getAgentConfigByType(type: string): Promise<AgentConfig | undefined> {
    const [config] = await db.select().from(agentConfigs).where(eq(agentConfigs.type, type));
    return config || undefined;
  }
  
  async getAllAgentConfigs(): Promise<AgentConfig[]> {
    return await db.select().from(agentConfigs);
  }
  
  async createAgentConfig(insertConfig: InsertAgentConfig): Promise<AgentConfig> {
    const [config] = await db.insert(agentConfigs).values(insertConfig).returning();
    return config;
  }
  
  async updateAgentConfig(id: number, data: Partial<AgentConfig>): Promise<AgentConfig> {
    const [updatedConfig] = await db
      .update(agentConfigs)
      .set(data)
      .where(eq(agentConfigs.id, id))
      .returning();
    
    if (!updatedConfig) {
      throw new Error(`Agent config with ID ${id} not found`);
    }
    
    return updatedConfig;
  }
  
  // Documentation methods
  async getDocumentation(id: number): Promise<Documentation | undefined> {
    const [doc] = await db.select().from(documentations).where(eq(documentations.id, id));
    return doc || undefined;
  }
  
  async getDocumentationsBySessionId(sessionId: number): Promise<Documentation[]> {
    return await db
      .select()
      .from(documentations)
      .where(eq(documentations.sessionId, sessionId))
      .orderBy(desc(documentations.createdAt));
  }
  
  async createDocumentation(insertDoc: InsertDocumentation): Promise<Documentation> {
    const doc = {
      ...insertDoc,
      createdAt: new Date().toISOString()
    };
    
    const [createdDoc] = await db.insert(documentations).values(doc).returning();
    return createdDoc;
  }
  
  async updateDocumentation(id: number, data: Partial<Documentation>): Promise<Documentation> {
    const [updatedDoc] = await db
      .update(documentations)
      .set(data)
      .where(eq(documentations.id, id))
      .returning();
    
    if (!updatedDoc) {
      throw new Error(`Documentation with ID ${id} not found`);
    }
    
    return updatedDoc;
  }
  
  async initializeDefaults() {
    // Check if any agent configs exist
    const existingConfigs = await db.select().from(agentConfigs);
    
    // If no configs exist, add default ones
    if (existingConfigs.length === 0) {
      const defaultConfigs = [
        {
          type: "analyzer",
          systemPrompt: "You are an Analyzer agent. Your role is to process LLM-generated descriptions for accuracy and completeness. Look for inconsistencies or missing information in the activity descriptions.",
          isActive: 1
        },
        {
          type: "writer",
          systemPrompt: "You are a Writer agent. Your role is to create cohesive documentation from individual descriptions. Organize the information in a logical flow and maintain a consistent tone.",
          isActive: 1
        },
        {
          type: "reviewer",
          systemPrompt: "You are a Reviewer agent. Your role is to check for consistency, clarity, and usefulness in the documentation. Identify areas that need improvement or clarification.",
          isActive: 1
        },
        {
          type: "orchestrator",
          systemPrompt: "You are an Orchestrator agent. Your role is to manage workflow between agents. Coordinate the analysis, writing, and review process to ensure high-quality documentation.",
          isActive: 1
        }
      ];
      
      await db.insert(agentConfigs).values(defaultConfigs);
    }
    
    // Check if any sessions exist
    const existingSessions = await db.select().from(sessions);
    
    // If no sessions exist, add a demo session
    if (existingSessions.length === 0) {
      const demoSession = {
        name: "Demo Session",
        startTime: new Date().toISOString(),
        captureInterval: 2,
        captureArea: "Full Browser Tab",
        status: "active"
      };
      
      const [session] = await db.insert(sessions).values(demoSession).returning();
      
      // Add some demo screenshots
      const demoScreenshots = [
        {
          sessionId: session.id,
          timestamp: new Date(Date.now() - 4 * 60000).toISOString(),
          imageData: "data:image/png;base64,iVBORw0KGg...", // Placeholder base64 data
          description: "The user is logging into the dashboard system by entering credentials on the login form.",
          aiAnalysisStatus: "completed"
        },
        {
          sessionId: session.id,
          timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
          imageData: "data:image/png;base64,iVBORw0KGg...", // Placeholder base64 data
          description: "The user is navigating through menu options in the analytics dashboard, selecting data filtering parameters.",
          aiAnalysisStatus: "completed"
        },
        {
          sessionId: session.id,
          timestamp: new Date().toISOString(),
          imageData: "data:image/png;base64,iVBORw0KGg...", // Placeholder base64 data
          description: "The user is viewing a project dashboard with multiple analytics graphs showing website traffic data. The main chart displays a performance trend over time with several metrics highlighted in different colors.",
          aiAnalysisStatus: "completed"
        }
      ];
      
      await db.insert(screenshots).values(demoScreenshots);
    }
  }
}

// Create and export the database storage instance
export const storage = new DatabaseStorage();
