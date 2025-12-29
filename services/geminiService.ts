
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { ProductInfo } from "../types";

export const analyzeProductImage = async (base64Image: string): Promise<ProductInfo> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Analyze this image of a food product. Focus on the barcode, nutritional label, and ingredients list.
    1. Identify product name, brand, and the exact barcode number.
    2. Extract manufacturer and country of origin.
    3. Determine if it is Vegan and Gluten-Free.
    4. Provide a health score (0-100) and a label (Excelente, Bueno, Moderado, Pobre).
    5. Write a professional "Análisis de Ingredientes" paragraph.
    6. List "POSITIVO" points (health benefits, clean ingredients).
    7. List "A CONSIDERAR" points (additives, high sugar/salt, processing).
    8. Detailed list of ingredients with categories (Safe, Caution, Avoid).

    Return the information in Spanish for labels and UI strings where appropriate, but maintain the JSON structure.
  `;

  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64Image,
    },
  };

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: { parts: [imagePart, { text: prompt }] },
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          brand: { type: Type.STRING },
          barcode: { type: Type.STRING },
          manufacturer: { type: Type.STRING },
          countryOfOrigin: { type: Type.STRING },
          isOrganic: { type: Type.BOOLEAN },
          isVegan: { type: Type.BOOLEAN },
          isGlutenFree: { type: Type.BOOLEAN },
          healthScore: { type: Type.NUMBER },
          healthLabel: { type: Type.STRING },
          summary: { type: Type.STRING },
          positivePoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          cautionPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          nutritionalHighlights: { type: Type.ARRAY, items: { type: Type.STRING } },
          ingredients: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                category: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              propertyOrdering: ["name", "category", "description"]
            }
          }
        },
        propertyOrdering: ["name", "brand", "barcode", "manufacturer", "countryOfOrigin", "isOrganic", "isVegan", "isGlutenFree", "healthScore", "healthLabel", "summary", "positivePoints", "cautionPoints", "nutritionalHighlights", "ingredients"]
      },
    },
  });

  const productData = JSON.parse(response.text || '{}');
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  
  const sources = groundingChunks
    .filter((chunk: any) => chunk.web)
    .map((chunk: any) => ({
      title: chunk.web.title,
      uri: chunk.web.uri,
    }));

  return {
    ...productData,
    sources: sources,
  };
};
