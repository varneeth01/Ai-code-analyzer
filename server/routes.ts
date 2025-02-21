import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertCodeAnalysisSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import { analyzeCodeWithGemini } from "./services/gemini";
import { recognizeHandwriting } from "./services/pytorch";

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express) {
  // Get all analyses
  app.get("/api/analyses", async (_req, res) => {
    try {
      const analyses = await storage.getRecentAnalyses();
      res.json(analyses);
    } catch (error) {
      console.error("Failed to fetch analyses:", error);
      res.status(500).json({ error: "Failed to fetch analyses" });
    }
  });

  // Analyze code
  app.post("/api/analyze", async (req, res) => {
    try {
      const { code, language } = insertCodeAnalysisSchema.parse({
        code: req.body.code,
        language: req.body.language,
        analysis: {},
      });

      const analysis = await analyzeCodeWithGemini(code, language);

      const result = await storage.saveAnalysis({
        code,
        language,
        analysis,
      });

      res.json(result);
    } catch (error) {
      console.error("Analysis error:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to analyze code" });
      }
    }
  });

  // Upload and process file
  app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        throw new Error("No file provided");
      }

      let code = "";
      let language = "python"; // Default language

      // If it's an image, use OCR
      if (req.file.mimetype.startsWith("image/")) {
        const imageBase64 = req.file.buffer.toString("base64");
        code = await recognizeHandwriting(imageBase64);
      } else {
        // For code files, read directly
        code = req.file.buffer.toString("utf-8");

        // Detect language from file extension
        const extension = req.file.originalname.split(".").pop()?.toLowerCase();
        switch (extension) {
          case "js":
            language = "javascript";
            break;
          case "py":
            language = "python";
            break;
          case "java":
            language = "java";
            break;
          case "cpp":
            language = "cpp";
            break;
          default:
            language = "python";
        }
      }

      res.json({ code, language });
    } catch (error: any) {
      console.error("Upload error:", error);
      res.status(400).json({ error: error.message });
    }
  });

  return createServer(app);
}