package com.nutrify.controller;

import com.nutrify.model.MealPlan;
import com.nutrify.model.Profile;
import com.nutrify.model.User;
import com.nutrify.repository.MealPlanRepository;
import com.nutrify.repository.ProfileRepository;
import com.nutrify.repository.UserRepository;
import com.nutrify.service.CurrentUserService;
import com.nutrify.service.MealService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/meal")
public class MealController {
    @Autowired
    MealService mealService;

    @Autowired
    UserRepository userRepository;

    @Autowired
    ProfileRepository profileRepository;

    @Autowired
    MealPlanRepository mealPlanRepository;

    @Autowired
    CurrentUserService currentUserService;

    @PostMapping("/generate")
    public ResponseEntity<?> generateMeal() {
        User user = currentUserService.getCurrentUser();
        Profile profile = profileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Profile not found. Please setup profile first."));

        MealPlan plan = mealService.generateAndSaveMealPlan(profile);
        return ResponseEntity.ok(plan);
    }

    @GetMapping("/history")
    public ResponseEntity<List<MealPlan>> getHistory() {
        User user = currentUserService.getCurrentUser();
        return ResponseEntity.ok(mealPlanRepository.findByUserOrderByPlanDateDesc(user));
    }
}
