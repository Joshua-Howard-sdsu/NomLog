// src/lib/food-analysis.ts

import OpenAI from 'openai';
import type { FoodAnalysisResult, FoodComponent, NutritionInfo } from '@/types/food';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const EDAMAM_APP_ID = process.env.EDAMAM_APP_ID;
const EDAMAM_APP_KEY = process.env.EDAMAM_APP_KEY;

async function getNutritionData(components: FoodComponent[]) {
  const total = { calories: 0, protein: 0, carbs: 0, fats: 0 };
  const byComponent: Record<string, NutritionInfo> = {};

  for (const component of components) {
    const query = `${component.quantity || '1'} ${component.name}`;
    
    const response = await fetch(
      `https://api.edamam.com/api/nutrition-data?` +
      `app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}&` +
      `ingr=${encodeURIComponent(query)}`
    );

    if (response.ok) {
      const data = await response.json();
      const nutrition: NutritionInfo = {
        calories: Math.round(data.calories || 0),
        protein: Math.round(data.totalNutrients?.PROCNT?.quantity || 0),
        carbs: Math.round(data.totalNutrients?.CHOCDF?.quantity || 0),
        fats: Math.round(data.totalNutrients?.FAT?.quantity || 0)
      };

      byComponent[component.name] = nutrition;
      
      // Add to totals
      total.calories += nutrition.calories;
      total.protein += nutrition.protein;
      total.carbs += nutrition.carbs;
      total.fats += nutrition.fats;
    }
  }

  return { total, byComponent };
}