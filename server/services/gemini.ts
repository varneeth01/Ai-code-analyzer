import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is required");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function analyzeCodeWithGemini(code: string, language: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
Analyze the following code and return a **valid JSON response**.

**User's Code:**
${code}

**Expected JSON Response:**
{
  "metrics": {
    "cyclomaticComplexity": number,
    "maintainabilityIndex": number,
    "linesOfCode": number
  },
  "explanation": {
    "overview": string,
    "timeComplexity": {
      "description": string,
      "bigO": string,
      "explanation": string
    },
    "spaceComplexity": {
      "description": string,
      "bigO": string,
      "explanation": string
    },
    "bestPractices": string[],
    "securityConsiderations": string[]
  },
  "errors": string[],
  "suggestions": [
    {
      "title": string,
      "description": string,
      "priority": "HIGH" | "MEDIUM" | "LOW",
      "codeExample": string
    }
  ],
  "optimizedCode": string
}`;

  try {
    const result = await model.generateContent(prompt);
    let responseText = result.response.text().trim();

    // Remove JSON formatting if present
    responseText = responseText.replace(/```json|```/g, "").trim();

    // Clean the response text
    let jsonText = responseText;
    jsonText = jsonText.replace(/^JSON\s*{/, '{');

    // Remove any non-JSON text before the first {
    const firstBrace = jsonText.indexOf('{');
    if (firstBrace >= 0) {
      jsonText = jsonText.substring(firstBrace);
    }

    // Remove any text after the last }
    const lastBrace = jsonText.lastIndexOf('}');
    if (lastBrace >= 0) {
      jsonText = jsonText.substring(0, lastBrace + 1);
    }

    try {
      const parsedResult = JSON.parse(jsonText);
      console.log("Analysis result:", parsedResult);
      return parsedResult;
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError);
      console.error("Cleaned response text:", jsonText);

      // Return a structured error response
      return {
        metrics: {
          cyclomaticComplexity: 0,
          maintainabilityIndex: 0,
          linesOfCode: code.split('\n').length
        },
        explanation: {
          overview: "Failed to analyze code",
          timeComplexity: {
            description: "Unknown",
            bigO: "Unknown",
            explanation: "Analysis failed"
          },
          spaceComplexity: {
            description: "Unknown",
            bigO: "Unknown",
            explanation: "Analysis failed"
          },
          bestPractices: ["Could not analyze best practices"],
          securityConsiderations: ["Could not analyze security considerations"]
        },
        errors: ["Error analyzing code: Invalid response format"],
        suggestions: [],
        optimizedCode: code
      };
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to analyze code");
  }
}