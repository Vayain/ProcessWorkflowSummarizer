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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private sessions: Map<number, Session>;
  private screenshots: Map<number, Screenshot>;
  private agentConfigs: Map<number, AgentConfig>;
  private documentations: Map<number, Documentation>;
  
  currentUserId: number;
  currentSessionId: number;
  currentScreenshotId: number;
  currentAgentConfigId: number;
  currentDocumentationId: number;

  constructor() {
    this.users = new Map();
    this.sessions = new Map();
    this.screenshots = new Map();
    this.agentConfigs = new Map();
    this.documentations = new Map();
    
    this.currentUserId = 1;
    this.currentSessionId = 1;
    this.currentScreenshotId = 1;
    this.currentAgentConfigId = 1;
    this.currentDocumentationId = 1;
    
    // Initialize with some default agent configs
    this.initializeDefaultAgentConfigs();
    
    // Initialize with a demo session
    this.initializeDemoSession();
  }

  private initializeDefaultAgentConfigs() {
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

    defaultConfigs.forEach(config => {
      const id = this.currentAgentConfigId++;
      this.agentConfigs.set(id, { ...config, id });
    });
  }

  private initializeDemoSession() {
    // Create a demo session
    const sessionId = 248;
    this.currentSessionId = 249;
    
    const session: Session = {
      id: sessionId,
      name: "Demo Session",
      startTime: new Date().toISOString(),
      captureInterval: 2,
      captureArea: "Full Browser Tab",
      status: "active"
    };
    
    this.sessions.set(sessionId, session);
    
    // Create some demo screenshots for this session
    const demoScreenshots = [
      {
        sessionId,
        timestamp: new Date(Date.now() - 4 * 60000).toISOString(),
        imageData: "data:image/png;base64,iVBORw0KGg...", // Placeholder base64 data
        description: "The user is logging into the dashboard system by entering credentials on the login form.",
        aiAnalysisStatus: "completed"
      },
      {
        sessionId,
        timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
        imageData: "data:image/png;base64,iVBORw0KGg...", // Placeholder base64 data
        description: "The user is navigating through menu options in the analytics dashboard, selecting data filtering parameters.",
        aiAnalysisStatus: "completed"
      },
      {
        sessionId,
        timestamp: new Date().toISOString(),
        imageData: "data:image/png;base64,iVBORw0KGg...", // Placeholder base64 data
        description: "The user is viewing a project dashboard with multiple analytics graphs showing website traffic data. The main chart displays a performance trend over time with several metrics highlighted in different colors.",
        aiAnalysisStatus: "completed"
      }
    ];
    
    demoScreenshots.forEach(screenshot => {
      const id = this.currentScreenshotId++;
      this.screenshots.set(id, { ...screenshot, id });
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Session methods
  async getSession(id: number): Promise<Session | undefined> {
    return this.sessions.get(id);
  }
  
  async getAllSessions(): Promise<Session[]> {
    return Array.from(this.sessions.values());
  }
  
  async createSession(insertSession: InsertSession): Promise<Session> {
    const id = this.currentSessionId++;
    const session: Session = { 
      ...insertSession, 
      id, 
      startTime: new Date().toISOString(),
      status: "active" 
    };
    this.sessions.set(id, session);
    return session;
  }
  
  async updateSession(id: number, data: Partial<Session>): Promise<Session> {
    const session = this.sessions.get(id);
    if (!session) {
      throw new Error(`Session with ID ${id} not found`);
    }
    
    const updatedSession = { ...session, ...data };
    this.sessions.set(id, updatedSession);
    return updatedSession;
  }
  
  // Screenshot methods
  async getScreenshot(id: number): Promise<Screenshot | undefined> {
    return this.screenshots.get(id);
  }
  
  async getScreenshotsBySessionId(sessionId: number): Promise<Screenshot[]> {
    return Array.from(this.screenshots.values())
      .filter(screenshot => screenshot.sessionId === sessionId);
  }
  
  async createScreenshot(insertScreenshot: InsertScreenshot): Promise<Screenshot> {
    const id = this.currentScreenshotId++;
    const screenshot: Screenshot = { 
      ...insertScreenshot, 
      id, 
      timestamp: new Date().toISOString() 
    };
    this.screenshots.set(id, screenshot);
    return screenshot;
  }
  
  async updateScreenshot(id: number, data: Partial<Screenshot>): Promise<Screenshot> {
    const screenshot = this.screenshots.get(id);
    if (!screenshot) {
      throw new Error(`Screenshot with ID ${id} not found`);
    }
    
    const updatedScreenshot = { ...screenshot, ...data };
    this.screenshots.set(id, updatedScreenshot);
    return updatedScreenshot;
  }
  
  async deleteScreenshot(id: number): Promise<void> {
    if (!this.screenshots.has(id)) {
      throw new Error(`Screenshot with ID ${id} not found`);
    }
    
    this.screenshots.delete(id);
  }
  
  // Agent config methods
  async getAgentConfig(id: number): Promise<AgentConfig | undefined> {
    return this.agentConfigs.get(id);
  }
  
  async getAgentConfigByType(type: string): Promise<AgentConfig | undefined> {
    return Array.from(this.agentConfigs.values())
      .find(config => config.type === type);
  }
  
  async getAllAgentConfigs(): Promise<AgentConfig[]> {
    return Array.from(this.agentConfigs.values());
  }
  
  async createAgentConfig(insertConfig: InsertAgentConfig): Promise<AgentConfig> {
    const id = this.currentAgentConfigId++;
    const config: AgentConfig = { ...insertConfig, id };
    this.agentConfigs.set(id, config);
    return config;
  }
  
  async updateAgentConfig(id: number, data: Partial<AgentConfig>): Promise<AgentConfig> {
    const config = this.agentConfigs.get(id);
    if (!config) {
      throw new Error(`Agent config with ID ${id} not found`);
    }
    
    const updatedConfig = { ...config, ...data };
    this.agentConfigs.set(id, updatedConfig);
    return updatedConfig;
  }
  
  // Documentation methods
  async getDocumentation(id: number): Promise<Documentation | undefined> {
    return this.documentations.get(id);
  }
  
  async getDocumentationsBySessionId(sessionId: number): Promise<Documentation[]> {
    return Array.from(this.documentations.values())
      .filter(doc => doc.sessionId === sessionId);
  }
  
  async createDocumentation(insertDoc: InsertDocumentation): Promise<Documentation> {
    const id = this.currentDocumentationId++;
    const documentation: Documentation = { 
      ...insertDoc, 
      id, 
      createdAt: new Date().toISOString() 
    };
    this.documentations.set(id, documentation);
    return documentation;
  }
  
  async updateDocumentation(id: number, data: Partial<Documentation>): Promise<Documentation> {
    const documentation = this.documentations.get(id);
    if (!documentation) {
      throw new Error(`Documentation with ID ${id} not found`);
    }
    
    const updatedDocumentation = { ...documentation, ...data };
    this.documentations.set(id, updatedDocumentation);
    return updatedDocumentation;
  }
}

export const storage = new MemStorage();
