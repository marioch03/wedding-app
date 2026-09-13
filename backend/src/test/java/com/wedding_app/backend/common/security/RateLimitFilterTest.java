package com.wedding_app.backend.common.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

class RateLimitFilterTest {

  private InMemoryRateLimiter rateLimiter;
  private RateLimitFilter filter;
  private FilterChain filterChain;
  private HttpServletRequest request;
  private HttpServletResponse response;
  private StringWriter responseWriter;

  @BeforeEach
  void setUp() throws IOException {
    rateLimiter = new InMemoryRateLimiter();
    filter = new RateLimitFilter(rateLimiter);

    ReflectionTestUtils.setField(filter, "enabled", true);
    ReflectionTestUtils.setField(filter, "rsvpLimitPerMinute", 5);
    ReflectionTestUtils.setField(filter, "mediaLimitPerMinute", 3);

    filterChain = mock(FilterChain.class);
    request = mock(HttpServletRequest.class);
    response = mock(HttpServletResponse.class);

    responseWriter = new StringWriter();
    when(response.getWriter()).thenReturn(new PrintWriter(responseWriter));
    when(request.getRemoteAddr()).thenReturn("192.168.1.100");
  }

  @Test
  void testRsvpEndpoint_allowsUpToLimitAndBlocksSubsequent() throws ServletException, IOException {
    when(request.getRequestURI()).thenReturn("/api/v1/public/rsvp/ABCDEF");
    when(request.getMethod()).thenReturn("GET");

    // 5 peticiones permitidas
    for (int i = 0; i < 5; i++) {
      filter.doFilter(request, response, filterChain);
    }
    verify(filterChain, times(5)).doFilter(request, response);

    // 6ª petición rechazada con 429
    filter.doFilter(request, response, filterChain);
    verify(response).setStatus(429);
    verify(response).setHeader("Retry-After", "60");
    verify(filterChain, times(5)).doFilter(request, response); // No incrementa llamadas al chain
  }

  @Test
  void testOptionsMethod_bypassesRateLimiting() throws ServletException, IOException {
    when(request.getRequestURI()).thenReturn("/api/v1/public/rsvp/ABCDEF");
    when(request.getMethod()).thenReturn("OPTIONS");

    for (int i = 0; i < 10; i++) {
      filter.doFilter(request, response, filterChain);
    }

    verify(filterChain, times(10)).doFilter(request, response);
  }

  @Test
  void testUnrelatedEndpoint_bypassesRateLimiting() throws ServletException, IOException {
    when(request.getRequestURI()).thenReturn("/api/v1/public/wedding");
    when(request.getMethod()).thenReturn("GET");

    for (int i = 0; i < 10; i++) {
      filter.doFilter(request, response, filterChain);
    }

    verify(filterChain, times(10)).doFilter(request, response);
  }

  @Test
  void testResolveClientIp_prioritizesCloudflareHeader() {
    when(request.getHeader("CF-Connecting-IP")).thenReturn("203.0.113.195");
    when(request.getHeader("X-Forwarded-For")).thenReturn("198.51.100.1, 10.0.0.1");

    String ip = RateLimitFilter.resolveClientIp(request);
    assertEquals("203.0.113.195", ip);
  }

  @Test
  void testResolveClientIp_usesFirstXForwardedFor() {
    when(request.getHeader("CF-Connecting-IP")).thenReturn(null);
    when(request.getHeader("X-Forwarded-For")).thenReturn("198.51.100.1, 10.0.0.1");

    String ip = RateLimitFilter.resolveClientIp(request);
    assertEquals("198.51.100.1", ip);
  }
}
