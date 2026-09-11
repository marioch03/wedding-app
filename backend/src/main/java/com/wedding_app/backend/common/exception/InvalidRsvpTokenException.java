package com.wedding_app.backend.common.exception;

public class InvalidRsvpTokenException extends ResourceNotFoundException {

  private static final String MESSAGE = "Enlace de invitación no válido o caducado";

  public InvalidRsvpTokenException() {
    super(MESSAGE);
  }
}