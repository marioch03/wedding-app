package com.wedding_app.backend.wedding;

import com.wedding_app.backend.common.audit.BaseEntity;
import com.wedding_app.backend.user.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "wedding_users", uniqueConstraints = @UniqueConstraint(name = "uq_wedding_user", columnNames = {
    "wedding_id", "user_id" }))
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class WeddingUser extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "wedding_id", nullable = false)
  private Wedding wedding;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private WeddingRole role;

  public WeddingUser(Wedding wedding, User user, WeddingRole role) {
    this.wedding = wedding;
    this.user = user;
    this.role = role;
  }

  public void changeRole(WeddingRole newRole) {
    this.role = newRole;
  }
}
