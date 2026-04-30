package com.nutrify.controller;

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

@RestController
@RequestMapping("/user")
public class ProfileController {
    @Autowired
    ProfileRepository profileRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    MealService mealService;

    @Autowired
    MealPlanRepository mealPlanRepository;

    @Autowired
    CurrentUserService currentUserService;

    @PostMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Profile profileRequest) {
        User user = currentUserService.getCurrentUser();

        Profile profile = profileRepository.findByUser(user).orElse(new Profile());
        profile.setUser(user);
        profile.setAge(profileRequest.getAge());
        profile.setGender(profileRequest.getGender());
        profile.setWeight(profileRequest.getWeight());
        profile.setHeight(profileRequest.getHeight());
        profile.setActivityLevel(profileRequest.getActivityLevel());
        profile.setGoal(profileRequest.getGoal());

        profileRepository.save(profile);
        if (mealPlanRepository.findByUserOrderByPlanDateDesc(user).isEmpty()) {
            mealService.generateAndSaveMealPlan(profile);
        }

        return ResponseEntity.ok(profile);
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        User user = currentUserService.getCurrentUser();
        return ResponseEntity.ok(profileRepository.findByUser(user).orElse(new Profile()));
    }
}
