package com.wedding_app.backend.modules.party;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.wedding_app.backend.modules.party.model.Party;

public interface PartyRepository extends JpaRepository<Party, UUID> {

  Optional<Party> findByRsvpToken(String rsvpToken);

  Optional<Party> findByRsvpTokenIgnoreCase(String rsvpToken);

  boolean existsByRsvpToken(String rsvpToken);

  boolean existsByRsvpTokenIgnoreCase(String rsvpToken);
}
