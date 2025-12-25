import { GoogleGenAI, Type } from "@google/genai";
import { SimulationResult } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const MODEL_NAME = 'gemini-3-pro-preview';

export const generateModelLogic = async (problemDescription: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `You are an expert quantitative spatial economist (like Redding, Rossi-Hansberg, etc.).
      The user wants to study this problem: "${problemDescription}".
      
      Please perform a "Deep Thinking" process to:
      1. Define the economic agents (Workers, Firms).
      2. Set up the Utility Function (e.g., Cobb-Douglas over consumption and housing).
      3. Set up the Production Function.
      4. Define the Spatial Equilibrium conditions (Labor market clearing, Housing market clearing, Spatial indifference).
      
      Output the mathematical model in clear Markdown format. 
      IMPORTANT: Use standard LaTeX delimiters for math:
      - Use $$ ... $$ for block equations.
      - Use $ ... $ for inline equations.
      Do not generate data yet. Focus on the theory.`,
      config: {
        thinkingConfig: { thinkingBudget: 8192 },
        temperature: 0.2,
      }
    });
    return response.text || "No response generated.";
  } catch (error) {
    console.error("Error generating model logic:", error);
    throw error;
  }
};

export const generateSyntheticData = async (modelContext: string): Promise<SimulationResult> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Context: ${modelContext}
      
      Based on the theoretical model defined above, assume a system with 5 distinct locations (cities/regions).
      
      Task:
      1. Choose reasonable calibrated parameters (e.g., housing share alpha = 0.3, elasticity of substitution sigma = 4).
      2. Generate synthetic fundamental data (Productivity A, Amenities B) for these 5 locations.
      3. Solve for the equilibrium variables: Population (L), Wages (w), Rents (r). Ensure the spatial indifference condition holds as closely as possible given the fundamentals.
      
      Return ONLY a VALID JSON object with the following structure:
      {
        "description": "Brief summary of the equilibrium",
        "parameters": { "alpha": 0.3, "sigma": 4 },
        "locations": [
          { "id": "1", "name": "City A", "population": 100, "wages": 10, "rents": 5, "amenity": 1, "productivity": 1 },
          ...
        ],
        "totalWelfare": 1000
      }`,
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 4096 },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            parameters: { 
              type: Type.OBJECT, 
              properties: {
                alpha: { type: Type.NUMBER, description: "Housing share" },
                sigma: { type: Type.NUMBER, description: "Elasticity of substitution" }
              },
              required: ["alpha", "sigma"]
            },
            totalWelfare: { type: Type.NUMBER },
            locations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  population: { type: Type.NUMBER },
                  wages: { type: Type.NUMBER },
                  rents: { type: Type.NUMBER },
                  amenity: { type: Type.NUMBER },
                  productivity: { type: Type.NUMBER },
                },
                required: ["id", "name", "population", "wages", "rents", "amenity", "productivity"]
              }
            }
          },
          required: ["description", "parameters", "totalWelfare", "locations"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error generating data:", error);
    throw error;
  }
};

export const analyzeEquilibrium = async (modelContext: string, data: SimulationResult): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Theoretical Context: ${modelContext}
      
      Simulated Data: ${JSON.stringify(data)}
      
      Task:
      As a Quantitative Spatial Economist, provide a short, professional analysis of this equilibrium.
      1. **Spatial Indifference Check**: Verify if utility is equalized across locations (Real Wage = Nominal Wage / Rent^alpha).
      2. **Drivers of Density**: Explain if population distribution is driven more by productivity (A) or amenities (B) in this specific simulation.
      3. **Wage-Rent Gradient**: Comment on the relationship between local wages and land rents.

      Output as formatted Markdown. Keep it concise (approx 200 words).`,
      config: {
        thinkingConfig: { thinkingBudget: 2048 },
        temperature: 0.2,
      }
    });
    return response.text || "Analysis could not be generated.";
  } catch (error) {
    console.error("Error generating analysis:", error);
    return "Error generating analysis report.";
  }
};

export const runCounterfactual = async (
  originalData: SimulationResult,
  changeDescription: string
): Promise<SimulationResult> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Current Equilibrium: ${JSON.stringify(originalData)}
      
      User Counterfactual Request: "${changeDescription}"
      
      Task:
      1. "Think" about how this shock affects the general equilibrium conditions (wages, rents, population movements).
      2. Re-calculate the new equilibrium variables (L, w, r) for all locations based on the shock. Keep fundamentals (A, B) constant unless the shock explicitly changes them.
      3. Return the NEW equilibrium as JSON.`,
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 4096 },
        responseSchema: {
            type: Type.OBJECT,
            properties: {
              description: { type: Type.STRING },
              parameters: { 
                  type: Type.OBJECT, 
                  properties: {
                      alpha: { type: Type.NUMBER, description: "Housing share" },
                      sigma: { type: Type.NUMBER, description: "Elasticity of substitution" }
                  },
                  required: ["alpha", "sigma"]
              },
              totalWelfare: { type: Type.NUMBER },
              locations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    name: { type: Type.STRING },
                    population: { type: Type.NUMBER },
                    wages: { type: Type.NUMBER },
                    rents: { type: Type.NUMBER },
                    amenity: { type: Type.NUMBER },
                    productivity: { type: Type.NUMBER },
                  },
                  required: ["id", "name", "population", "wages", "rents", "amenity", "productivity"]
                }
              }
            },
            required: ["description", "parameters", "totalWelfare", "locations"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error generating counterfactual:", error);
    throw error;
  }
};