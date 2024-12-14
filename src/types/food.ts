// src/types/food.ts

// Basic nutrition information structure
export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

// Individual food item structure
export interface FoodItem {
  id: string;
  name: string;
  nutrition: NutritionInfo;
  timestamp: string;
  imageUrl?: string;
}

// Available meal types
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

// Daily log structure for meals
export interface DailyLog {
  [key: string]: FoodItem[];
}

// Food detection and analysis types
export interface DetectedFood {
  name: string;
  confidence: number;
  estimatedNutrition: NutritionInfo;
}

// Analysis response structure
export interface AnalysisResult {
  mainFood: DetectedFood;
  alternativeFoods?: DetectedFood[];
  rawLabels?: Array<{
    description: string;
    score: number;
  }>;
}

// API response type
export interface AnalyzeResponse {
  name: string;
  nutrition: NutritionInfo;
  confidence: number;
  alternativeFoods?: DetectedFood[];
}

// Food component types for detailed analysis
export interface FoodComponent {
  name: string;
  quantity: string;
  type: 'main' | 'topping' | 'side' | 'garnish';
}

// Response structure for component-based nutrition
export interface ComponentNutrition {
  total: NutritionInfo;
  byComponent: Record<string, NutritionInfo>;
}