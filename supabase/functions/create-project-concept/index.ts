import { serve } from "std/http/server.ts";
import { GoogleGenerativeAI } from "@google/genai";

// Update the interface to remove imagePrompt
interface ProjectConcept {
  title: string;
  description: string;
  rolesNeeded: string[];
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to extract JSON from a string
const extractJson = (text: string) => {
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');
    if (startIndex === -1 || endIndex === -1) {
        throw new Error("AI response did not contain a valid JSON object.");
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

    const { idea } = await req.json();
    if (!idea) {
      return new Response(JSON.stringify({ error: 'Missing project idea in request body' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    // Update the prompt to no longer ask for an imagePrompt
    const conceptGenerationPrompt = `
      You are an AI Creative Director. Your job is to take a user's raw idea and flesh it out into a compelling project concept.
      User's Idea: "${idea}"
      Based on this idea, generate a project title, a detailed description, and a list of 3-5 initial creative roles needed.
      Your response must be a valid JSON object matching this schema:
      {
        "title": "string",
        "description": "string",
        "rolesNeeded": ["string"]
      }`;
    
    const conceptResult = await model.generateContent(conceptGenerationPrompt);
    const conceptResponse = await conceptResult.response;
    const concept: ProjectConcept = extractJson(conceptResponse.text());

    // --- All image generation logic has been removed ---

    // Return only the text concept
    const data = { concept };

    return new Response(JSON.stringify(data), {
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