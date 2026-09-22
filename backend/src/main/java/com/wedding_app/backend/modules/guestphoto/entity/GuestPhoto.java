package com.wedding_app.backend.modules.guestphoto.entity;

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
@Table(name = "guest_photo")
@Getter
@Setter
@NoArgsConstructor
public class GuestPhoto extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "wedding_id", nullable = false)
  private Wedding wedding;

  @Column(name = "image_url", nullable = false, length = 500)
  private String imageUrl;

  @Column(name = "uploader_name", nullable = false, length = 120)
  private String uploaderName;

  @Column(name = "caption", length = 500)
  private String caption;
}
