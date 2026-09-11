package com.wedding_app.backend.modules.admin;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminUserRepository extends JpaRepository<AdminUser, String> {
  boolean existsByClerkUserId(String clerkUserId);
}
