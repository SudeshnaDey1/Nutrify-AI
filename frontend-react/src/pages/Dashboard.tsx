import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Utensils, Flame, Scale, Activity } from 'lucide-react';

const Dashboard = () => {
    const [mealPlan, setMealPlan] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch latest meal plan from Java Backend
        fetch('/api/meal/history')
            .then(res => res.json())
            .then(data => {
                setMealPlan(data[0]); // Get most recent
                setLoading(false);
            });
    }, []);

    if (loading) return <div>Loading your nutrition plan...</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold">Your Nutrition Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-emerald-50 border-emerald-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Daily Calories</CardTitle>
                        <Flame className="w-4 h-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{mealPlan?.totalCalories.toFixed(0)} kcal</div>
                    </CardContent>
                </Card>
                {/* Add more cards for Protein, Carbs, Fats */}
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Utensils className="w-5 h-5" /> Today's Meal Plan
                </h2>
                <div className="grid gap-4">
                    {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((type) => (
                        <div key={type} className="p-4 bg-white rounded-xl border shadow-sm flex justify-between items-center">
                            <div>
                                <p className="text-xs font-bold text-emerald-600 uppercase">{type}</p>
                                <p className="font-medium">{mealPlan?.[type.toLowerCase()]}</p>
                            </div>
                            <Button variant="ghost" size="sm">View Recipe</Button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
