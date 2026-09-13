package com.wedding_app.backend.common.security;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class InMemoryRateLimiterTest {

  private InMemoryRateLimiter rateLimiter;

  @BeforeEach
  void setUp() {
    rateLimiter = new InMemoryRateLimiter();
  }

  @Test
  void testTryConsume_allowsUpToCapacity() {
    String key = "test-ip";
    int capacity = 5;
    int refillRpm = 5;

    for (int i = 0; i < capacity; i++) {
      assertTrue(rateLimiter.tryConsume(key, capacity, refillRpm),
          "La petición " + (i + 1) + " debería ser permitida");
    }

    assertFalse(rateLimiter.tryConsume(key, capacity, refillRpm),
        "La petición por encima de la capacidad debería ser rechazada");
  }

  @Test
  void testTryConsume_differentKeysAreIndependent() {
    int capacity = 2;
    int refillRpm = 2;

    assertTrue(rateLimiter.tryConsume("ip-1", capacity, refillRpm));
    assertTrue(rateLimiter.tryConsume("ip-1", capacity, refillRpm));
    assertFalse(rateLimiter.tryConsume("ip-1", capacity, refillRpm));

    // ip-2 debe tener su propio cupo intacto
    assertTrue(rateLimiter.tryConsume("ip-2", capacity, refillRpm));
    assertTrue(rateLimiter.tryConsume("ip-2", capacity, refillRpm));
    assertFalse(rateLimiter.tryConsume("ip-2", capacity, refillRpm));
  }

  @Test
  void testReset_clearsAllBuckets() {
    rateLimiter.tryConsume("key-1", 1, 1);
    assertFalse(rateLimiter.tryConsume("key-1", 1, 1));

    rateLimiter.reset();

    assertTrue(rateLimiter.tryConsume("key-1", 1, 1));
  }
}
