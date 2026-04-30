# NutrifyAI Java Module

This module handles complex nutritional calculations and data processing for the NutrifyAI system.

## Features
- **BMR Calculation**: Uses the Mifflin-St Jeor Equation.
- **TDEE Calculation**: Estimates daily energy expenditure based on activity levels.
- **Macronutrient Recommendation**: Provides optimized protein, carb, and fat breakdowns based on health goals (Weight Loss, Muscle Gain, Maintenance).

## Build Instructions
This project uses Gradle. To build and run tests:
```bash
./gradlew build
./gradlew test
```

## Integration
The Node.js backend can interface with this module via CLI or by compiling it into a JAR and using a bridge.
