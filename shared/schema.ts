import { pgTable, text, serial, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const codeAnalysis = pgTable("code_analysis", {
  id: serial("id").primaryKey(),
  code: text("code").notNull(),
  language: text("language").notNull(),
  analysis: json("analysis").$type<{
    metrics: {
      cyclomaticComplexity: number;
      maintainabilityIndex: number;
      linesOfCode: number;
    };
    explanation: {
      overview: string;
      timeComplexity: {
        description: string;
        bigO: string;
        explanation: string;
      };
      spaceComplexity: {
        description: string;
        bigO: string;
        explanation: string;
      };
      bestPractices: string[];
      securityConsiderations: string[];
    };
    errors: string[];
    suggestions: Array<{
      title: string;
      description: string;
      priority: "HIGH" | "MEDIUM" | "LOW";
      codeExample: string;
    }>;
    optimizedCode?: string;
  }>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCodeAnalysisSchema = createInsertSchema(codeAnalysis).omit({
  id: true,
  createdAt: true,
});

export type InsertCodeAnalysis = z.infer<typeof insertCodeAnalysisSchema>;
export type CodeAnalysis = typeof codeAnalysis.$inferSelect;
