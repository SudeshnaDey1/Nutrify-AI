export interface AppUser {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface AuthSession {
  token: string;
  user: AppUser;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  email: string;
}

export interface Profile {
  id?: number;
  age?: number;
  gender?: string;
  weight?: number;
  height?: number;
  activityLevel?: string;
  goal?: string;
}

export interface MealPlan {
  id: number;
  planDate: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks: string;
  totalCalories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface FeedbackPayload {
  mealPlanId: number;
  rating: number;
  comments: string;
}
