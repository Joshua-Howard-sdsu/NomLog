// src/contexts/FoodContext.tsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Define FoodItem and State Interfaces
interface FoodItem {
  id: string;
  name: string;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  timestamp: string;
}

interface MealData {
  [key: string]: FoodItem[];
}

interface FoodState {
  meals: MealData;
  dailyTotals: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

// Actions for Reducer
type FoodAction =
  | { type: 'ADD_FOOD'; payload: { mealType: string; food: FoodItem } }
  | { type: 'REMOVE_FOOD'; payload: { mealType: string; foodId: string } }
  | { type: 'SET_MEALS'; payload: MealData }
  | { type: 'CALCULATE_TOTALS' };

// Initial State
const initialState: FoodState = {
  meals: {
    breakfast: [],
    lunch: [],
    snacks: [],
    dinner: [],
  },
  dailyTotals: {
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  },
};

// Context
const FoodContext = createContext<{
  state: FoodState;
  dispatch: React.Dispatch<FoodAction>;
} | null>(null);

// Reducer Function
function foodReducer(state: FoodState, action: FoodAction): FoodState {
  switch (action.type) {
    case 'ADD_FOOD': {
      const newMeals = {
        ...state.meals,
        [action.payload.mealType]: [
          ...state.meals[action.payload.mealType],
          action.payload.food,
        ],
      };
      return { ...state, meals: newMeals };
    }

    case 'REMOVE_FOOD': {
      const updatedMeals = {
        ...state.meals,
        [action.payload.mealType]: state.meals[action.payload.mealType].filter(
          (food) => food.id !== action.payload.foodId
        ),
      };
      return { ...state, meals: updatedMeals };
    }

    case 'SET_MEALS': {
      return { ...state, meals: action.payload };
    }

    case 'CALCULATE_TOTALS': {
      const totals = Object.values(state.meals).flat().reduce(
        (acc, food) => ({
          calories: acc.calories + food.nutrition.calories,
          protein: acc.protein + food.nutrition.protein,
          carbs: acc.carbs + food.nutrition.carbs,
          fats: acc.fats + food.nutrition.fats,
        }),
        { calories: 0, protein: 0, carbs: 0, fats: 0 }
      );
      return { ...state, dailyTotals: totals };
    }

    default:
      return state;
  }
}

// Provider Component
export function FoodProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(foodReducer, initialState);

  // Load meals from localStorage on mount
  useEffect(() => {
    const savedMeals = localStorage.getItem('meals');
    if (savedMeals) {
      dispatch({ type: 'SET_MEALS', payload: JSON.parse(savedMeals) });
    }
  }, []);

  // Save meals to localStorage whenever meals change
  useEffect(() => {
    localStorage.setItem('meals', JSON.stringify(state.meals));
    dispatch({ type: 'CALCULATE_TOTALS' });
  }, [state.meals]);

  return (
    <FoodContext.Provider value={{ state, dispatch }}>
      {children}
    </FoodContext.Provider>
  );
}

// Custom Hook
export function useFoodContext() {
  const context = useContext(FoodContext);
  if (!context) {
    throw new Error('useFoodContext must be used within a FoodProvider');
  }
  return context;
}
