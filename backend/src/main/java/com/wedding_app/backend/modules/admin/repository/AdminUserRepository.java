package com.wedding_app.backend.modules.admin.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.wedding_app.backend.modules.admin.entity.AdminUser;

public interface AdminUserRepository extends JpaRepository<AdminUser, String> {
  boolean existsByClerkUserId(String clerkUserId);
}
