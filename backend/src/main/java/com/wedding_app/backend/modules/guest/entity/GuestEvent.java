package com.wedding_app.backend.modules.guest;

import java.time.Instant;
import java.util.UUID;

import com.wedding_app.backend.modules.event.Event;
import com.wedding_app.backend.modules.menu.MenuOption;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "guest_event")
@Getter
@Setter
@NoArgsConstructor
public class GuestEvent {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(name = "id", updatable = false, nullable = false)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "guest_id", nullable = false)
  private Guest guest;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "event_id", nullable = false)
  private Event event;

  @Column(name = "attending")
  private Boolean attending;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "menu_option_id")
  private MenuOption menuOption;

  @Column(name = "special_notes")
  private String specialNotes;

  @Column(name = "responded_at")
  private Instant respondedAt;

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (!(o instanceof GuestEvent other)) {
      return false;
    }
    return id != null && id.equals(other.id);
  }

  @Override
  public int hashCode() {
    return getClass().hashCode();
  }
}
