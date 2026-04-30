import React from 'react';
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ProfileSetup = () => {
    const { register, handleSubmit } = useForm();

    const onSubmit = async (data) => {
        const response = await fetch('/api/user/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (response.ok) {
            window.location.href = '/dashboard';
        }
    };

    return (
        <div className="max-w-md mx-auto p-8 bg-white rounded-2xl shadow-xl mt-10">
            <h2 className="text-2xl font-bold mb-6">Setup Your Health Profile</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Age</Label>
                        <Input type="number" {...register("age")} required />
                    </div>
                    <div className="space-y-2">
                        <Label>Gender</Label>
                        <select {...register("gender")} className="w-full p-2 border rounded-md">
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Weight (kg)</Label>
                        <Input type="number" step="0.1" {...register("weight")} required />
                    </div>
                    <div className="space-y-2">
                        <Label>Height (cm)</Label>
                        <Input type="number" {...register("height")} required />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Activity Level</Label>
                    <select {...register("activityLevel")} className="w-full p-2 border rounded-md">
                        <option value="sedentary">Sedentary</option>
                        <option value="lightly_active">Lightly Active</option>
                        <option value="moderately_active">Moderately Active</option>
                        <option value="very_active">Very Active</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <Label>Fitness Goal</Label>
                    <select {...register("goal")} className="w-full p-2 border rounded-md">
                        <option value="weight_loss">Weight Loss</option>
                        <option value="muscle_gain">Muscle Gain</option>
                        <option value="maintenance">Maintenance</option>
                    </select>
                </div>

                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                    Generate My Plan
                </Button>
            </form>
        </div>
    );
};

export default ProfileSetup;
