import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function analyzeCode(code: string, language: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are a code analysis expert specializing in ${language}. 
          Analyze the provided code and return detailed insights in JSON format with the following structure:
          {
            "errors": string[],
            "suggestions": Array<{
              title: string,
              description: string,
              priority: "HIGH" | "MEDIUM" | "LOW",
              codeExample: string
            }>,
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
            "optimizedCode": string,
            "metrics": {
              "cyclomaticComplexity": number,
              "maintainabilityIndex": number,
              "linesOfCode": number
            }
          }`,
        },
        {
          role: "user",
          content: `Analyze this ${language} code and provide detailed insights:\n\n${code}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No analysis result received from OpenAI");
    }

    return JSON.parse(content);
  } catch (error: any) {
    console.error("OpenAI Analysis Error:", error);
    throw new Error("Failed to analyze code: " + error.message);
  }
}

export async function generateCode(prompt: string, language: string) {
  try {
    console.log(`Generating code for language: ${language} with prompt: ${prompt}`);

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert software developer specialized in writing clean, efficient, and well-documented ${language} code.
          Generate working code based on the user's requirements and provide an explanation.
          Include comments explaining the time and space complexity.
          Return the response in JSON format with the following structure:
          {
            "generatedCode": string,
            "explanation": {
              "overview": string,
              "timeComplexity": string,
              "spaceComplexity": string,
              "bestPractices": string[]
            }
          }`,
        },
        {
          role: "user",
          content: `Generate ${language} code for the following requirements:\n\n${prompt}\n\nProvide clean, efficient, and well-documented code with best practices.`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No code generation result received from OpenAI");
    }

    console.log("OpenAI Response:", content);
    const result = JSON.parse(content);

    if (!result.generatedCode) {
      throw new Error("Generated code is empty");
    }

    return result;
  } catch (error: any) {
    console.error("OpenAI Generation Error:", error);
    if (error.response?.data?.error?.message) {
      throw new Error(`Failed to generate code: ${error.response.data.error.message}`);
    }
    throw new Error("Failed to generate code: " + error.message);
  }
}
