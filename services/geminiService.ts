
import { GoogleGenAI, type Content, type Part } from "@google/genai";
import { Message, Problem } from "../types";

function extractBase64Data(dataUri: string): string | undefined {
  const commaIndex = dataUri.indexOf(',');
  if (commaIndex === -1) return undefined;
  const data = dataUri.substring(commaIndex + 1);
  return data.length > 0 ? data : undefined;
}

export class GeminiService {
  async getTutorResponse(history: Message[], problem: Problem, userMessage: string, screenshotData?: string): Promise<string> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      const systemInstruction = `
        You are the "I-Ready AI Vision Assistant". 
        Role: Socratic Tutor for K-12 students.
        Goal: Help students solve geometry and math problems without giving answers.
        
        VISUAL REASONING RULES:
        1. If a screenshot is provided, refer to colors and shapes (e.g., "the blue triangle", "the side labeled 'c'").
        2. Ask questions that lead them to discover the formula or relationship.
        3. Keep language extremely simple (5th-grade level).
        4. Max 30 words per response.
        
        Current Context:
        Problem: ${problem.question}
        Subject: ${problem.subject}
      `;

      const contents: Content[] = history.map(m => ({
        role: m.role === 'system' ? 'user' : m.role,
        parts: [{ text: m.text }]
      }));

      const currentParts: Part[] = [{ text: userMessage }];

      if (screenshotData) {
        const base64 = extractBase64Data(screenshotData);
        if (base64) {
          currentParts.push({
            inlineData: {
              mimeType: "image/jpeg",
              data: base64,
            }
          });
          currentParts.push({ text: "I am looking at your I-Ready screen now. I see the diagram clearly." });
        }
      }

      contents.push({
        role: 'user',
        parts: currentParts
      });

      const response = await ai.models.generateContent({
        model: screenshotData ? 'gemini-2.5-flash-image' : 'gemini-3-flash-preview',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      return response.text ?? "I'm here to help! What do you notice first about the shape on your screen?";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "I'm having a little trouble seeing the screen. Can you tell me what the problem says?";
    }
  }
}

export const geminiService = new GeminiService();
