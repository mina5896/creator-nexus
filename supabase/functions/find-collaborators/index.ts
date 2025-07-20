import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from 'npm:@google/generative-ai@0.12.0';

serve(async (req) => {
  // 1. Get the API Key and request body
  const API_KEY = Deno.env.get('GEMINI_API_KEY');
  if (!API_KEY) {
    return new Response(JSON.stringify({ error: 'Missing GEMINI_API_KEY' }), { status: 500 });
  }

  const { projectDescription, rolesNeeded } = await req.json();
  if (!projectDescription || !rolesNeeded) {
    return new Response(JSON.stringify({ error: 'Missing projectDescription or rolesNeeded' }), { status: 400 });
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    // 2. Construct the prompt for the AI
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

    // 3. Call the AI and get the response
    const result = await model.generateContent(prompt, {
        safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ]
    });
    const response = await result.response;
    const candidates = JSON.parse(response.text());

    // 4. Return the result
    return new Response(JSON.stringify(candidates), {
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
