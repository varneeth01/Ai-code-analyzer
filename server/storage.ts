import { codeAnalysis, type CodeAnalysis, type InsertCodeAnalysis } from "@shared/schema";

export interface IStorage {
  saveAnalysis(analysis: InsertCodeAnalysis): Promise<CodeAnalysis>;
  getAnalysis(id: number): Promise<CodeAnalysis | undefined>;
  getRecentAnalyses(): Promise<CodeAnalysis[]>;
}

export class MemStorage implements IStorage {
  private analyses: Map<number, CodeAnalysis>;
  private currentId: number;

  constructor() {
    this.analyses = new Map();
    this.currentId = 1;
  }

  async saveAnalysis(insertAnalysis: InsertCodeAnalysis): Promise<CodeAnalysis> {
    const id = this.currentId++;
    const createdAt = new Date().toISOString();
    const analysis: CodeAnalysis = {
      ...insertAnalysis,
      id,
      createdAt,
    };
    this.analyses.set(id, analysis);
    return analysis;
  }

  async getAnalysis(id: number): Promise<CodeAnalysis | undefined> {
    return this.analyses.get(id);
  }

  async getRecentAnalyses(): Promise<CodeAnalysis[]> {
    return Array.from(this.analyses.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
  }
}

export const storage = new MemStorage();