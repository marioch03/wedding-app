package com.wedding_app.backend.modules.guest;

import com.wedding_app.backend.common.audit.BaseEntity;
import com.wedding_app.backend.modules.party.Party;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "guest")
@Getter
@Setter
@NoArgsConstructor
public class Guest extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "party_id", nullable = false)
  private Party party;

  @Column(name = "first_name", length = 100)
  private String firstName;

  @Column(name = "last_name", length = 100)
  private String lastName;

  @Enumerated(EnumType.STRING)
  @Column(name = "guest_type", nullable = false, length = 20)
  private GuestType guestType = GuestType.ADULT;

  @Column(name = "is_plus_one", nullable = false)
  private Boolean isPlusOne = false;

  @Column(name = "email", length = 254)
  private String email;

  @Column(name = "phone", length = 30)
  private String phone;

  @Column(name = "dietary_restrictions")
  private String dietaryRestrictions;
}