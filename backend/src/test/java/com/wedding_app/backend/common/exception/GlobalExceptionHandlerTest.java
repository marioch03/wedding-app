package com.wedding_app.backend.common.exception;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.mock.http.MockHttpInputMessage;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import com.wedding_app.backend.common.error.ErrorResponse;

import jakarta.servlet.http.HttpServletRequest;

class GlobalExceptionHandlerTest {

  private GlobalExceptionHandler exceptionHandler;
  private HttpServletRequest request;

  @BeforeEach
  void setUp() {
    exceptionHandler = new GlobalExceptionHandler();
    request = mock(HttpServletRequest.class);
    when(request.getRequestURI()).thenReturn("/api/v1/test");
  }

  @Test
  void testHandleDataIntegrityViolation_returns409WithoutLeakingDetails() {
    String sensitiveSql = "violates foreign key constraint fk_guest_party on table guest";
    DataIntegrityViolationException ex = new DataIntegrityViolationException(sensitiveSql);

    ResponseEntity<ErrorResponse> response = exceptionHandler.handleDataIntegrityViolation(ex, request);

    assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
    assertNotNull(response.getBody());
    assertEquals(409, response.getBody().status());
    assertFalse(response.getBody().message().contains("guest"));
    assertFalse(response.getBody().message().contains("fk_guest_party"));
    assertEquals("Conflicto de integridad de datos: el recurso ya existe o tiene restricciones asociadas",
        response.getBody().message());
  }

  @Test
  void testHandleDataAccessException_returns500WithoutLeakingDetails() {
    String sensitiveSql = "SELECT * FROM admin_user WHERE secret_token = 'xyz'";
    DataAccessException ex = new DataAccessException(sensitiveSql) {};

    ResponseEntity<ErrorResponse> response = exceptionHandler.handleDataAccessException(ex, request);

    assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    assertNotNull(response.getBody());
    assertEquals(500, response.getBody().status());
    assertFalse(response.getBody().message().contains("admin_user"));
    assertFalse(response.getBody().message().contains("SELECT"));
    assertEquals("Error en el acceso o persistencia de datos", response.getBody().message());
  }

  @Test
  void testHandleAccessDenied_returns403() {
    AccessDeniedException ex = new AccessDeniedException("Access denied");

    ResponseEntity<ErrorResponse> response = exceptionHandler.handleAccessDenied(ex, request);

    assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
    assertNotNull(response.getBody());
    assertEquals(403, response.getBody().status());
    assertEquals("Acceso denegado: no dispone de los permisos necesarios", response.getBody().message());
  }

  @Test
  void testHandleAuthentication_returns401() {
    BadCredentialsException ex = new BadCredentialsException("Bad token");

    ResponseEntity<ErrorResponse> response = exceptionHandler.handleAuthentication(ex, request);

    assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    assertNotNull(response.getBody());
    assertEquals(401, response.getBody().status());
    assertEquals("No autenticado: credenciales o token inválido o ausente", response.getBody().message());
  }

  @Test
  void testHandleMaxUploadSize_returns413() {
    MaxUploadSizeExceededException ex = new MaxUploadSizeExceededException(10485760);

    ResponseEntity<ErrorResponse> response = exceptionHandler.handleMaxUploadSize(ex, request);

    assertEquals(HttpStatus.valueOf(413), response.getStatusCode());
    assertNotNull(response.getBody());
    assertEquals(413, response.getBody().status());
    assertEquals("El archivo subido supera el límite máximo permitido (10MB)", response.getBody().message());
  }

  @Test
  void testHandleMessageNotReadable_returns400() {
    HttpMessageNotReadableException ex = new HttpMessageNotReadableException("Invalid JSON format",
        new MockHttpInputMessage(new byte[0]));

    ResponseEntity<ErrorResponse> response = exceptionHandler.handleMessageNotReadable(ex, request);

    assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    assertNotNull(response.getBody());
    assertEquals(400, response.getBody().status());
  }
}
