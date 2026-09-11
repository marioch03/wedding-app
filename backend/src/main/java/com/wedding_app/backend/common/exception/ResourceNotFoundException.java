package com.wedding_app.backend.common.exception;

public class ResourceNotFoundException extends RuntimeException {

  public ResourceNotFoundException(String message) {
    super(message);
  }

  public static ResourceNotFoundException of(String entityName, Object id) {
    return new ResourceNotFoundException(entityName + " no encontrado: " + id);
  }
}
