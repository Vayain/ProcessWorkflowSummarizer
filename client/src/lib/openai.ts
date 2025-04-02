// Client-side OpenAI utilities

// Function to analyze a screenshot using OpenAI's API via our server endpoint
export async function analyzeScreenshot(
  screenshotId: number,
  imageBase64: string
): Promise<string> {
  try {
    const response = await fetch('/api/analyze-screenshot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        screenshotId,
        imageData: imageBase64,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.description;
  } catch (error) {
    console.error('Error analyzing screenshot:', error);
    throw error;
  }
}

// Function to get AI suggestions for a description
export async function getDescriptionSuggestions(
  imageBase64: string,
  currentDescription?: string
): Promise<string[]> {
  try {
    const response = await fetch('/api/description-suggestions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageData: imageBase64,
        currentDescription,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.suggestions;
  } catch (error) {
    console.error('Error getting description suggestions:', error);
    throw error;
  }
}

// Function to generate documentation from screenshots
export async function generateDocumentation(
  sessionId: number,
  format: string = 'markdown',
  detailLevel: string = 'standard'
): Promise<string> {
  try {
    const response = await fetch('/api/generate-documentation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        format,
        detailLevel,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error('Error generating documentation:', error);
    throw error;
  }
}
