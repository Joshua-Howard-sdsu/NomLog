// src/components/food/FoodEntry.tsx
import React, { useState } from 'react';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { analyzeImage } from '@/lib/analyzeImage';
import type { FoodItem, MealType } from '@/types/food';

interface FoodEntryProps {
  onFoodLogged: (food: FoodItem, mealType: MealType) => void;
}

export default function FoodEntry({ onFoodLogged }: FoodEntryProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<MealType>('snacks');

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    try {
      // Convert the file to a Base64 string
      const base64String = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });

      // Call utility function to analyze the image
      const foodData = await analyzeImage(base64String);
      onFoodLogged(foodData, selectedMeal);
    } catch (error) {
      console.error('Failed to analyze image:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          {/* Dropdown for selecting meal type */}
          <label htmlFor="meal-type" className="text-sm font-medium">
            Select Meal Type:
          </label>
          <select
            id="meal-type"
            value={selectedMeal}
            onChange={(e) => setSelectedMeal(e.target.value as MealType)}
            className="w-full p-2 border rounded"
            aria-label="Meal type selection"
          >
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snacks">Snacks</option>
          </select>

          {/* Upload button */}
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              id="food-photo"
              onChange={handleImageUpload}
              className="hidden"
            />
            <Button
              asChild
              className="w-full"
              disabled={analyzing}
              aria-label="Upload food photo"
            >
              <label
                htmlFor="food-photo"
                className="cursor-pointer flex items-center justify-center gap-2"
              >
                <Camera className="w-5 h-5" />
                {analyzing ? 'Analyzing...' : 'Take Food Photo'}
              </label>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
