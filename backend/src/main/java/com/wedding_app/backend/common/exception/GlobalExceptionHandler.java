package com.wedding_app.backend.common.exception;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import com.wedding_app.backend.common.error.ErrorResponse;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;

@RestControllerAdvice
public class GlobalExceptionHandler {

  private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

  @ExceptionHandler(ResourceNotFoundException.class)
  public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex, HttpServletRequest request) {
    return build(HttpStatus.NOT_FOUND, ex.getMessage(), request, null);
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex,
      HttpServletRequest request) {
    Map<String, String> fieldErrors = new LinkedHashMap<>();
    for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
      fieldErrors.put(fieldError.getField(), fieldError.getDefaultMessage());
    }
    return build(HttpStatus.BAD_REQUEST, "Error de validación", request, fieldErrors);
  }

  @ExceptionHandler(ConstraintViolationException.class)
  public ResponseEntity<ErrorResponse> handleConstraintViolation(ConstraintViolationException ex,
      HttpServletRequest request) {
    Map<String, String> fieldErrors = new LinkedHashMap<>();
    ex.getConstraintViolations().forEach(violation -> {
      fieldErrors.put(violation.getPropertyPath().toString(), violation.getMessage());
    });
    return build(HttpStatus.BAD_REQUEST, "Error de validación en parámetros", request, fieldErrors);
  }

  @ExceptionHandler(HttpMessageNotReadableException.class)
  public ResponseEntity<ErrorResponse> handleMessageNotReadable(HttpMessageNotReadableException ex,
      HttpServletRequest request) {
    log.warn("Petición con formato inválido en {}: {}", request.getRequestURI(), ex.getMessage());
    return build(HttpStatus.BAD_REQUEST, "Cuerpo de la petición inválido o formato JSON incorrecto", request, null);
  }

  @ExceptionHandler(MethodArgumentTypeMismatchException.class)
  public ResponseEntity<ErrorResponse> handleTypeMismatch(MethodArgumentTypeMismatchException ex,
      HttpServletRequest request) {
    String expectedType = ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "otro tipo";
    String message = "Parámetro '" + ex.getName() + "' inválido: se esperaba " + expectedType;
    return build(HttpStatus.BAD_REQUEST, message, request, null);
  }

  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex, HttpServletRequest request) {
    return build(HttpStatus.BAD_REQUEST, ex.getMessage(), request, null);
  }

  @ExceptionHandler(AccessDeniedException.class)
  public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex, HttpServletRequest request) {
    log.warn("Acceso denegado en {}: {}", request.getRequestURI(), ex.getMessage());
    return build(HttpStatus.FORBIDDEN, "Acceso denegado: no dispone de los permisos necesarios", request, null);
  }

  @ExceptionHandler(AuthenticationException.class)
  public ResponseEntity<ErrorResponse> handleAuthentication(AuthenticationException ex, HttpServletRequest request) {
    log.warn("Fallo de autenticación en {}: {}", request.getRequestURI(), ex.getMessage());
    return build(HttpStatus.UNAUTHORIZED, "No autenticado: credenciales o token inválido o ausente", request, null);
  }

  @ExceptionHandler(MaxUploadSizeExceededException.class)
  public ResponseEntity<ErrorResponse> handleMaxUploadSize(MaxUploadSizeExceededException ex,
      HttpServletRequest request) {
    log.warn("Tamaño de archivo excedido en {}: {}", request.getRequestURI(), ex.getMessage());
    return build(HttpStatus.PAYLOAD_TOO_LARGE, "El archivo subido supera el límite máximo permitido (10MB)", request, null);
  }

  @ExceptionHandler(DataIntegrityViolationException.class)
  public ResponseEntity<ErrorResponse> handleDataIntegrityViolation(DataIntegrityViolationException ex,
      HttpServletRequest request) {
    // Se registra el error internamente con detalle completo pero NUNCA se devuelven nombres de tablas o SQL al cliente
    log.error("Violación de integridad de datos en {}: {}", request.getRequestURI(), ex.getMessage(), ex);
    return build(HttpStatus.CONFLICT,
        "Conflicto de integridad de datos: el recurso ya existe o tiene restricciones asociadas", request, null);
  }

  @ExceptionHandler(DataAccessException.class)
  public ResponseEntity<ErrorResponse> handleDataAccessException(DataAccessException ex, HttpServletRequest request) {
    // Protege contra la fuga de esquemas, consultas SQL o sintaxis de BBDD
    log.error("Error de acceso a base de datos en {}: {}", request.getRequestURI(), ex.getMessage(), ex);
    return build(HttpStatus.INTERNAL_SERVER_ERROR, "Error en el acceso o persistencia de datos", request, null);
  }

  @ExceptionHandler(IllegalStateException.class)
  public ResponseEntity<ErrorResponse> handleIllegalState(IllegalStateException ex, HttpServletRequest request) {
    log.error("Error de estado interno en {}: {}", request.getRequestURI(), ex.getMessage(), ex);
    return build(HttpStatus.INTERNAL_SERVER_ERROR, "Error interno del servidor", request, null);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ErrorResponse> handleUnexpected(Exception ex, HttpServletRequest request) {
    log.error("Error no controlado en {}", request.getRequestURI(), ex);
    return build(HttpStatus.INTERNAL_SERVER_ERROR, "Error interno del servidor", request, null);
  }

  private ResponseEntity<ErrorResponse> build(HttpStatus status, String message, HttpServletRequest request,
      Map<String, String> fieldErrors) {
    ErrorResponse body = new ErrorResponse(
        Instant.now(),
        status.value(),
        status.getReasonPhrase(),
        message,
        request.getRequestURI(),
        fieldErrors);
    return ResponseEntity.status(status).body(body);
  }
}
