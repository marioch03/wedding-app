package com.wedding_app.backend.modules.event;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface EventRepository extends JpaRepository<Event, UUID> {

  @Query("SELECT DISTINCT e FROM Event e LEFT JOIN FETCH e.menuOptions ORDER BY e.displayOrder ASC")
  List<Event> findAllWithMenuOptionsOrderByDisplayOrder();
}

