package com.wedding_app.backend.modules.menu;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MenuOptionRepository extends JpaRepository<MenuOption, UUID> {

  List<MenuOption> findByEventIdOrderByDisplayOrderAsc(UUID eventId);
}
