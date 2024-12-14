// src/components/food/FoodAnalysis.tsx
import React, { useState, ChangeEvent } from 'react';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import type { DetectedFood, AnalysisResult } from '@/types/food';

const FoodAnalysis = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const result = reader.result as string;
      setSelectedImage(result);
      await analyzeImage(result);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (base64Image: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image })
      });
      
      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const data = await response.json();
      setAnalysisResult(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
      setError(errorMessage);
      console.error('Analysis failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderNutritionInfo = (nutrition: DetectedFood['estimatedNutrition']) => (
    <div className="grid grid-cols-4 gap-2 mt-2 text-sm">
      <div>
        <div className="font-medium">{nutrition.calories}</div>
        <div className="text-gray-500">calories</div>
      </div>
      <div>
        <div className="font-medium">{nutrition.protein}g</div>
        <div className="text-gray-500">protein</div>
      </div>
      <div>
        <div className="font-medium">{nutrition.carbs}g</div>
        <div className="text-gray-500">carbs</div>
      </div>
      <div>
        <div className="font-medium">{nutrition.fats}g</div>
        <div className="text-gray-500">fats</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 w-full max-w-md mx-auto">
      {/* Image Upload */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          className="flex flex-col items-center justify-center cursor-pointer"
        >
          {selectedImage ? (
            <div className="relative w-full h-48">
              <Image
                src={selectedImage}
                alt="Selected food"
                fill
                className="object-cover rounded-lg"
              />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedImage(null);
                  setAnalysisResult(null);
                }}
                className="absolute top-2 right-2 p-1 bg-white rounded-full z-10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">Upload food photo</p>
            </div>
          )}
        </label>
      </div>

      {/* Loading and Error States */}
      {isLoading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
          <p className="mt-2 text-sm text-gray-500">Analyzing image...</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Analysis Results */}
      {analysisResult?.mainFood && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Main Food */}
              <div>
                <h3 className="font-semibold flex justify-between">
                  {analysisResult.mainFood.name}
                  <span className="text-sm text-gray-500">
                    {Math.round(analysisResult.mainFood.confidence * 100)}% confidence
                  </span>
                </h3>
                {renderNutritionInfo(analysisResult.mainFood.estimatedNutrition)}
              </div>

              {/* Alternative Foods */}
              {analysisResult.alternativeFoods && analysisResult.alternativeFoods.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-2">Also detected:</h4>
                  <div className="space-y-2">
                    {analysisResult.alternativeFoods.map((food, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <label className="text-sm flex justify-between w-full">
                          <span>{food.name}</span>
                          <span className="text-gray-500">
                            {Math.round(food.confidence * 100)}%
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FoodAnalysis;