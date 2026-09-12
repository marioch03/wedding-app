package com.wedding_app.backend.modules.admin;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "admin_user")
@Getter
@Setter
@NoArgsConstructor
public class AdminUser {

  @Id
  @Column(name = "clerk_user_id", length = 100)
  private String clerkUserId;

  @Column(name = "email", length = 254)
  private String email;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  @PrePersist
  protected void onCreate() {
    this.createdAt = Instant.now();
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (!(o instanceof AdminUser other)) {
      return false;
    }
    return clerkUserId != null && clerkUserId.equals(other.clerkUserId);
  }

  @Override
  public int hashCode() {
    return getClass().hashCode();
  }
}
