import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";
import { buildPrompt } from "../utils/prompt.js";

// Groq client
const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export const analyzeSQL = async (query, target = "sql") => {
  try {
    const prompt = buildPrompt(query, target);

    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      //  Helps enforce JSON output
      response_format: { type: "json_object" },
    });

    let text = response.choices[0].message.content;

    // 🔥 Clean markdown (safety)
    text = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    try {
      return JSON.parse(text);
    } catch (err) {
      console.error("JSON Parse Error");
      console.error("RAW AI RESPONSE:", text);

      return {
        error: "Invalid JSON from AI",
        raw: text,
      };
    }
  } catch (error) {
    console.error("AI Service Error:", error.message);

    return {
      error: "AI request failed",
      details: error.message,
    };
  }
};