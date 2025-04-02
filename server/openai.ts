import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "demo_key" });

/**
 * Analyzes a screenshot image and generates a description of the user activity
 * @param imageBase64 Base64 encoded image data
 * @returns Promise<string> A description of the activity in the screenshot
 */
export async function analyzeScreenshotImage(imageBase64: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert at analyzing screenshots and describing user activities. Your task is to describe what the user is doing in the screenshot as accurately and concisely as possible. Focus on the main activity, interface elements being interacted with, and any contextual information that helps understand the user's workflow."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this screenshot and describe what the user is doing. Be detailed but concise."
            },
            {
              type: "image_url",
              image_url: {
                url: imageBase64
              }
            }
          ],
        },
      ],
      max_tokens: 300,
    });

    return response.choices[0].message.content || "Unable to analyze screenshot";
  } catch (error) {
    console.error("Error analyzing screenshot with OpenAI:", error);
    throw error;
  }
}

/**
 * Generates alternative description suggestions for a screenshot
 * @param imageBase64 Base64 encoded image data
 * @param currentDescription Current description if available
 * @returns Promise<string[]> Array of alternative descriptions
 */
export async function generateSuggestions(
  imageBase64: string,
  currentDescription?: string
): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert at analyzing screenshots and providing alternative descriptions. Provide 2 alternative descriptions that are different in style and detail level but accurate. Return only the descriptions in a JSON array format."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: currentDescription 
                ? `Here's a screenshot with its current description: "${currentDescription}". Please generate 2 alternative descriptions that are different in style but also accurate.`
                : "Analyze this screenshot and provide 2 alternative descriptions that are different in style and detail level."
            },
            {
              type: "image_url",
              image_url: {
                url: imageBase64
              }
            }
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      return ["Unable to generate suggestions"];
    }

    try {
      const parsedContent = JSON.parse(content);
      if (Array.isArray(parsedContent.suggestions)) {
        return parsedContent.suggestions;
      } else {
        // If the structure isn't as expected, handle it gracefully
        return [
          parsedContent.description1 || parsedContent.suggestion1 || "Alternative description 1",
          parsedContent.description2 || parsedContent.suggestion2 || "Alternative description 2"
        ];
      }
    } catch (e) {
      console.error("Error parsing OpenAI response:", e);
      return [content.substring(0, 200), content.substring(201, 400)];
    }
  } catch (error) {
    console.error("Error generating suggestions with OpenAI:", error);
    throw error;
  }
}

/**
 * Generates documentation from a series of screenshots
 * @param screenshots Array of screenshots with descriptions
 * @param format Output format (markdown, HTML, PDF)
 * @param detailLevel Level of detail (minimal, standard, detailed)
 * @returns Promise<string> Generated documentation content
 */
export async function generateDocumentation(
  screenshots: any[],
  format: string = "markdown",
  detailLevel: string = "standard"
): Promise<string> {
  try {
    // Prepare the screenshot data for the prompt
    const screenshotData = screenshots.map(s => ({
      timestamp: s.timestamp,
      description: s.description || "No description available"
    }));

    // Determine the appropriate prompt based on format and detail level
    let formatInstructions = "";
    if (format === "markdown") {
      formatInstructions = "Format the documentation in Markdown with appropriate headings, bullet points, and code blocks as needed.";
    } else if (format === "HTML") {
      formatInstructions = "Format the documentation in HTML with appropriate tags for structure and styling.";
    } else {
      formatInstructions = "Format the documentation in plain text that can be converted to PDF.";
    }

    let detailInstructions = "";
    if (detailLevel === "minimal") {
      detailInstructions = "Keep the documentation concise, focusing only on the most important actions and omitting minor details.";
    } else if (detailLevel === "detailed") {
      detailInstructions = "Include all available details in the documentation, providing comprehensive coverage of all user activities.";
    } else {
      detailInstructions = "Provide a balanced level of detail, covering important actions without excessive verbosity.";
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert documentation writer. Your task is to generate clear, well-structured documentation of a user's activities based on screenshot descriptions. ${formatInstructions} ${detailInstructions} The documentation should flow logically and be organized chronologically.`
        },
        {
          role: "user",
          content: `Generate documentation from the following screenshot data: ${JSON.stringify(screenshotData)}`
        }
      ],
      max_tokens: 2000,
    });

    return response.choices[0].message.content || "Unable to generate documentation";
  } catch (error) {
    console.error("Error generating documentation with OpenAI:", error);
    throw error;
  }
}
