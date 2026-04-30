package com.nutrify.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "meal_plans")
@Data
public class MealPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;

    private LocalDate planDate = LocalDate.now();
    private String breakfast;
    private String lunch;
    private String dinner;
    private String snacks;
    private Double totalCalories;
    private Double protein;
    private Double carbs;
    private Double fats;
}
