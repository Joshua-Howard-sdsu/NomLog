// src/app/api/analyze/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const MAX_RETRIES = 3;
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetries(fetchFn: () => Promise<unknown>, retries = MAX_RETRIES) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fetchFn();
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('429') && attempt < retries - 1) {
        console.warn(`Rate limit hit. Retrying request... (${attempt + 1})`);
        await sleep(1000 * (attempt + 1)); // Exponential backoff
      } else {
        throw error;
      }
    }
  }
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: //process.env.OPENAI_API_KEY
});

console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'Loaded' : 'Not Loaded');

// Function to get nutritional data from Edamam
async function getEdamamNutrition(foodName: string) {
  console.log(`Fetching nutritional data for: ${foodName}`);
  const url = `https://api.edamam.com/api/nutrition-data?app_id=${process.env.EDAMAM_APP_ID}&app_key=${process.env.EDAMAM_APP_KEY}&ingr=${encodeURIComponent(foodName)}`;

  const response = await fetch(url);
  if (!response.ok) {
    console.error(`Failed to fetch nutrition data for ${foodName}. Status: ${response.status}`);
    throw new Error('Failed to fetch nutrition data');
  }

  const data = await response.json();
  console.log(`Nutrition data for ${foodName}:`, data);

  return {
    calories: Math.round(data.calories || 0),
    protein: Math.round(data.totalNutrients?.PROCNT?.quantity || 0),
    carbs: Math.round(data.totalNutrients?.CHOCDF?.quantity || 0),
    fats: Math.round(data.totalNutrients?.FAT?.quantity || 0)
  };
}

export async function POST(request: Request) {
  try {
    console.log('Received POST request');
    const body = await request.json();
    console.log('Request body:', body);

    if (!body.image || !body.image.startsWith('data:image')) {
      console.warn('No valid base64-encoded image provided in request');
      return NextResponse.json(
        { error: 'No valid base64-encoded image provided' },
        { status: 400 }
      );
    }

    console.log('Image prepared for analysis');

    console.log('Sending text description to OpenAI using gpt-4o-mini for analysis');
    const visionResponse = await fetchWithRetries(() =>
      openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant. Identify the food based on the user's description."
          },
          {
            role: "user",
            content: body.image
          }
        ],
        max_completion_tokens: 50
      })
    );

    if (typeof visionResponse !== 'object' || visionResponse === null) {
      throw new Error('Invalid response from OpenAI');
    }

    const foodName = (visionResponse as { choices?: { message?: { content: string } }[] }).choices?.[0]?.message?.content || "Unknown Food";
    console.log(`Food identified as: ${foodName}`);

    console.log(`Fetching nutrition data for identified food: ${foodName}`);
    const nutrition = await getEdamamNutrition(foodName);
    console.log(`Nutrition data retrieved for ${foodName}:`, nutrition);

    console.log('Sending response with identified food and nutrition data');
    return NextResponse.json({
      name: foodName,
      nutrition,
      confidence: 1.0
    });

  } catch (error: unknown) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
};
