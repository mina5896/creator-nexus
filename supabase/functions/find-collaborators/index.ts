import { serve } from "std/http/server.ts";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to extract JSON from a string
const extractJson = (text: string) => {
    const startIndex = text.indexOf('['); // This one starts with an array
    const endIndex = text.lastIndexOf(']');
    if (startIndex === -1 || endIndex === -1) {
        throw new Error("AI response did not contain a valid JSON array.");
    }
    const jsonString = text.substring(startIndex, endIndex + 1);
    return JSON.parse(jsonString);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!API_KEY) {
      throw new Error('Missing GEMINI_API_KEY');
    }

    const { projectDescription, rolesNeeded } = await req.json();
    if (!projectDescription || !rolesNeeded) {
      return new Response(JSON.stringify({ error: 'Missing projectDescription or rolesNeeded' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `
      You are an expert talent scout for creative projects.
      Based on the following project description and list of missing roles, generate a list of suitable, fictional creator portfolios.
      
      Project Description: "${projectDescription}"
      
      Missing Roles: ${rolesNeeded.join(', ')}
      
      For each role, create a list of 2-3 compelling and realistic fictional candidates. The candidates' portfolios should look like they belong to talented professionals or passionate newcomers. Some candidates should be professionals seeking 'paid' work with a reasonable hourly rate, while others should be talented individuals seeking 'experience'. Ensure the project examples in their portfolios are highly relevant to their specified role. For image URLs, create varied and specific seeds for picsum.photos, like 'https://picsum.photos/seed/futuristic-robot-concept/600/400'.
      
      Your response must be a valid JSON array matching this schema:
      [
        {
          "role": "string",
          "candidates": [
            {
              "name": "string",
              "role": "string",
              "specialty": "string",
              "bio": "string",
              "compensationType": "'paid' or 'experience'",
              "hourlyRate": "number (null if experience)",
              "portfolio": [
                {
                  "title": "string",
                  "description": "string",
                  "imageUrl": "string"
                }
              ]
            }
          ]
        }
      ]
    `;

    const result = await model.generateContent(prompt, {
        safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ]
    });
    const response = await result.response;
    // Use the helper function to safely parse the JSON
    const candidates = extractJson(response.text());

    return new Response(JSON.stringify(candidates), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error("Function Error:", error);
    return new Response(JSON.stringify({ 
        error: "An internal error occurred.",
        details: error.message || "No specific error message available." 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});