package com.wedding_app.backend.modules.guest;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface GuestRepository extends JpaRepository<Guest, UUID>, JpaSpecificationExecutor<Guest> {

  List<Guest> findByPartyId(UUID partyId);

  List<Guest> findByPartyIdOrderByCreatedAtAsc(UUID partyId);
}


