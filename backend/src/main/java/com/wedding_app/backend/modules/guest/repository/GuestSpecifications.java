package com.wedding_app.backend.modules.guest.repository;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.domain.Specification;

import com.wedding_app.backend.modules.guest.entity.Guest;
import com.wedding_app.backend.modules.guest.entity.GuestType;

import jakarta.persistence.criteria.Predicate;

public final class GuestSpecifications {

  private GuestSpecifications() {}

  public static Specification<Guest> filter(
      UUID partyId,
      GuestType guestType,
      Boolean isPlusOne,
      Boolean hasDietaryRestrictions,
      String search) {

    return (root, query, cb) -> {
      List<Predicate> predicates = new ArrayList<>();

      if (partyId != null) {
        predicates.add(cb.equal(root.get("party").get("id"), partyId));
      }

      if (guestType != null) {
        predicates.add(cb.equal(root.get("guestType"), guestType));
      }

      if (isPlusOne != null) {
        predicates.add(cb.equal(root.get("isPlusOne"), isPlusOne));
      }

      if (hasDietaryRestrictions != null) {
        if (Boolean.TRUE.equals(hasDietaryRestrictions)) {
          predicates.add(cb.and(
              cb.isNotNull(root.get("dietaryRestrictions")),
              cb.notEqual(cb.trim(root.get("dietaryRestrictions")), "")
          ));
        } else {
          predicates.add(cb.or(
              cb.isNull(root.get("dietaryRestrictions")),
              cb.equal(cb.trim(root.get("dietaryRestrictions")), "")
          ));
        }
      }

      if (search != null && !search.isBlank()) {
        String pattern = "%" + search.trim().toLowerCase() + "%";
        predicates.add(cb.or(
            cb.like(cb.lower(root.get("firstName")), pattern),
            cb.like(cb.lower(root.get("lastName")), pattern),
            cb.like(cb.lower(root.get("email")), pattern)
        ));
      }

      return cb.and(predicates.toArray(new Predicate[0]));
    };
  }
}
