# AI Integration Documentation

This document details the AI components used in the Activity Documentation Tool, including OpenAI integration and CrewAI agent workflows.

## Overview

The tool uses advanced AI capabilities to analyze screenshots, generate descriptions, and produce comprehensive documentation. The two primary AI integrations are:

1. **OpenAI Vision API** - For screenshot analysis and description generation
2. **CrewAI** - For orchestrating multi-agent workflows for comprehensive documentation generation

## OpenAI Integration

### Configuration

The OpenAI integration requires an API key, which should be set in the environment variables:

```
OPENAI_API_KEY=your_openai_api_key
```

### Key Components

The OpenAI integration is primarily handled in the `server/openai.ts` and `client/src/lib/openai.ts` files.

#### Screenshot Analysis

The tool uses the GPT-4o vision model to analyze screenshots and generate descriptions of user activities:

```typescript
export async function analyzeScreenshotImage(imageBase64: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model
      messages: [
        {
          role: "system",
          content: "You are an expert in analyzing screenshots of user activities. " +
            "Provide concise, detailed descriptions of what the user is doing in the image. " +
            "Focus on UI elements, user actions, and the context of the activity."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Describe this screenshot of user activity in detail:"
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: 500,
    });

    return response.choices[0].message.content || "No description generated";
  } catch (error) {
    console.error("Error analyzing screenshot:", error);
    throw new Error("Failed to analyze screenshot with OpenAI");
  }
}
```

#### Description Suggestions

The tool can generate alternative descriptions for user review:

```typescript
export async function generateSuggestions(
  imageBase64: string,
  currentDescription?: string
): Promise<string[]> {
  try {
    const systemPrompt = currentDescription
      ? `Improve upon this description of a screenshot: "${currentDescription}"`
      : "Generate 3 different descriptions for this screenshot of user activity";

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Based on this screenshot:"
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
    });

    // Parse the JSON response
    const result = JSON.parse(response.choices[0].message.content);
    return result.suggestions || [];
  } catch (error) {
    console.error("Error generating suggestions:", error);
    throw new Error("Failed to generate description suggestions");
  }
}
```

#### Documentation Generation

The tool can generate comprehensive documentation from a series of screenshots:

```typescript
export async function generateDocumentation(
  screenshots: any[],
  format: string = "markdown",
  detailLevel: string = "standard"
): Promise<string> {
  try {
    // Format the screenshots data for the API
    const screenshotData = screenshots.map(s => ({
      timestamp: s.timestamp,
      description: s.description || "No description available",
      imageUrl: `Screenshot ID: ${s.id}`
    }));

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a documentation expert. Generate a ${detailLevel} level of detail documentation in ${format} format based on a series of screenshots and their descriptions.`
        },
        {
          role: "user",
          content: JSON.stringify(screenshotData)
        }
      ],
      max_tokens: 2000,
    });

    return response.choices[0].message.content || "No documentation generated";
  } catch (error) {
    console.error("Error generating documentation:", error);
    throw new Error("Failed to generate documentation");
  }
}
```

## CrewAI Integration

### Overview

CrewAI is used to orchestrate multiple AI agents that work together to analyze screenshots and generate documentation.

### Agent Roles

1. **Analyzer Agent** - Analyzes screenshots to identify user activities
2. **Writer Agent** - Generates documentation based on the analysis
3. **Reviewer Agent** - Reviews and improves the quality of documentation
4. **Orchestrator Agent** - Coordinates the workflow between agents

### Configuration

Each agent has a configurable system prompt that defines its behavior:

```typescript
type AgentRole = "analyzer" | "writer" | "reviewer" | "orchestrator";

interface Agent {
  role: AgentRole;
  systemPrompt: string;
  isActive: boolean;
}

// Default agent configurations
const defaultAgentConfigs: Record<AgentRole, Agent> = {
  analyzer: {
    role: "analyzer",
    systemPrompt: "You are an expert analyzer reviewing screenshots of user activities...",
    isActive: true
  },
  writer: {
    role: "writer",
    systemPrompt: "You are a technical writer specializing in creating clear documentation...",
    isActive: true
  },
  reviewer: {
    role: "reviewer",
    systemPrompt: "You are a detail-oriented reviewer examining activity documentation...",
    isActive: true
  },
  orchestrator: {
    role: "orchestrator",
    systemPrompt: "You are a project manager coordinating the analysis of user activities...",
    isActive: true
  }
};
```

### Process Flow

The CrewAI workflow follows these steps:

1. **Initialize Agents**: Create and configure the AI agents based on user preferences
2. **Data Collection**: Gather all screenshots and their metadata for processing
3. **Analysis Phase**: The Analyzer agent examines each screenshot
4. **Writing Phase**: The Writer agent creates documentation based on analysis
5. **Review Phase**: The Reviewer agent improves the documentation
6. **Delivery**: Final documentation is formatted and returned to the user

```typescript
export async function processSessionWithCrewAI(sessionId: number): Promise<void> {
  try {
    // 1. Get session and screenshots
    const session = await storage.getSession(sessionId);
    if (!session) {
      throw new Error(`Session with ID ${sessionId} not found`);
    }
    
    const screenshots = await storage.getScreenshotsBySessionId(sessionId);
    if (screenshots.length === 0) {
      throw new Error(`No screenshots found for session ${sessionId}`);
    }
    
    // 2. Get agent configurations
    const agentConfigs = await storage.getAllAgentConfigs();
    
    // 3. Initialize CrewAI
    const crew = new Crew({
      agents: agentConfigs
        .filter(agent => agent.isActive)
        .map(config => new Agent({
          role: config.type,
          goal: `Process session ${sessionId} screenshots as a ${config.type}`,
          backstory: config.systemPrompt,
          verbose: true,
          allowDelegation: true
        }))
    });
    
    // 4. Create tasks
    const tasks = [
      new Task({
        description: "Analyze all screenshots and identify user activities",
        agent: crew.agents.find(a => a.role === "analyzer"),
        context: { screenshots, session }
      }),
      new Task({
        description: "Generate comprehensive documentation based on analysis",
        agent: crew.agents.find(a => a.role === "writer"),
        depends_on: [0], // Depends on analysis task
      }),
      new Task({
        description: "Review and improve the documentation",
        agent: crew.agents.find(a => a.role === "reviewer"),
        depends_on: [1], // Depends on writing task
      })
    ];
    
    // 5. Execute the workflow
    const result = await crew.execute(tasks);
    
    // 6. Save the results
    await storage.createDocumentation({
      sessionId,
      content: result.documentation,
      format: "markdown",
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("Error processing session with CrewAI:", error);
    throw error;
  }
}
```

### Status Tracking

The tool provides real-time status updates during the CrewAI processing:

```typescript
export async function getProcessingStatus(sessionId: number): Promise<{ [key: string]: any }> {
  // Retrieve and return status information
  // This includes progress of analysis, processing, and documentation generation
  
  return {
    analysisProgress: { current: 5, total: 10 },
    processingProgress: { status: "Processing screenshots", percent: 50 },
    documentationProgress: { status: "Waiting for analysis to complete", percent: 0 }
  };
}
```

## Best Practices

### OpenAI Integration

1. **Handle API Errors**: Always implement proper error handling for API calls
2. **Compress Images**: Reduce image size before sending to the API to manage costs
3. **Throttle Requests**: Implement rate limiting to avoid API rate limits
4. **Cache Results**: Store analysis results to avoid redundant API calls
5. **Use Structured Output**: Request JSON responses for consistent parsing

### CrewAI Integration

1. **Agent Independence**: Design agents that can work independently on their specific tasks
2. **Clear Instructions**: Provide detailed instructions in agent system prompts
3. **Task Dependencies**: Define clear task dependencies for sequential processing
4. **Context Management**: Pass relevant context between agents for coherent output
5. **Error Recovery**: Implement strategies to recover from agent failures

## Future Enhancements

1. **Custom Agent Training**: Allow users to train specialized agents for specific documentation needs
2. **Multi-modal Analysis**: Expand beyond screenshots to include other data sources
3. **Integration with Other AI Models**: Support for alternative AI providers like Claude or Gemini
4. **Advanced Agent Collaboration**: More complex multi-agent workflows with feedback loops
5. **Fine-tuned Models**: Create domain-specific models for better performance