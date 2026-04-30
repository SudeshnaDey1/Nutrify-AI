from flask import Flask, request, jsonify

app = Flask(__name__)

# Simple Rule-Based Dataset
MEAL_DATABASE = {
    "breakfast": [
        {"name": "Oatmeal with Berries", "calories": 300, "protein": 10, "carbs": 50, "fats": 5},
        {"name": "Scrambled Eggs and Toast", "calories": 400, "protein": 20, "carbs": 30, "fats": 15},
        {"name": "Greek Yogurt Parfait", "calories": 350, "protein": 25, "carbs": 40, "fats": 8}
    ],
    "lunch": [
        {"name": "Grilled Chicken Salad", "calories": 500, "protein": 40, "carbs": 20, "fats": 15},
        {"name": "Quinoa Bowl with Veggies", "calories": 450, "protein": 15, "carbs": 60, "fats": 12},
        {"name": "Turkey Sandwich", "calories": 550, "protein": 30, "carbs": 50, "fats": 18}
    ],
    "dinner": [
        {"name": "Baked Salmon with Asparagus", "calories": 600, "protein": 45, "carbs": 10, "fats": 25},
        {"name": "Lentil Soup", "calories": 400, "protein": 20, "carbs": 55, "fats": 5},
        {"name": "Stir-fry Tofu with Broccoli", "calories": 450, "protein": 25, "carbs": 30, "fats": 20}
    ],
    "snacks": [
        {"name": "Almonds (Handful)", "calories": 160, "protein": 6, "carbs": 6, "fats": 14},
        {"name": "Apple with Peanut Butter", "calories": 200, "protein": 4, "carbs": 25, "fats": 10}
    ]
}

def calculate_bmr(weight, height, age, gender):
    # Mifflin-St Jeor Equation
    if gender.lower() == 'male':
        return (10 * weight) + (6.25 * height) - (5 * age) + 5
    else:
        return (10 * weight) + (6.25 * height) - (5 * age) - 161

def get_activity_multiplier(level):
    multipliers = {
        "sedentary": 1.2,
        "lightly_active": 1.375,
        "moderately_active": 1.55,
        "very_active": 1.725,
        "extra_active": 1.9
    }
    return multipliers.get(level.lower(), 1.2)

@app.route('/generate-meal-plan', methods=['POST'])
def generate_meal_plan():
    data = request.json
    
    # Extract inputs
    age = data.get('age')
    weight = data.get('weight')
    height = data.get('height')
    gender = data.get('gender')
    activity_level = data.get('activity_level')
    goal = data.get('goal')
    feedback_history = data.get('feedback_history', [])

    # 1. Calculate BMR & TDEE
    bmr = calculate_bmr(weight, height, age, gender)
    tdee = bmr * get_activity_multiplier(activity_level)

    # 2. Adjust for Goal
    if goal == 'weight_loss':
        target_calories = tdee - 500
    elif goal == 'muscle_gain':
        target_calories = tdee + 500
    else:
        target_calories = tdee

    # 3. Simple Recommendation Logic (Rule-based)
    # In a real project, you could use KNN here to find meals closest to target macros
    plan = {
        "breakfast": MEAL_DATABASE["breakfast"][0],
        "lunch": MEAL_DATABASE["lunch"][0],
        "dinner": MEAL_DATABASE["dinner"][0],
        "snacks": MEAL_DATABASE["snacks"][0],
        "total_calories": target_calories,
        "macros": {
            "protein": (target_calories * 0.3) / 4,
            "carbs": (target_calories * 0.4) / 4,
            "fats": (target_calories * 0.3) / 9
        }
    }

    return jsonify(plan)

if __name__ == '__main__':
    app.run(port=5000, debug=True)
