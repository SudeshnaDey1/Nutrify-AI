package com.nutrify.repository;

import com.nutrify.model.MealPlan;
import com.nutrify.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MealPlanRepository extends JpaRepository<MealPlan, Long> {
    List<MealPlan> findByUserOrderByPlanDateDesc(User user);
}
