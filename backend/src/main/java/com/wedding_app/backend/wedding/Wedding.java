package com.wedding_app.backend.wedding;

import java.time.LocalDate;

import com.wedding_app.backend.common.audit.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "weddings")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Wedding extends BaseEntity {

  @Column(nullable = false, unique = true, length = 100)
  private String slug;

  @Column(name = "partner_1_name", nullable = false, length = 150)
  private String partner1Name;

  @Column(name = "partner_2_name", nullable = false, length = 150)
  private String partner2Name;

  @Setter
  @Column(name = "wedding_date")
  private LocalDate weddingDate;

  @Setter
  @Column(nullable = false, length = 50)
  private String timezone = "Europe/Madrid";

  @Setter
  @Column(nullable = false, length = 10)
  private String locale = "es";

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private WeddingStatus status;

  @Version
  @Column(nullable = false)
  private long version;

  public Wedding(String slug, String partner1Name, String partner2Name) {
    this.slug = slug;
    this.partner1Name = partner1Name;
    this.partner2Name = partner2Name;
    this.status = WeddingStatus.DRAFT;
  }

  public void publish() {
    if (this.status != WeddingStatus.DRAFT) {
      throw new IllegalStateException("Solo una boda en DRAFT puede publicarse");
    }
    this.status = WeddingStatus.PUBLISHED;
  }

  public void archive() {
    this.status = WeddingStatus.ARCHIVED;
  }
}
