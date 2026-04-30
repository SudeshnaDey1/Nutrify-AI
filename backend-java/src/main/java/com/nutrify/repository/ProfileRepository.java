package com.nutrify.repository;

import com.nutrify.model.Profile;
import com.nutrify.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ProfileRepository extends JpaRepository<Profile, Long> {
    Optional<Profile> findByUser(User user);
}
