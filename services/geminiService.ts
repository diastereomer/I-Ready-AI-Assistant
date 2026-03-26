import { Message } from "../types";

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

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

// ── Auth helpers ──

type AuthMode = "oauth" | "apikey";

async function getOAuthToken(): Promise<string> {
  const result = await chrome.identity.getAuthToken({ interactive: true });
  if (!result.token) throw new Error("Google sign-in failed");
  return result.token;
}

export async function getStoredApiKey(): Promise<string | null> {
  try {
    const result = await chrome.storage.local.get("geminiApiKey");
    const key = result.geminiApiKey;
    return typeof key === "string" && key.length > 0 ? key : null;
  } catch {
    return null;
  }
}

export async function setStoredApiKey(key: string): Promise<void> {
  await chrome.storage.local.set({ geminiApiKey: key });
}

export async function clearStoredApiKey(): Promise<void> {
  await chrome.storage.local.remove("geminiApiKey");
}

async function resolveAuth(): Promise<{ mode: AuthMode; headers: Record<string, string> }> {
  // Try OAuth first (seamless on Chromebooks)
  try {
    const token = await getOAuthToken();
    return {
      mode: "oauth",
      headers: { Authorization: `Bearer ${token}` },
    };
  } catch {
    // OAuth not configured or user declined — fall back to stored API key
  }

  const apiKey = await getStoredApiKey();
  if (apiKey) {
    return { mode: "apikey", headers: {} };
  }

  throw new Error("NO_AUTH");
}

// ── Data URI helpers ──

function extractBase64Data(dataUri: string): string | undefined {
  const commaIndex = dataUri.indexOf(",");
  if (commaIndex === -1) return undefined;
  const data = dataUri.substring(commaIndex + 1);
  return data.length > 0 ? data : undefined;
}

// ── REST API types ──

interface GeminiPart {
  text?: string;
  inlineData?: { mimeType: string; data: string };
}

interface GeminiContent {
  role: string;
  parts: GeminiPart[];
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  error?: { message?: string };
}

// ── Service ──

export class GeminiService {
  async getTutorResponse(
    history: Message[],
    userMessage: string,
    screenshotData?: string,
  ): Promise<string> {
    let auth: Awaited<ReturnType<typeof resolveAuth>>;
    try {
      auth = await resolveAuth();
    } catch {
      return "NO_AUTH";
    }

    try {
      const contents: GeminiContent[] = history.map(m => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));

      const currentParts: GeminiPart[] = [{ text: userMessage }];

      if (screenshotData) {
        const base64 = extractBase64Data(screenshotData);
        if (base64) {
          currentParts.push({
            inlineData: { mimeType: "image/jpeg", data: base64 },
          });
        }
      }

      contents.push({ role: "user", parts: currentParts });

      let url: string;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...auth.headers,
      };

      if (auth.mode === "apikey") {
        const apiKey = await getStoredApiKey();
        url = `${GEMINI_API_BASE}/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
      } else {
        url = `${GEMINI_API_BASE}/models/${GEMINI_MODEL}:generateContent`;
      }

      const body = JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: { temperature: 0.7 },
      });

      const res = await fetch(url, { method: "POST", headers, body });

      if (res.status === 401 || res.status === 403) {
        if (auth.mode === "oauth") {
          await chrome.identity.removeCachedAuthToken({ token: auth.headers.Authorization.replace("Bearer ", "") });
          return "Your Google session expired. Please try again — it will re-authenticate automatically.";
        }
        return "API key is invalid or expired. Please update it in settings.";
      }

      if (!res.ok) {
        const errBody = await res.text();
        console.error("Gemini API error:", res.status, errBody);
        return `Something went wrong (HTTP ${res.status}). Please try again.`;
      }

      const data: GeminiResponse = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      return text ?? "Hmm, I couldn't quite read the screen. Could you try capturing it again?";
    } catch (error) {
      console.error("Gemini API Error:", error);
      const msg = error instanceof Error ? error.message : String(error);
      return `Something went wrong: ${msg}`;
    }
  }
}

export const geminiService = new GeminiService();
