package com.wedding_app.backend.modules.party.model;

import java.io.Serializable;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PartyEventId implements Serializable {

  @Column(name = "party_id")
  private UUID partyId;

  @Column(name = "event_id")
  private UUID eventId;
}
