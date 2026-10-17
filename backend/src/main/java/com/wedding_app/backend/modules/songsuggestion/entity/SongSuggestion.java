package com.wedding_app.backend.modules.songsuggestion.entity;

import com.wedding_app.backend.common.audit.BaseEntity;
import com.wedding_app.backend.modules.wedding.entity.Wedding;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "song_suggestion")
@Getter
@Setter
@NoArgsConstructor
public class SongSuggestion extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "wedding_id", nullable = false)
  private Wedding wedding;

  @Column(name = "guest_name", nullable = false, length = 100)
  private String guestName;

  @Column(name = "song_request", nullable = false, length = 250)
  private String songRequest;
}
