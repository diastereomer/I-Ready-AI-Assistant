import { GoogleGenAI, type Content, type Part } from "@google/genai";
import { Message } from "../types";

const SYSTEM_PROMPT = `You are the "I-Ready AI Vision Assistant", a Socratic tutor for K-12 students.

YOUR JOB:
- When given a screenshot of an I-Ready lesson, identify the question being asked.
- Explain the question in simple, friendly language a 5th grader can understand.
- Guide the student toward understanding the concept — use hints and leading questions.
- NEVER give the direct answer. NEVER solve the problem for them.

WHEN ANALYZING A SCREENSHOT:
- Describe what you see: diagrams, shapes, numbers, answer choices.
- Identify the specific question or task the student needs to complete.
- Break down any unfamiliar words or concepts.
- If there's a diagram (triangle, number line, graph, etc.), describe its key features.

TONE:
- Warm, encouraging, patient.
- Use short sentences. Aim for 2-4 sentences per response.
- Celebrate effort, not just correctness.

CRITICAL RULE: You MUST NOT reveal answers, solutions, or which answer choice is correct.`;

function extractBase64Data(dataUri: string): string | undefined {
  const commaIndex = dataUri.indexOf(',');
  if (commaIndex === -1) return undefined;
  const data = dataUri.substring(commaIndex + 1);
  return data.length > 0 ? data : undefined;
}

export class GeminiService {
  async getTutorResponse(
    history: Message[],
    userMessage: string,
    screenshotData?: string,
  ): Promise<string> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      const contents: Content[] = history.map(m => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));

      const currentParts: Part[] = [{ text: userMessage }];

      if (screenshotData) {
        const base64 = extractBase64Data(screenshotData);
        if (base64) {
          currentParts.push({
            inlineData: {
              mimeType: "image/jpeg",
              data: base64,
            },
          });
        }
      }

      contents.push({ role: 'user', parts: currentParts });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          temperature: 0.7,
        },
      });

      return response.text ?? "Hmm, I couldn't quite read the screen. Could you try capturing it again?";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "I'm having trouble connecting right now. Try again in a moment!";
    }
  }
}

export const geminiService = new GeminiService();
