package com.wedding_app.backend.common.util;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.jupiter.api.Test;

class InputSanitizerTest {

  @Test
  void testSanitize_nullReturnsNull() {
    assertNull(InputSanitizer.sanitize(null));
  }

  @Test
  void testSanitize_emptyOrWhitespaceReturnsNull() {
    assertNull(InputSanitizer.sanitize(""));
    assertNull(InputSanitizer.sanitize("   "));
  }

  @Test
  void testSanitize_stripsHtmlTags() {
    String input = "<script>alert('xss')</script>Vegetariano estricto";
    assertEquals("alert('xss')Vegetariano estricto", InputSanitizer.sanitize(input));

    String htmlImg = "Alergia a mariscos <img src='x' onerror='alert(1)'>";
    assertEquals("Alergia a mariscos", InputSanitizer.sanitize(htmlImg));

    String divP = "<div><p>Notas especiales</p></div>";
    assertEquals("Notas especiales", InputSanitizer.sanitize(divP));
  }

  @Test
  void testSanitize_stripsControlCharacters() {
    String input = "Hola\u0000Mundo\u0007!";
    assertEquals("HolaMundo!", InputSanitizer.sanitize(input));
  }

  @Test
  void testSanitize_preservesLegitimateTextAndAccents() {
    String input = "  ¡Hola! Soy celíaco y alérgico a los frutos secos (nuez, cacahuete).  ";
    assertEquals("¡Hola! Soy celíaco y alérgico a los frutos secos (nuez, cacahuete).",
        InputSanitizer.sanitize(input));
  }
}
