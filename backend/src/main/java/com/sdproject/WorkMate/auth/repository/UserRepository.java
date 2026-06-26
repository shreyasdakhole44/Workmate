package com.sdproject.WorkMate.auth.repository;

import com.sdproject.WorkMate.auth.entity.User;
import com.sdproject.WorkMate.auth.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByRoleIn(List<Role> roles);
}
