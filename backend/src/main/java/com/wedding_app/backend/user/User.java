package com.wedding_app.backend.user;

import com.wedding_app.backend.common.audit.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "users")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User extends BaseEntity {

  @Column(nullable = false, unique = true)
  private String email;

  @Column(name = "password_hash", nullable = false)
  private String passwordHash;

  @Column(name = "first_name", nullable = false, length = 150)
  private String firstName;

  @Column(name = "last_name", nullable = false, length = 150)
  private String lastName;

  @Column(nullable = false)
  private boolean enabled;

  public User(String email, String passwordHash, String firstName, String lastName) {
    this.email = email;
    this.passwordHash = passwordHash;
    this.firstName = firstName;
    this.lastName = lastName;
    this.enabled = true;
  }

  public void disable() {
    this.enabled = false;
  }

  public void enable() {
    this.enabled = true;
  }

  public void changePasswordHash(String newPasswordHash) {
    this.passwordHash = newPasswordHash;
  }
}