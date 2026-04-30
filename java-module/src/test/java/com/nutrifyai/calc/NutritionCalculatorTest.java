package com.nutrifyai.calc;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class NutritionCalculatorTest {
    @Test
    public void testBMRCalculation() {
        NutritionCalculator calc = new NutritionCalculator();
        double bmr = calc.calculateBMR(70, 175, 25, true);
        assertEquals(1723.75, bmr, 0.01);
    }

    @Test
    public void testTDEECalculation() {
        NutritionCalculator calc = new NutritionCalculator();
        double tdee = calc.calculateTDEE(2000, 1.55);
        assertEquals(3100, tdee, 0.01);
    }
}
