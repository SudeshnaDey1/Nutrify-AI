package com.nutrifyai.calc;

public class NutritionCalculator {
    /**
     * Calculates Basal Metabolic Rate (BMR) using the Mifflin-St Jeor Equation.
     * 
     * @param weight kg
     * @param height cm
     * @param age years
     * @param isMale boolean
     * @return BMR in kcal/day
     */
    public double calculateBMR(double weight, double height, int age, boolean isMale) {
        double bmr = (10 * weight) + (6.25 * height) - (5 * age);
        if (isMale) {
            bmr += 5;
        } else {
            bmr -= 161;
        }
        return bmr;
    }

    /**
     * Calculates Total Daily Energy Expenditure (TDEE).
     * 
     * @param bmr Basal Metabolic Rate
     * @param activityMultiplier (1.2 to 1.9)
     * @return TDEE in kcal/day
     */
    public double calculateTDEE(double bmr, double activityMultiplier) {
        return bmr * activityMultiplier;
    }

    /**
     * Recommends macronutrient breakdown based on goal.
     * 
     * @param tdee Total Daily Energy Expenditure
     * @param goal "weight_loss", "muscle_gain", "maintenance"
     * @return Array [protein_g, carbs_g, fats_g]
     */
    public double[] getMacroBreakdown(double tdee, String goal) {
        double proteinPct, carbPct, fatPct;
        
        switch (goal.toLowerCase()) {
            case "weight_loss":
                proteinPct = 0.40; carbPct = 0.30; fatPct = 0.30;
                break;
            case "muscle_gain":
                proteinPct = 0.30; carbPct = 0.50; fatPct = 0.20;
                break;
            default:
                proteinPct = 0.30; carbPct = 0.40; fatPct = 0.30;
                break;
        }

        double proteinG = (tdee * proteinPct) / 4;
        double carbsG = (tdee * carbPct) / 4;
        double fatsG = (tdee * fatPct) / 9;

        return new double[]{proteinG, carbsG, fatsG};
    }

    public static void main(String[] args) {
        NutritionCalculator calc = new NutritionCalculator();
        double bmr = calc.calculateBMR(70, 175, 25, true);
        double tdee = calc.calculateTDEE(bmr, 1.55);
        double[] macros = calc.getMacroBreakdown(tdee, "muscle_gain");

        System.out.println("BMR: " + bmr);
        System.out.println("TDEE: " + tdee);
        System.out.println("Protein: " + macros[0] + "g");
        System.out.println("Carbs: " + macros[1] + "g");
        System.out.println("Fats: " + macros[2] + "g");
    }
}
