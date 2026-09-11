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

/**
 * Configuracion global del sitio publico. Fila unica en el MVP (single
 * wedding).
 *
 * `content` es el UNICO campo JSONB del dominio: contenido editable desde el
 * admin (hero, historia de la pareja, secciones, tema visual) sin necesidad
 * de desplegar cambios de codigo. Mapeado con el soporte nativo de JSON de
 * Hibernate 6 (@JdbcTypeCode(SqlTypes.JSON)) - no requiere dependencias
 * externas como hypersistence-utils, que solo hacia falta con Hibernate 5.
 */
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
