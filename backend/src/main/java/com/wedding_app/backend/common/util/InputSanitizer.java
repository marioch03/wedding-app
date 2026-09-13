package com.wedding_app.backend.common.util;

import java.util.regex.Pattern;

/**
 * Utilidad de saneamiento de texto para mitigar riesgos de inyección y XSS
 * en campos de texto libre introducidos por los usuarios (RSVP, notas, nombres, etc.).
 */
public final class InputSanitizer {

  private static final Pattern HTML_TAG_PATTERN = Pattern.compile("<[^>]*>", Pattern.DOTALL);
  private static final Pattern CONTROL_CHARS_PATTERN = Pattern.compile("[\\p{Cntrl}&&[^\r\n\t]]");

  private InputSanitizer() {
    // Utility class
  }

  /**
   * Sanea una cadena de texto eliminando etiquetas HTML/XML y caracteres de control no imprimibles,
   * aplicando trim() al resultado final.
   *
   * @param input Texto de entrada
   * @return Texto saneado o null si la entrada era null o queda vacía tras el saneamiento
   */
  public static String sanitize(String input) {
    if (input == null) {
      return null;
    }

    // 1. Eliminar caracteres de control peligrosos (incluyendo byte nulo \0)
    String cleaned = CONTROL_CHARS_PATTERN.matcher(input).replaceAll("");

    // 2. Eliminar cualquier etiqueta HTML/XML
    cleaned = HTML_TAG_PATTERN.matcher(cleaned).replaceAll("");

    // 3. Trim y verificación de contenido vacío
    cleaned = cleaned.trim();

    return cleaned.isEmpty() ? null : cleaned;
  }
}
