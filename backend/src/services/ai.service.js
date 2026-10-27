import dotenv from "dotenv";
dotenv.config();

import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { buildPrompt } from "../utils/prompt.js";

const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-flash-latest",
  "gemini-2.5-flash-lite",
];
const PRIMARY_GEMINI_MODEL = GEMINI_MODELS[0];

// Initialize Gemini client if API key is present
const geminiApiKey = process.env.GEMINI_API_KEY;
const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

// Optional Groq fallback client if configured
const groqApiKey = process.env.GROQ_API_KEY;
const groqClient = groqApiKey
  ? new OpenAI({
      apiKey: groqApiKey,
      baseURL: "https://api.groq.com/openai/v1",
    })
  : null;

// Helper to delay for retry backoff
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Robust Gemini caller with exponential retry across models
async function callGeminiWithRetry(prompt, maxRetries = 3) {
  if (!genAI) {
    throw new Error("GEMINI_API_KEY is not configured in backend/.env");
  }

  let lastError = null;
  for (const modelName of GEMINI_MODELS) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return { text, model: modelName };
      } catch (err) {
        lastError = err;
        const isTransient =
          err.message?.includes("503") ||
          err.message?.includes("Service Unavailable") ||
          err.message?.includes("429") ||
          err.message?.includes("quota") ||
          err.status === 503 ||
          err.status === 429;

        console.warn(
          `[Gemini ${modelName} Attempt ${attempt}/${maxRetries}] ${err.message || err}`
        );

        if (isTransient && attempt < maxRetries) {
          const delay = attempt * 1200;
          await sleep(delay);
          continue;
        }
        break; // Try next model in list
      }
    }
  }

  throw lastError;
}

// Fallback to Groq if Gemini is experiencing downtime
async function callGroqFallback(prompt) {
  if (!groqClient) {
    throw new Error("No fallback AI client available");
  }

  console.log("⚡ Calling Groq fallback (llama-3.3-70b-versatile)...");
  const response = await groqClient.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  return {
    text: response.choices[0].message.content,
    model: "llama-3.3-70b-versatile (fallback)",
  };
}

export const analyzeSQL = async (query, target = "sql", dialect = "Generic SQL") => {
  const startTime = Date.now();
  try {
    const prompt = buildPrompt(query, target, dialect);

    let rawOutput;
    let usedModel = PRIMARY_GEMINI_MODEL;

    try {
      const geminiResult = await callGeminiWithRetry(prompt);
      rawOutput = geminiResult.text;
      usedModel = geminiResult.model;
    } catch (geminiError) {
      console.error("Gemini failed:", geminiError.message);
      if (groqClient) {
        console.warn("Attempting Groq fallback due to Gemini error...");
        const fallbackResult = await callGroqFallback(prompt);
        rawOutput = fallbackResult.text;
        usedModel = fallbackResult.model;
      } else {
        throw geminiError;
      }
    }

    // Clean any accidental markdown backticks
    let cleaned = rawOutput
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    return {
      ...parsed,
      model: usedModel,
      latency_ms: Date.now() - startTime,
    };
  } catch (error) {
    console.error("AI Service Error:", error.message);
    return {
      error: "AI optimization request failed",
      details: error.message || "Failed to generate optimized query",
      latency_ms: Date.now() - startTime,
    };
  }
};