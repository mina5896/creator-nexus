import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { GoogleGenerativeAI } from 'npm:@google/generative-ai@0.12.0';

// Define the expected input and output shapes
interface ProjectConcept {
  title: string;
  description: string;
  rolesNeeded: string[];
  imagePrompt: string;
}

serve(async (req) => {
  // 1. Get the API Key and user's idea from the request
  const API_KEY = Deno.env.get('GEMINI_API_KEY');
  if (!API_KEY) {
    return new Response(JSON.stringify({ error: 'Missing GEMINI_API_KEY' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  const { idea } = await req.json();
  if (!idea) {
    return new Response(JSON.stringify({ error: 'Missing project idea in request body' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    // 2. Generate the structured project concept (title, description, etc.)
    const conceptGenerationPrompt = `
      You are an AI Creative Director. Your job is to take a user's raw idea and flesh it out into a compelling project concept.
      User's Idea: "${idea}"
      Based on this idea, generate a project title, a detailed description, a list of 3-5 initial creative roles needed, and a rich prompt for an AI image generator to create concept art.
      Your response must be a valid JSON object matching this schema:
      {
        "title": "string",
        "description": "string",
        "rolesNeeded": ["string"],
        "imagePrompt": "string"
      }`;
    
    const conceptResult = await model.generateContent(conceptGenerationPrompt);
    const conceptResponse = await conceptResult.response;
    const concept: ProjectConcept = JSON.parse(conceptResponse.text());

    // 3. Generate the concept art using the prompt from the previous step
    const imageModel = genAI.getGenerativeModel({ model: "imagen-3.0-generate-002" });
    const imageResult = await imageModel.generateContent(concept.imagePrompt);
    const imageResponse = await imageResult.response;
    // Assuming the API returns an object with a way to get the base64 string
    // This part might need adjustment based on the exact SDK response for imagen-3
    const imagePart = imageResponse.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    const conceptArtBase64 = imagePart?.inlineData?.data;

    if (!conceptArtBase64) {
        throw new Error("Failed to generate concept art image data.");
    }

    // 4. Return both the concept details and the image data
    const data = { concept, conceptArt: conceptArtBase64 };

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
