package com.wedding_app.backend.modules.guest;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface GuestRepository extends JpaRepository<Guest, UUID> {

  List<Guest> findByPartyId(UUID partyId);
}
