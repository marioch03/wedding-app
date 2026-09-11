package com.wedding_app.backend.modules.party.model;

import java.time.Instant;

import com.wedding_app.backend.modules.event.Event;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "party_event")
@Getter
@Setter
@NoArgsConstructor
public class PartyEvent {

  @EmbeddedId
  private PartyEventId id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @MapsId("partyId")
  @JoinColumn(name = "party_id")
  private Party party;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @MapsId("eventId")
  @JoinColumn(name = "event_id")
  private Event event;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  public PartyEvent(Party party, Event event) {
    this.party = party;
    this.event = event;
    this.id = new PartyEventId(party.getId(), event.getId());
  }

  @PrePersist
  protected void onCreate() {
    this.createdAt = Instant.now();
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (!(o instanceof PartyEvent other)) {
      return false;
    }
    return id != null && id.equals(other.id);
  }

  @Override
  public int hashCode() {
    return getClass().hashCode();
  }
}
