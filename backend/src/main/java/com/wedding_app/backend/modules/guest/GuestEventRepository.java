package com.wedding_app.backend.modules.guest;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GuestEventRepository extends JpaRepository<GuestEvent, UUID> {

  List<GuestEvent> findByGuestId(UUID guestId);

  @Query("SELECT ge FROM GuestEvent ge JOIN FETCH ge.event LEFT JOIN FETCH ge.menuOption WHERE ge.guest.id = :guestId")
  List<GuestEvent> findByGuestIdWithDetails(@Param("guestId") UUID guestId);

  @Query("""
      SELECT ge FROM GuestEvent ge
      JOIN FETCH ge.guest g
      JOIN FETCH g.party p
      JOIN FETCH ge.event e
      LEFT JOIN FETCH ge.menuOption mo
      WHERE ge.attending = true
      ORDER BY e.displayOrder ASC, mo.displayOrder ASC, g.lastName ASC
      """)
  List<GuestEvent> findAllConfirmedAttendeesWithDetails();

  @Query("""
      SELECT ge FROM GuestEvent ge
      JOIN FETCH ge.guest g
      JOIN FETCH g.party p
      JOIN FETCH ge.event e
      LEFT JOIN FETCH ge.menuOption mo
      WHERE ge.attending = true AND ge.event.id = :eventId
      ORDER BY mo.displayOrder ASC, g.lastName ASC
      """)
  List<GuestEvent> findConfirmedAttendeesByEventWithDetails(@Param("eventId") UUID eventId);

  Optional<GuestEvent> findByGuestIdAndEventId(UUID guestId, UUID eventId);
}



