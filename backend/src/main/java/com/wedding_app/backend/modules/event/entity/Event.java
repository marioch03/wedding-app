package com.wedding_app.backend.modules.event.entity;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import com.wedding_app.backend.common.audit.BaseEntity;
import com.wedding_app.backend.modules.menu.entity.MenuOption;
import com.wedding_app.backend.modules.wedding.entity.Wedding;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "event")
@Getter
@Setter
@NoArgsConstructor
public class Event extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "wedding_id", nullable = false)
  private Wedding wedding;

  @Column(name = "name", nullable = false, length = 160)
  private String name;

  @Enumerated(EnumType.STRING)
  @Column(name = "event_type", nullable = false, length = 20)
  private EventType eventType;

  @Column(name = "description")
  private String description;

  @Column(name = "start_datetime", nullable = false)
  private Instant startDatetime;

  @Column(name = "end_datetime")
  private Instant endDatetime;

  @Column(name = "venue_name", length = 200)
  private String venueName;

  @Column(name = "address", length = 300)
  private String address;

  @Column(name = "latitude", precision = 9, scale = 6)
  private BigDecimal latitude;

  @Column(name = "longitude", precision = 9, scale = 6)
  private BigDecimal longitude;

  @Column(name = "display_order", nullable = false)
  private Integer displayOrder = 0;

  @Column(name = "is_public", nullable = false)
  private Boolean isPublic = true;

  @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
  @OrderBy("displayOrder ASC")
  private List<MenuOption> menuOptions = new ArrayList<>();
}
