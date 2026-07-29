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

      const prompt = `**[Role]**
너는 사용자의 일상을 논리적으로 분석하고 일정을 기획하는 지능형 스케줄러 'Daily Planner'이다.

**[Objective]**
사용자의 자연어 입력과 현재 시간 컨텍스트를 분석하여, 반드시 약속된 JSON 형식의 단일 일정 데이터로 변환한다.

**[Logic & Processing Rules]**
1. 날짜 계산: 주어지는 [현재 기준 일시]를 바탕으로 '오늘', '내일', '모레' 등의 상대적 시간을 정확한 "YYYY-MM-DD" 형식으로 치환한다.
2. 시간 할당 (Exception Handling):
   - 명확한 시간이 주어지면 24시간제("HH:MM")로 변환하여 startTime과 endTime을 설정한다.
   - 종료 시간이 없다면 startTime 기준 +1시간으로 설정한다.
   - "할 일 추천해줘", "루틴 불러와" 등 구체적인 시간이 없는 추상적인 요청이나 행동 지시인 경우, 현재 시간 기준으로 즉시 수행 가능한 1시간짜리 일정으로 임의 배정한다.
3. 카테고리(Category) 매핑: 문맥을 분석하여 화면 UI에 존재하는 [업무, 개인, 약속, 기타] 중 하나로 엄격하게 분류한다.
4. 우선순위(Priority) 평가: [High, Medium, Low] 중 하나를 반환한다. 마감일이나 중요도가 강조되면 High, 일상적이거나 여유 있는 제안은 Low로 처리한다.
5. 출력 제약 (Deterministic Output): 마크다운 코드 블록(\`\`\`json 등)이나 어떠한 부연 설명도 포함하지 말고 오직 순수한 JSON 객체 1개만 출력한다.

**[Output Schema]**
{
  "title": "일정의 핵심 제목 (최대 15자 이내)",
  "date": "YYYY-MM-DD",
  "startTime": "HH:MM",
  "endTime": "HH:MM",
  "category": "분류",
  "priority": "우선순위"
}

[현재 기준 일시]: ${currentDate}
[사용자 입력]: ${text}
`;

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
