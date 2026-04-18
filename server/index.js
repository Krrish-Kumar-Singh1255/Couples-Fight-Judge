import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Cache to store verdicts and prevent repeated API calls for the same input
const verdictCache = new Map();

// Proxy endpoint for Gemini API
app.post("/api/judge", async (req, res) => {
  try {
    const {
      boyName,
      boyStory,
      boyComplaint,
      girlName,
      girlStory,
      girlComplaint,
    } = req.body;

    // Normalize inputs for reliable caching
    const normalizedData = {
      boyName: (boyName || "").trim(),
      boyStory: (boyStory || "").trim(),
      boyComplaint: (boyComplaint || "").trim(),
      girlName: (girlName || "").trim(),
      girlStory: (girlStory || "").trim(),
      girlComplaint: (girlComplaint || "").trim(),
    };

    // Create a unique key for this specific fight to check cache
    const cacheKey = JSON.stringify(normalizedData);

    if (verdictCache.has(cacheKey)) {
      console.log("Serving verdict from cache...");
      return res.json(verdictCache.get(cacheKey));
    }

    if (!process.env.GOOGLE_API_KEY) {
      return res
        .status(500)
        .json({
          error: { message: "Google API key is missing on the server." },
        });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        maxOutputTokens: 2048,
        temperature: 0.7,
      },
    });

    const prompt = `You are the ultimate Relationship Court Judge. You are strict, dramatic, and highly analytical. 
    You receive two conflicting sides of a couple's fight. Your job is to analyze the evidence fairly and determine who is more at fault.
    
    IMPORTANT: You must return ONLY a JSON object. No preamble, no explanation outside the JSON.
    
    JSON Structure required:
    {
      "boy_fault_percent": <number 0-100>,
      "girl_fault_percent": <number 0-100>,
      "evidence_points": ["Clear, specific observation 1", "Clear, specific observation 2", "Clear, specific observation 3"],
      "judge_remarks": "Your dramatic, authoritative 1-2 sentence judicial commentary.",
      "primary_fault": "boy" or "girl" or "equal"
    }
    The fault percentages must sum to exactly 100.
    
    EVIDENCE POINTS RULES:
    - Must be clear, grammatically correct sentences
    - Must be specific observations about behavior or facts
    - No abbreviations or incomplete thoughts
    - Each point must be 1-2 sentences max
    - Focus on actionable issues, not vague statements
    
    THE CASE DATA:
    BOY'S NAME: ${normalizedData.boyName}
    BOY'S SIDE OF THE STORY: ${normalizedData.boyStory}
    BOY'S SPECIFIC COMPLAINT: ${normalizedData.boyComplaint || "None"}

    GIRL'S NAME: ${normalizedData.girlName}
    GIRL'S SIDE OF THE STORY: ${normalizedData.girlStory}
    GIRL'S SPECIFIC COMPLAINT: ${normalizedData.girlComplaint || "None"}

    Analyze the emotional weight, the logic, and the relationship etiquette of this situation. Deliver your verdict now.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Robust JSON extraction: find the first '{' and the last '}'
    const startIdx = text.indexOf("{");
    const endIdx = text.lastIndexOf("}");

    if (startIdx === -1 || endIdx === -1) {
      throw new Error(
        "The Judge failed to deliver a structured verdict. Please try again.",
      );
    }

    const jsonString = text.substring(startIdx, endIdx + 1);
    const parsedVerdict = JSON.parse(jsonString);

    // Store in cache before responding
    verdictCache.set(cacheKey, parsedVerdict);

    // Limit cache size to 100 entries
    if (verdictCache.size > 100) {
      const firstKey = verdictCache.keys().next().value;
      verdictCache.delete(firstKey);
    }

    res.json(parsedVerdict);
  } catch (error) {
    console.error("Detailed Error calling Gemini API:", error);

    // FALLBACK VERDICT for 429 errors during Hackathon
    if (error.message.includes("429") || error.status === 429) {
      const fallbacks = [
        {
          boy_fault_percent: 45,
          girl_fault_percent: 55,
          evidence_points: [
            "The judge's brain is overloaded by your drama.",
            "Relationship laws are temporarily suspended due to high traffic.",
            "The evidence is too complex for the current cloud tier.",
          ],
          judge_remarks:
            "The Court is temporarily overwhelmed, but the law remains clear.",
          primary_fault: "girl",
          is_fallback: true,
        },
        {
          boy_fault_percent: 51,
          girl_fault_percent: 49,
          evidence_points: [
            "A massive queue of couples is waiting outside the courtroom.",
            "The Judge is taking a mandatory snack break.",
            "The evidence suggests a high level of sass on both sides.",
          ],
          judge_remarks:
            "I've seen enough for now. The scales are tipping slightly.",
          primary_fault: "boy",
          is_fallback: true,
        },
        {
          boy_fault_percent: 30,
          girl_fault_percent: 70,
          evidence_points: [
            "The Judge's gavel broke from all this arguing.",
            "Satellite interference detected in the relationship zone.",
            "Someone definitely didn't text back fast enough.",
          ],
          judge_remarks:
            "The courtroom is in chaos, but my instinct says this is the way.",
          primary_fault: "girl",
          is_fallback: true,
        },
      ];

      const randomFallback =
        fallbacks[Math.floor(Math.random() * fallbacks.length)];
      return res.json(randomFallback);
    }

    res.status(500).json({
      error: {
        message: `Judge Error: ${error.message}.`,
      },
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
