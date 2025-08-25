import { GoogleGenAI, Type } from "@google/genai";
import type { SentimentAnalysisResult, Review } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const sentimentResponseSchema = {
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

const reviewGenerationSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            reviewerName: {
                type: Type.STRING,
                description: "A plausible, common-sounding name for the reviewer."
            },
            rating: {
                type: Type.NUMBER,
                description: "An integer rating from 1 to 5."
            },
            reviewText: {
                type: Type.STRING,
                description: "The full text of the review. Should be detailed and sound authentic."
            }
        },
        required: ['reviewerName', 'rating', 'reviewText']
    }
};

const reviewExtractionSchema = {
    type: Type.ARRAY,
    description: "A list of individual review texts found in the source document.",
    items: {
        type: Type.STRING,
        description: "The full text of a single, complete review."
    }
};


export const analyzeSentiment = async (text: string): Promise<SentimentAnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: text,
      config: {
        systemInstruction: "You are an expert sentiment analysis AI. Analyze the provided text and provide a detailed breakdown of its emotional tone. If the text is nonsensical, too short for analysis, or not in a language you can process, return a 'Neutral' sentiment, a score of 0, an empty emotions array, and a summary explaining why a proper analysis could not be performed. Your response must always be a JSON object that strictly adheres to the provided schema. Do not include any explanatory text outside of the JSON object.",
        responseMimeType: "application/json",
        responseSchema: sentimentResponseSchema,
        temperature: 0.2,
      },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
        throw new Error("The API returned an empty response. This may be due to the input text triggering safety filters.");
    }

    const result = JSON.parse(jsonText);
    
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
    if (error instanceof Error && error.message.includes("Rpc failed due to xhr error")) {
        throw new Error("A network or permission error occurred. This could be due to API key restrictions (like HTTP referrer), CORS issues, or a network problem. Please check your API key configuration and network connection.");
    }
    if (error instanceof SyntaxError) {
        throw new Error("Failed to parse the API response. The server may have returned an unexpected format.");
    }
    if (error instanceof Error) {
        throw new Error(`Failed to analyze sentiment: ${error.message}`);
    }
    throw new Error('An unknown error occurred during sentiment analysis.');
  }
};

export const generateReviews = async (topic: string): Promise<Review[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: topic,
            config: {
                systemInstruction: "You are a creative AI that generates realistic product and media reviews. For the given topic, generate exactly 5 diverse reviews. Include a mix of positive, negative, and neutral/mixed opinions. Provide integer ratings from 1 to 5 stars. Ensure the review text is realistic, detailed (between 50 and 150 words), and sounds like it was written by different people. Your response must be a JSON array of review objects, strictly adhering to the provided schema. Do not include any text outside the JSON array.",
                responseMimeType: "application/json",
                responseSchema: reviewGenerationSchema,
                temperature: 0.8,
            }
        });

        const jsonText = response.text.trim();
        if (!jsonText) {
            throw new Error("The API returned an empty response for review generation.");
        }

        const result = JSON.parse(jsonText);

        if (!Array.isArray(result)) {
            throw new Error("Invalid review response structure. Expected an array.");
        }

        return result as Review[];

    } catch (error) {
        console.error("Error generating reviews:", error);
        if (error instanceof Error && error.message.includes("Rpc failed due to xhr error")) {
            throw new Error("A network or permission error occurred while generating reviews. Please check your API key configuration and network connection.");
        }
        if (error instanceof SyntaxError) {
            throw new Error("Failed to parse the API response for reviews.");
        }
        if (error instanceof Error) {
            throw new Error(`Failed to generate reviews: ${error.message}`);
        }
        throw new Error('An unknown error occurred during review generation.');
    }
};

export const extractReviewsFromText = async (text: string): Promise<string[]> => {
    // If text is very short, assume it's a single review to save API calls.
    if (text.trim().split(/\s+/).length < 50) {
        return [text];
    }
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: text,
            config: {
                systemInstruction: "You are an expert text parser. Your task is to analyze the provided text and meticulously extract each individual review or distinct comment. Return the reviews as a JSON array of strings. Each string in the array must be a complete, self-contained review. If the text appears to be a single continuous review, return an array containing that one string. If no discernible reviews or comments are present, return an empty array. Do not add any commentary or text outside of the JSON array.",
                responseMimeType: "application/json",
                responseSchema: reviewExtractionSchema,
                temperature: 0.1,
            }
        });

        const jsonText = response.text.trim();
        if (!jsonText) {
            return [text]; // Fallback: if API returns empty, treat the whole text as one review
        }
        
        const result = JSON.parse(jsonText);
        if (!Array.isArray(result) || !result.every(item => typeof item === 'string')) {
            console.warn('API returned a non-string-array structure for review extraction, falling back to single review.');
            return [text];
        }

        if (result.length === 0) {
            return [text]; // Fallback: if Gemini finds no reviews, treat the whole text as one review
        }

        return result;

    } catch (error) {
        console.error("Error extracting reviews from text, falling back to single review:", error);
        // Fallback to treating the entire text as a single review in case of any error
        return [text];
    }
};
