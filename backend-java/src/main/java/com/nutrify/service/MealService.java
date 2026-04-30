package com.nutrify.service;

import com.nutrify.model.MealPlan;
import com.nutrify.model.Profile;
import com.nutrify.repository.MealPlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.Map;

@Service
public class MealService {

    @Autowired
    private MealPlanRepository mealPlanRepository;

    private final String ML_ENGINE_URL = "http://localhost:5000/generate-meal-plan";

    public MealPlan generateAndSaveMealPlan(Profile profile) {
        RestTemplate restTemplate = new RestTemplate();
        MealPlan plan = new MealPlan();
        plan.setUser(profile.getUser());

        try {
            Map<String, Object> response = restTemplate.postForObject(ML_ENGINE_URL, buildRequest(profile), Map.class);
            populateFromMlResponse(plan, response);
        } catch (RestClientException | IllegalArgumentException ex) {
            populateFallbackPlan(plan, profile);
        }

        return mealPlanRepository.save(plan);
    }

    private Map<String, Object> buildRequest(Profile profile) {
        Map<String, Object> request = new HashMap<>();
        request.put("age", profile.getAge());
        request.put("weight", profile.getWeight());
        request.put("height", profile.getHeight());
        request.put("gender", profile.getGender());
        request.put("activity_level", profile.getActivityLevel());
        request.put("goal", profile.getGoal());
        return request;
    }

    @SuppressWarnings("unchecked")
    private void populateFromMlResponse(MealPlan plan, Map<String, Object> response) {
        if (response == null) {
            throw new IllegalArgumentException("Empty response from ML engine");
        }

        plan.setBreakfast((String) ((Map<String, Object>) response.get("breakfast")).get("name"));
        plan.setLunch((String) ((Map<String, Object>) response.get("lunch")).get("name"));
        plan.setDinner((String) ((Map<String, Object>) response.get("dinner")).get("name"));
        plan.setSnacks((String) ((Map<String, Object>) response.get("snacks")).get("name"));
        plan.setTotalCalories(toDouble(response.get("total_calories")));

        Map<String, Object> macros = (Map<String, Object>) response.get("macros");
        plan.setProtein(toDouble(macros.get("protein")));
        plan.setCarbs(toDouble(macros.get("carbs")));
        plan.setFats(toDouble(macros.get("fats")));
    }

    private void populateFallbackPlan(MealPlan plan, Profile profile) {
        String goal = profile.getGoal() == null ? "maintenance" : profile.getGoal();
        if ("weight_loss".equalsIgnoreCase(goal)) {
            plan.setBreakfast("Greek yogurt bowl with berries");
            plan.setLunch("Grilled chicken salad with olive oil dressing");
            plan.setDinner("Baked salmon with steamed vegetables");
            plan.setSnacks("Apple slices with almonds");
            plan.setTotalCalories(1800.0);
            plan.setProtein(135.0);
            plan.setCarbs(140.0);
            plan.setFats(70.0);
            return;
        }

        if ("muscle_gain".equalsIgnoreCase(goal)) {
            plan.setBreakfast("Oats with banana, peanut butter, and milk");
            plan.setLunch("Chicken rice bowl with mixed vegetables");
            plan.setDinner("Paneer pasta with roasted vegetables");
            plan.setSnacks("Protein smoothie with nuts");
            plan.setTotalCalories(2600.0);
            plan.setProtein(165.0);
            plan.setCarbs(290.0);
            plan.setFats(85.0);
            return;
        }

        plan.setBreakfast("Vegetable omelette with whole-grain toast");
        plan.setLunch("Dal, brown rice, and cucumber salad");
        plan.setDinner("Grilled tofu with quinoa and sauteed greens");
        plan.setSnacks("Mixed fruit and yogurt");
        plan.setTotalCalories(2200.0);
        plan.setProtein(120.0);
        plan.setCarbs(230.0);
        plan.setFats(75.0);
    }

    private Double toDouble(Object value) {
        if (value instanceof Number number) {
            return number.doubleValue();
        }
        if (value != null) {
            return Double.valueOf(value.toString());
        }
        return 0.0;
    }
}
