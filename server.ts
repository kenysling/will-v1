import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const MODEL_NAME = "gemini-4-hydrogen";

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in server secrets.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function handleApiError(res: express.Response, err: unknown) {
  const message = err instanceof Error ? err.message : "An unexpected error occurred while communicating with AI counsel.";
  console.error("[LegacyDraft API Error]", err);
  if (message.includes("API_KEY_INVALID") || message.includes("PERMISSION_DENIED") || message.includes("GEMINI_API_KEY")) {
    return res.status(403).json({
      error: "AI service credentials are unavailable or invalid. Please check your API key in Settings > Secrets.",
    });
  }
  if (message.includes("RESOURCE_EXHAUSTED") || message.includes("429")) {
    return res.status(429).json({
      error: "AI request quota has been reached. Please wait a moment and try again.",
    });
  }
  return res.status(500).json({ error: message });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "2mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", jurisdiction: "Singapore" });
  });

  // 1. Formal Singapore Will Draft Generation
  app.post("/api/will/generate", async (req, res) => {
    try {
      const { profile, tier } = req.body as { profile: Record<string, unknown>; tier: string };
      if (!profile || typeof profile !== "object") {
        return res.status(400).json({ error: "Missing will profile data." });
      }

      const ai = getGeminiClient();

      const systemInstruction = `You are a specialist Singapore estate planning and will-drafting legal assistant.
Your role is to draft a formal, clear, structured Last Will and Testament aligned with the Singapore Wills Act 1838 (Cap. 352) based strictly on the testator's provided instructions.

Drafting standards:
- Use formal, precise common-law drafting conventions used in Singapore (Revocation of prior wills, Appointment of Executors & Trustees, Guardianship of Minor Children if applicable, Specific Bequests & Property Notes, Residuary Estate Distribution with survivorship and substitution clauses, Minor Vesting / Testamentary Trust provisions if enabled, Funeral & Digital Asset wishes, Testimonium, and Section 6 Wills Act two-witness Attestation Clause).
- Include clear reminders where assets fall outside a Will in Singapore (for example: CPF savings require a separate CPF Nomination; properties held under Joint Tenancy pass by right of survivorship unless severed into Tenancy-in-Common; Section 73 CLPA / statutory trust insurance nominations).
- If the testator indicated Muslim / Syariah Law applies, clearly state in complianceNotices that under the Administration of Muslim Law Act (AMLA), a Muslim testator may generally only bequeath up to one-third (1/3) of their estate by will to non-Faraid heirs unless all Faraid beneficiaries consent.
- Membership tier context: "${tier}". If tier is "private_wealth", include detailed business succession and multi-jurisdiction asset schedule phrasing when provided. If tier is "family_guard" or "private_wealth", include testamentary trust and mirror-will context when enabled.
- Output strictly valid JSON matching the requested schema.`;

      const prompt = `Draft a complete Last Will and Testament in Singapore legal format for this profile:\n\n${JSON.stringify(profile, null, 2)}`;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              documentTitle: {
                type: Type.STRING,
                description: "Formal document heading, e.g. LAST WILL AND TESTAMENT OF [NAME]",
              },
              formalWillText: {
                type: Type.STRING,
                description:
                  "Complete, cleanly formatted formal Last Will and Testament text with numbered clauses (1., 2., 3., ...) and full Singapore Section 6 signature & two-witness attestation block at the end.",
              },
              summaryClauses: {
                type: Type.ARRAY,
                description: "Plain-English breakdown of each key clause in the drafted will.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    clauseNumber: { type: Type.STRING },
                    title: { type: Type.STRING },
                    plainEnglish: { type: Type.STRING },
                  },
                  required: ["clauseNumber", "title", "plainEnglish"],
                },
              },
              complianceNotices: {
                type: Type.ARRAY,
                description: "Singapore statutory execution reminders and asset-scope notices specific to this profile.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    severity: {
                      type: Type.STRING,
                      description: "One of: Action Required, Important, Advisory",
                    },
                    title: { type: Type.STRING },
                    guidance: { type: Type.STRING },
                  },
                  required: ["severity", "title", "guidance"],
                },
              },
            },
            required: ["documentTitle", "formalWillText", "summaryClauses", "complianceNotices"],
          },
        },
      });

      const rawText = (response.text ?? "{}").trim();
      const parsed = JSON.parse(rawText);
      return res.json(parsed);
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  // 2. AI Legal Risk & Clause Ambiguity Audit (Family Guard & Private Wealth)
  app.post("/api/will/review", async (req, res) => {
    try {
      const { willText, profile } = req.body as { willText: string; profile: Record<string, unknown> };
      if (!willText || !willText.trim()) {
        return res.status(400).json({ error: "Please generate or provide a will draft before running a risk audit." });
      }

      const ai = getGeminiClient();

      const systemInstruction = `You are a senior Singapore estate planning reviewer auditing a draft Last Will and Testament for practical legal risks, drafting ambiguities, survivorship gaps, ademption risks, executor conflicts, witness pitfalls under Section 10 of the Wills Act (beneficiaries or their spouses must not witness), CPF/Joint Tenancy mismatches, and minor guardianship gaps.
Return structured, concrete findings with exact suggested replacement or supplemental clauses in plain Singapore legal English. Output valid JSON strictly matching the schema.`;

      const prompt = `Audit the following draft Will and client estate profile:\n\nPROFILE:\n${JSON.stringify(profile, null, 2)}\n\nDRAFT WILL:\n${willText}`;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallAssessment: {
                type: Type.STRING,
                description: "Concise 2-3 sentence professional executive summary of the draft's readiness.",
              },
              findings: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    severity: {
                      type: Type.STRING,
                      description: "One of: High, Medium, Advisory",
                    },
                    clauseRef: { type: Type.STRING },
                    issue: { type: Type.STRING },
                    recommendation: { type: Type.STRING },
                    suggestedClause: { type: Type.STRING },
                  },
                  required: ["id", "severity", "clauseRef", "issue", "recommendation", "suggestedClause"],
                },
              },
            },
            required: ["overallAssessment", "findings"],
          },
        },
      });

      const rawText = (response.text ?? "{}").trim();
      const parsed = JSON.parse(rawText);
      return res.json(parsed);
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  // 3. AI Estate Planning Counsel Chat (WillGPT experience)
  app.post("/api/estate/chat", async (req, res) => {
    try {
      const { messages, willContext, tier } = req.body as {
        messages: Array<{ role: "user" | "assistant"; content: string }>;
        willContext?: Record<string, unknown> | null;
        tier?: string;
      };

      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: "A question is required." });
      }

      const ai = getGeminiClient();

      const contextBlock = willContext
        ? `\n\nThe member has shared their current Will Builder profile for personalized context:\n${JSON.stringify(willContext, null, 2)}`
        : "";

      const systemInstruction = `You are LegacyDraft Estate Counsel, an authoritative, calm, and structured AI estate planning advisor specializing in Singapore wealth & legacy planning (Wills Act 1838, Intestate Succession Act 1967, CPF Nomination Scheme, Lasting Power of Attorney under the Mental Capacity Act, Joint Tenancy vs Tenancy-in-Common for HDB/Private Property, Trust & Insurance Nominations, and AMLA/Faraid overview for Muslim clients).

Response style:
- Write clearly, calmly, and concisely in plain English suited to a private wealth advisory client.
- Structure answers with short headings or concise bullet points when explaining statutory rules or action steps.
- Always distinguish assets covered by a Will vs. assets passing outside a Will (CPF, Joint Tenancy, statutory trust policies) when relevant.
- Do not give formal legal representation; note briefly when a Singapore Advocate & Solicitor review is advisable for complex cross-border, trust, or business succession matters.
- Member subscription tier: ${tier || "essential"}.${contextBlock}`;

      const contents = messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents,
        config: {
          systemInstruction,
        },
      });

      return res.json({
        reply: response.text ?? "I was unable to formulate a response. Please try rephrasing your question.",
      });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  // Vite middleware in development, static dist in production
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("/{*splat}", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`LegacyDraft server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
