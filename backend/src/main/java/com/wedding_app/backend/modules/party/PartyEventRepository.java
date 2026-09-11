package com.wedding_app.backend.modules.party;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.wedding_app.backend.modules.party.model.PartyEvent;
import com.wedding_app.backend.modules.party.model.PartyEventId;

public interface PartyEventRepository extends JpaRepository<PartyEvent, PartyEventId> {

  @Query("SELECT pe FROM PartyEvent pe JOIN FETCH pe.event WHERE pe.party.id = :partyId")
  List<PartyEvent> findByPartyIdWithEvent(@Param("partyId") UUID partyId);
}
