
import { GoogleGenAI, Type } from "@google/genai";
import type { SentimentAnalysisResult } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    overallSentiment: { 
      type: Type.STRING, 
      description: 'The overall sentiment of the text. Must be one of: Positive, Negative, Neutral, Mixed.' 
    },
    sentimentScore: { 
      type: Type.NUMBER, 
      description: 'A score from -1.0 (very negative) to 1.0 (very positive), representing the intensity of the sentiment.' 
    },
    summary: { 
      type: Type.STRING, 
      description: 'A brief, neutral summary of the key points in the text.' 
    },
    emotions: {
      type: Type.ARRAY,
      description: 'A list of detected emotions and their confidence scores.',
      items: {
        type: Type.OBJECT,
        properties: {
          name: { 
            type: Type.STRING, 
            description: 'The name of the emotion (e.g., Joy, Anger, Sadness, Surprise).' 
          },
          score: { 
            type: Type.NUMBER, 
            description: 'The confidence score for this emotion, from 0 to 1.' 
          }
        },
        required: ['name', 'score']
      }
    }
  },
  required: ['overallSentiment', 'sentimentScore', 'summary', 'emotions']
};

export const analyzeSentiment = async (text: string): Promise<SentimentAnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze the sentiment of the following text: "${text}"`,
      config: {
        systemInstruction: "You are an expert sentiment analysis AI. Analyze the provided text and provide a detailed breakdown of its emotional tone. If the text is nonsensical, too short for analysis, or not in a language you can process, return a 'Neutral' sentiment, a score of 0, an empty emotions array, and a summary explaining why a proper analysis could not be performed. Your response must always be a JSON object that strictly adheres to the provided schema. Do not include any explanatory text outside of the JSON object.",
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2,
      },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
        throw new Error("The API returned an empty response. This may be due to the input text triggering safety filters.");
    }

    const result = JSON.parse(jsonText);
    
    // Basic validation to ensure the result matches the expected structure
    if (
      !result.overallSentiment ||
      typeof result.sentimentScore !== 'number' ||
      !result.summary ||
      !Array.isArray(result.emotions)
    ) {
      throw new Error('Invalid response structure from API. The format of the data is not as expected.');
    }
    
    return result as SentimentAnalysisResult;

  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    if (error instanceof SyntaxError) {
        throw new Error("Failed to parse the API response. The server may have returned an unexpected format.");
    }
    if (error instanceof Error) {
        throw new Error(`Failed to analyze sentiment: ${error.message}`);
    }
    throw new Error('An unknown error occurred during sentiment analysis.');
  }
};