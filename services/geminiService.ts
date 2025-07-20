import { GoogleGenAI, Type } from "@google/genai";
import { Collaborator, Task } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface TalentSearchResult {
  role: string;
  candidates: Collaborator[];
}

const findCollaboratorsResponseSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      role: { type: Type.STRING, description: 'The role being filled, e.g., "Sound Designer".' },
      candidates: {
        type: Type.ARRAY,
        description: 'A list of 2-3 suitable, fictional creators for this role.',
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: 'The full name of the fictional creator.' },
            role: { type: Type.STRING, description: 'The specific role this creator fits, matching the parent object.' },
            specialty: { type: Type.STRING, description: 'A key skill or specialty, e.g., "Character Rigging".' },
            bio: { type: Type.STRING, description: 'A short, compelling biography for this creator (2-3 sentences).' },
            compensationType: { type: Type.STRING, description: 'Either "paid" for professionals or "experience" for newcomers.'},
            hourlyRate: { type: Type.NUMBER, description: 'An hourly rate between 40-120 if compensationType is "paid". Null otherwise.' },
            portfolio: {
              type: Type.ARRAY,
              description: 'A list of 2-3 fictional portfolio projects relevant to their role.',
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: 'The title of the portfolio piece.' },
                  description: { type: Type.STRING, description: 'A brief description of the project.' },
                  imageUrl: { type: Type.STRING, description: 'A placeholder image URL from `https://picsum.photos/seed/{keyword}/600/400`.' },
                },
                required: ['title', 'description', 'imageUrl']
              }
            }
          },
          required: ['name', 'role', 'specialty', 'bio', 'compensationType', 'portfolio']
        }
      }
    },
    required: ['role', 'candidates']
  }
};

export const findCollaborators = async (
  projectDescription: string,
  rolesNeeded: string[]
): Promise<TalentSearchResult[]> => {
  try {
    const prompt = `
      You are an expert talent scout for creative projects.
      Based on the following project description and list of missing roles, generate a list of suitable, fictional creator portfolios.
      
      Project Description: "${projectDescription}"
      
      Missing Roles: ${rolesNeeded.join(', ')}
      
      For each role, create a list of 2-3 compelling and realistic fictional candidates.
      The candidates' portfolios should look like they belong to talented professionals or passionate newcomers.
      Some candidates should be professionals seeking 'paid' work with a reasonable hourly rate, while others should be talented individuals seeking 'experience'.
      Ensure the project examples in their portfolios are highly relevant to their specified role.
      For image URLs, create varied and specific seeds for picsum.photos, like 'https://picsum.photos/seed/futuristic-robot/600/400'.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: findCollaboratorsResponseSchema,
      }
    });

    const jsonText = response.text.trim();
    const results: TalentSearchResult[] = JSON.parse(jsonText);
    return results;
  } catch (error) {
    console.error("Error finding collaborators:", error);
    // In a real app, you might want to throw a custom error or return a specific error object.
    throw new Error("Failed to generate collaborators from AI. Please check your API key and network connection.");
  }
};

export const generateTasksForGoal = async (
  projectDescription: string,
  goal: string
): Promise<Pick<Task, 'title' | 'description'>[]> => {
  const taskSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'A concise, actionable title for the task.' },
      description: { type: Type.STRING, description: 'A brief description of what needs to be done for this task.' },
    },
    required: ['title', 'description'],
  };

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      tasks: {
        type: Type.ARRAY,
        description: 'A list of actionable sub-tasks to achieve the main goal.',
        items: taskSchema,
      },
    },
    required: ['tasks'],
  };

  try {
    const prompt = `
      You are an expert project manager and producer for creative projects.
      Based on the provided project description and a high-level goal, break the goal down into a list of smaller, actionable tasks.
      Each task should have a clear, concise title and a brief description. Do not assign the task to anyone.

      Project Description: "${projectDescription}"
      
      High-Level Goal: "${goal}"

      Generate a list of tasks to accomplish this goal.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const jsonText = response.text.trim();
    const result: { tasks: Pick<Task, 'title' | 'description'>[] } = JSON.parse(jsonText);
    return result.tasks || [];
  } catch (error) {
    console.error("Error generating tasks:", error);
    throw new Error("Failed to generate tasks from AI. Please try a different goal.");
  }
};

export interface ProjectConcept {
  title: string;
  description: string;
  rolesNeeded: string[];
  imagePrompt: string;
}

export const generateProjectConcept = async (idea: string): Promise<ProjectConcept> => {
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "A creative, catchy title for a project based on the user's idea." },
      description: { type: Type.STRING, description: "A detailed, one-paragraph project description that expands on the user's idea, outlining the premise, tone, and style." },
      rolesNeeded: {
        type: Type.ARRAY,
        description: "A list of 3-5 initial creative roles needed for this project (e.g., 'Concept Artist', '3D Modeler', 'Sound Designer').",
        items: { type: Type.STRING },
      },
      imagePrompt: { type: Type.STRING, description: "A rich, detailed, single-sentence prompt for an image generation AI to create concept art. It should describe the scene, style, lighting, and mood. For example: 'Epic cinematic concept art of a lone astronaut discovering a glowing alien artifact in a vast, dark cavern, digital painting, dramatic lighting, mysterious atmosphere'." },
    },
    required: ['title', 'description', 'rolesNeeded', 'imagePrompt'],
  };

  try {
    const prompt = `
      You are an AI Creative Director. Your job is to take a user's raw idea and flesh it out into a compelling project concept.
      
      User's Idea: "${idea}"

      Based on this idea, generate a project title, a detailed description, a list of initial roles needed, and a rich prompt for an AI image generator to create concept art.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as ProjectConcept;
  } catch (error) {
    console.error("Error generating project concept:", error);
    throw new Error("Failed to generate project concept from AI. Please try a different idea.");
  }
};

export const generateConceptArt = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '16:9',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      return response.generatedImages[0].image.imageBytes;
    } else {
      throw new Error("No image was generated.");
    }
  } catch (error) {
    console.error("Error generating concept art:", error);
    throw new Error("Failed to generate concept art from AI. The image generation service may be unavailable.");
  }
};