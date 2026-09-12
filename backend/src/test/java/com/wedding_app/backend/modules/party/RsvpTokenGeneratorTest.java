package com.wedding_app.backend.modules.party;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class RsvpTokenGeneratorTest {

  private RsvpTokenGenerator generator;

  @BeforeEach
  void setUp() {
    generator = new RsvpTokenGenerator();
  }

  @Test
  void generate_returnsSixCharUppercaseAlphanumericToken() {
    String token = generator.generate();

    assertThat(token).isNotNull().hasSize(6);
    // Solo debe contener caracteres del alfabeto permitido
    assertThat(token).matches("^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$");
    // No debe contener caracteres ambiguos
    assertThat(token).doesNotContain("0", "O", "1", "I", "L");
  }

  @Test
  void generate_producesDistinctTokens() {
    Set<String> generatedTokens = new HashSet<>();
    for (int i = 0; i < 50; i++) {
      generatedTokens.add(generator.generate());
    }
    // Con 50 tokens no deberia haber colisiones en un espacio de 729 millones
    assertThat(generatedTokens).hasSize(50);
  }
}
