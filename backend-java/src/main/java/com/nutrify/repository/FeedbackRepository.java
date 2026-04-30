package com.nutrify.repository;

import com.nutrify.model.Feedback;
import com.nutrify.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByUser(User user);
}
