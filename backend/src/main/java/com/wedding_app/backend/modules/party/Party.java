package com.wedding_app.backend.modules.party;

import java.time.Instant;

import com.wedding_app.backend.common.audit.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "party")
@Getter
@Setter
@NoArgsConstructor
public class Party extends BaseEntity {

  @Column(name = "display_name", nullable = false, length = 160)
  private String displayName;

  @Column(name = "rsvp_token", nullable = false, unique = true, length = 64)
  private String rsvpToken;

  @Column(name = "language_preference", nullable = false, length = 10)
  private String languagePreference = "es";

  @Column(name = "internal_notes")
  private String internalNotes;

  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false, length = 20)
  private PartyStatus status = PartyStatus.PENDING;

  @Column(name = "responded_at")
  private Instant respondedAt;
}
