// Client-side CrewAI integration utilities

export interface AgentConfig {
  type: string;
  systemPrompt: string;
  isActive: boolean;
}

// Function to update agent configurations
export async function updateAgentConfigs(configs: Record<string, AgentConfig>): Promise<void> {
  try {
    const response = await fetch('/api/agent-configs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(configs),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
  } catch (error) {
    console.error('Error updating agent configurations:', error);
    throw error;
  }
}

// Function to get agent configurations
export async function getAgentConfigs(): Promise<Record<string, AgentConfig>> {
  try {
    const response = await fetch('/api/agent-configs');

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching agent configurations:', error);
    throw error;
  }
}

// Function to trigger CrewAI processing for a session
export async function processSessionWithCrewAI(sessionId: number): Promise<void> {
  try {
    const response = await fetch('/api/process-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
  } catch (error) {
    console.error('Error processing session with CrewAI:', error);
    throw error;
  }
}

// Function to get processing status for a session
export async function getProcessingStatus(sessionId: number): Promise<{
  analysisProgress: { current: number; total: number };
  processingProgress: { status: string; percent: number };
  documentationProgress: { status: string; percent: number };
}> {
  try {
    const response = await fetch(`/api/processing-status/${sessionId}`);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching processing status:', error);
    throw new Error('Failed to fetch processing status');
  }
}

// Function to preview agent output
export async function previewAgentOutput(configs: Record<string, AgentConfig>): Promise<string> {
  try {
    const response = await fetch('/api/preview-agents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(configs),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.preview;
  } catch (error) {
    console.error('Error previewing agent output:', error);
    throw error;
  }
}
