package com.wedding_app.backend.common.security;

import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;

/**
 * Limitador de tasa en memoria basado en el algoritmo Token Bucket.
 * Proporciona un control de peticiones concurrente, ligero y libre de dependencias externas.
 */
@Component
public class InMemoryRateLimiter {

  private final ConcurrentHashMap<String, TokenBucket> buckets = new ConcurrentHashMap<>();

  /**
   * Intenta consumir un token para la clave especificada.
   *
   * @param key Identificador del bucket (ej. "rsvp:192.168.1.1")
   * @param capacity Capacidad máxima de ráfaga permitida
   * @param refillTokensPerMinute Cantidad de tokens recargados por minuto
   * @return true si había tokens disponibles y se consumió uno; false si se ha excedido el límite
   */
  public boolean tryConsume(String key, int capacity, int refillTokensPerMinute) {
    long now = System.currentTimeMillis();
    TokenBucket bucket = buckets.computeIfAbsent(key, k -> new TokenBucket(capacity, now));

    // Mantenimiento defensivo si el mapa acumula demasiadas IPs (> 10.000)
    if (buckets.size() > 10_000) {
      purgeStaleEntries(now, 10 * 60 * 1000L); // 10 minutos de inactividad
    }

    return bucket.tryConsume(capacity, refillTokensPerMinute, now);
  }

  /**
   * Elimina cubos inactivos cuya última actualización supere el tiempo de inactividad.
   */
  public void purgeStaleEntries(long now, long maxIdleMs) {
    buckets.entrySet().removeIf(entry -> (now - entry.getValue().lastRefillTimestamp) > maxIdleMs);
  }

  /**
   * Limpia todos los cubos (útil para tests).
   */
  public void reset() {
    buckets.clear();
  }

  private static class TokenBucket {
    private double availableTokens;
    private long lastRefillTimestamp;

    public TokenBucket(double initialTokens, long now) {
      this.availableTokens = initialTokens;
      this.lastRefillTimestamp = now;
    }

    public synchronized boolean tryConsume(int capacity, int refillPerMinute, long now) {
      long elapsed = Math.max(0, now - lastRefillTimestamp);
      double tokensToAdd = (elapsed * (double) refillPerMinute) / 60_000.0;

      availableTokens = Math.min(capacity, availableTokens + tokensToAdd);
      lastRefillTimestamp = now;

      if (availableTokens >= 1.0) {
        availableTokens -= 1.0;
        return true;
      }
      return false;
    }
  }
}
