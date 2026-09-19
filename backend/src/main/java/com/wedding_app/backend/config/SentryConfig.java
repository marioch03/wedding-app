package com.wedding_app.backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import io.sentry.Sentry;
import jakarta.annotation.PostConstruct;

/**
 * Configuración e inicialización de Sentry para el Backend (Spring Boot).
 * Se inicializa únicamente si sentry.dsn está presente y no vacío.
 * Aplica sampling del 20% y protección de privacidad (sendDefaultPii = false).
 */
@Configuration(proxyBeanMethods = false)
public class SentryConfig {


  private static final Logger log = LoggerFactory.getLogger(SentryConfig.class);

  @Value("${sentry.dsn:}")
  private String dsn;

  @Value("${sentry.environment:production}")
  private String environment;

  @Value("${sentry.traces-sample-rate:0.2}")
  private Double tracesSampleRate;

  @PostConstruct
  public void init() {
    if (dsn != null && !dsn.isBlank()) {
      Sentry.init(options -> {
        options.setDsn(dsn);
        options.setEnvironment(environment);
        options.setTracesSampleRate(tracesSampleRate);
        options.setSendDefaultPii(false);
      });
      log.info("Sentry inicializado con éxito para el entorno [{}]", environment);
    } else {
      log.info("Sentry inactivo (sentry.dsn no configurado)");
    }
  }
}
