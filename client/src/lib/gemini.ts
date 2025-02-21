import { apiRequest } from "./queryClient";

export interface CodeAnalysis {
  language: string;
  explanation: string;
  errors: string[];
  timeComplexity: string;
  spaceComplexity: string;
  optimizedCode?: string;
  suggestions: string[];
}

export async function analyzeCode(code: string, language: string): Promise<CodeAnalysis> {
  const response = await apiRequest("POST", "/api/analyze", { code, language });
  const data = await response.json();
  return data.analysis;
}
