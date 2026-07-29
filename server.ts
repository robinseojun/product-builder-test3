import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post("/api/parse-task", async (req, res) => {
    try {
      const { text, currentDate } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured in the environment variables." });
      }

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `You are an AI assistant that extracts task details from natural language input.
Current date is: ${currentDate}.

Parse the following text and extract the task details:
Text: "${text}"

Respond with ONLY a JSON object having the following fields:
- title: string (the task description, clear and concise)
- date: string (YYYY-MM-DD format, defaulting to current date if not specified. Resolve relative dates like 'tomorrow' or 'next week')
- time: string (HH:mm format, 24-hour. If not specified, leave empty)
- category: string (predict the category based on context. Suggest one of the user's categories or a generic one like '업무', '개인', '학습', '약속', '기타')
- priority: string (one of: 'High', 'Medium', 'Low'. Default to 'Medium' unless urgency is implied)

JSON Response format:
{
  "title": "task name",
  "date": "2026-07-28",
  "time": "15:00",
  "category": "업무",
  "priority": "Medium"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No response from AI");
      }
      const parsedData = JSON.parse(responseText);
      res.json(parsedData);
    } catch (error) {
      console.error("AI Parsing Error:", error);
      res.status(500).json({ error: "Failed to parse task" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
