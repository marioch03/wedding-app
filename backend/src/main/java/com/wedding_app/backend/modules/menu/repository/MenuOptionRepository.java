package com.wedding_app.backend.modules.menu;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MenuOptionRepository extends JpaRepository<MenuOption, UUID> {

  List<MenuOption> findByEventIdOrderByDisplayOrderAsc(UUID eventId);

  @Query("SELECT m FROM MenuOption m JOIN FETCH m.event ORDER BY m.event.displayOrder ASC, m.displayOrder ASC")
  List<MenuOption> findAllWithEventOrderByDisplayOrder();

  @Query("SELECT m FROM MenuOption m JOIN FETCH m.event WHERE m.event.id = :eventId ORDER BY m.displayOrder ASC")
  List<MenuOption> findByEventIdWithEventOrderByDisplayOrder(@Param("eventId") UUID eventId);
}

