package com.wedding_app.backend.modules.party;

import java.security.SecureRandom;
import org.springframework.stereotype.Component;

@Component
public class RsvpTokenGenerator {

  // Alfabeto de 30 caracteres alfanumericos excluyendo caracteres ambiguos (0/O, 1/I/L)
  private static final String ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
  private static final int TOKEN_LENGTH = 6;

  private final SecureRandom secureRandom = new SecureRandom();

  public String generate() {
    StringBuilder sb = new StringBuilder(TOKEN_LENGTH);
    for (int i = 0; i < TOKEN_LENGTH; i++) {
      int index = secureRandom.nextInt(ALPHABET.length());
      sb.append(ALPHABET.charAt(index));
    }
    return sb.toString();
  }
}
