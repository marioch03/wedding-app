package com.wedding_app.backend.modules.wedding;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import com.wedding_app.backend.common.audit.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "wedding")
@Getter
@Setter
@NoArgsConstructor
public class Wedding extends BaseEntity {

  @Column(name = "partner1_name", nullable = false, length = 120)
  private String partner1Name;

  @Column(name = "partner2_name", nullable = false, length = 120)
  private String partner2Name;

  @Column(name = "wedding_date", nullable = false)
  private LocalDate weddingDate;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "content", nullable = false, columnDefinition = "jsonb")
  private Map<String, Object> content = new HashMap<>();
}
