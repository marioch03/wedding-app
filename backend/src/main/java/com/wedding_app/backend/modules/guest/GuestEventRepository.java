package com.wedding_app.backend.modules.guest;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface GuestEventRepository extends JpaRepository<GuestEvent, UUID> {

  List<GuestEvent> findByGuestId(UUID guestId);

  Optional<GuestEvent> findByGuestIdAndEventId(UUID guestId, UUID eventId);
}
