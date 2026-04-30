package com.nutrify.controller;

import com.nutrify.model.Feedback;
import com.nutrify.model.MealPlan;
import com.nutrify.model.User;
import com.nutrify.repository.FeedbackRepository;
import com.nutrify.repository.MealPlanRepository;
import com.nutrify.repository.UserRepository;
import com.nutrify.service.CurrentUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/feedback")
public class FeedbackController {
    @Autowired
    FeedbackRepository feedbackRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    MealPlanRepository mealPlanRepository;

    @Autowired
    CurrentUserService currentUserService;

    @PostMapping("/submit")
    public ResponseEntity<?> submitFeedback(@RequestBody Map<String, Object> feedbackRequest) {
        User user = currentUserService.getCurrentUser();

        Long mealPlanId = Long.valueOf(feedbackRequest.get("mealPlanId").toString());
        MealPlan mealPlan = mealPlanRepository.findById(mealPlanId)
                .orElseThrow(() -> new RuntimeException("Meal Plan not found"));

        Feedback feedback = new Feedback();
        feedback.setUser(user);
        feedback.setMealPlan(mealPlan);
        feedback.setRating((Integer) feedbackRequest.get("rating"));
        feedback.setComments((String) feedbackRequest.get("comments"));

        feedbackRepository.save(feedback);
        return ResponseEntity.ok("Feedback submitted successfully!");
    }
}
