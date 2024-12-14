'use client';

import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import Image from 'next/image';
import type { FoodItem } from '@/types/food';

interface MealLog {
  breakfast: FoodItem[];
  lunch: FoodItem[];
  dinner: FoodItem[];
  snacks: FoodItem[];
}

export default function Home() {
  const [meals, setMeals] = useState<MealLog>({
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: []
  });

  const [analyzing, setAnalyzing] = useState(false);
  const [currentFood, setCurrentFood] = useState<FoodItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/') || file.size > 10 * 1024 * 1024) {
        setError('Invalid file. Please upload an image less than 10MB.');
        return;
      }
      analyzeImage(file);
    }
  };

  const analyzeImage = async (file: File) => {
    setAnalyzing(true);
    setError(null);
    try {
      const base64String = await fileToBase64(file);
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64String }),
      });

      if (!response.ok) throw new Error('Failed to analyze image');

      const data = await response.json();
      setCurrentFood({
        id: Date.now().toString(),
        name: data.name,
        nutrition: data.nutrition,
        timestamp: new Date().toISOString(),
        imageUrl: base64String,
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error analyzing image');
    } finally {
      setAnalyzing(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject('Error converting file');
      reader.readAsDataURL(file);
    });

  const addToMeal = (mealType: keyof MealLog) => {
    if (currentFood) {
      setMeals(prev => ({
        ...prev,
        [mealType]: [...prev[mealType], currentFood]
      }));
      setCurrentFood(null);
    }
  };

  return (
    <main className="max-w-4xl mx-auto p-4">
      {/* Image Upload Section */}
      <div className="mb-6 border-2 border-dashed rounded-lg p-4">
        <input
          type="file"
          accept="image/*"
          id="food-image"
          onChange={handleImageUpload}
          disabled={analyzing}
          className="hidden"
        />
        <label
          htmlFor="food-image"
          className="flex flex-col items-center justify-center w-full h-32 cursor-pointer bg-gray-50 hover:bg-gray-100"
        >
          {analyzing ? 'Analyzing...' : 'Upload food photo'}
        </label>
      </div>

      {/* Display Error or Current Food */}
      {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>}
      {currentFood && <div>{/* Render current food info */}</div>}
    </main>
  );
}
