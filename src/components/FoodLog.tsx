// src/components/FoodLog.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DailyLog, FoodItem } from '@/types/food';

interface FoodLogProps {
  meals: DailyLog;
}

export default function FoodLog({ meals }: FoodLogProps) {
  const calculateTotalNutrition = () => {
    const totals = { calories: 0, protein: 0, carbs: 0, fats: 0 };
    Object.values(meals).flat().forEach((item: FoodItem) => {
      totals.calories += item.nutrition.calories;
      totals.protein += item.nutrition.protein;
      totals.carbs += item.nutrition.carbs;
      totals.fats += item.nutrition.fats;
    });
    return totals;
  };

  const totals = calculateTotalNutrition();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-500">{totals.calories}</div>
              <div className="text-sm text-gray-600">Calories</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-500">{totals.protein}g</div>
              <div className="text-sm text-gray-600">Protein</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-500">{totals.carbs}g</div>
              <div className="text-sm text-gray-600">Carbs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-500">{totals.fats}g</div>
              <div className="text-sm text-gray-600">Fats</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {Object.entries(meals).map(([mealType, items]) => (
        <Card key={mealType}>
          <CardHeader>
            <CardTitle className="capitalize">{mealType}</CardTitle>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <div className="text-center text-gray-500">No items logged</div>
            ) : (
              <div className="space-y-3">
                {items.map((item: FoodItem, index: number) => (
                  <div key={item.id} className={index > 0 ? 'border-t pt-3' : ''}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-500">
                          P: {item.nutrition.protein}g • C: {item.nutrition.carbs}g • F: {item.nutrition.fats}g
                        </div>
                      </div>
                      <div className="text-gray-600">{item.nutrition.calories} cal</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}