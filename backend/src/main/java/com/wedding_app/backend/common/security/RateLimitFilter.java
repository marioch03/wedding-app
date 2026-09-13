package com.wedding_app.backend.common.security;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Filtro de seguridad para limitar la tasa de peticiones (Rate Limiting) en endpoints críticos.
 * Compatible con Cloudflare (CF-Connecting-IP), proxies inversos y conexiones directas.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class RateLimitFilter extends OncePerRequestFilter {

  private final InMemoryRateLimiter rateLimiter;

  @Value("${app.rate-limit.enabled:true}")
  private boolean enabled;

  @Value("${app.rate-limit.rsvp.limit-per-minute:30}")
  private int rsvpLimitPerMinute;

  @Value("${app.rate-limit.media.limit-per-minute:40}")
  private int mediaLimitPerMinute;

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {

    if (!enabled || "OPTIONS".equalsIgnoreCase(request.getMethod())) {
      filterChain.doFilter(request, response);
      return;
    }

    String uri = request.getRequestURI();
    String category = null;
    int limit = 0;

    if (uri.startsWith("/api/v1/public/rsvp")) {
      category = "rsvp";
      limit = rsvpLimitPerMinute;
    } else if (uri.startsWith("/api/v1/admin/media")) {
      category = "media";
      limit = mediaLimitPerMinute;
    }

    if (category == null) {
      filterChain.doFilter(request, response);
      return;
    }

    String clientIp = resolveClientIp(request);
    String rateLimitKey = category + ":" + clientIp;

    boolean allowed = rateLimiter.tryConsume(rateLimitKey, limit, limit);

    if (!allowed) {
      log.warn("Rate limit excedido para IP {} en ruta {} (categoría: {})", clientIp, uri, category);

      response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
      response.setContentType(MediaType.APPLICATION_JSON_VALUE);
      response.setCharacterEncoding(StandardCharsets.UTF_8.name());
      response.setHeader("Retry-After", "60");

      String json = String.format(
          "{\"timestamp\":\"%s\",\"status\":429,\"error\":\"Too Many Requests\",\"message\":\"Has superado el límite de peticiones permitido. Por favor, inténtalo de nuevo en 1 minuto.\",\"path\":\"%s\"}",
          Instant.now(), uri);

      response.getWriter().write(json);
      return;
    }

    filterChain.doFilter(request, response);
  }

  /**
   * Resuelve la IP real del cliente priorizando cabeceras de proxy de Cloudflare y reverse proxies.
   */
  public static String resolveClientIp(HttpServletRequest request) {
    // 1. Cloudflare header
    String cfConnectingIp = request.getHeader("CF-Connecting-IP");
    if (cfConnectingIp != null && !cfConnectingIp.isBlank()) {
      return cfConnectingIp.trim();
    }

    // 2. Standard X-Forwarded-For header
    String xForwardedFor = request.getHeader("X-Forwarded-For");
    if (xForwardedFor != null && !xForwardedFor.isBlank()) {
      int commaIndex = xForwardedFor.indexOf(',');
      if (commaIndex != -1) {
        return xForwardedFor.substring(0, commaIndex).trim();
      }
      return xForwardedFor.trim();
    }

    // 3. Fallback directo
    return request.getRemoteAddr();
  }
}
