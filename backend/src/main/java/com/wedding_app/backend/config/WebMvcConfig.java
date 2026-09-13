package com.wedding_app.backend.config;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

  @Value("${app.upload.dir:./uploads/images}")
  private String uploadDir;

  @Override
  public void addResourceHandlers(ResourceHandlerRegistry registry) {
    Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
    String uploadUri = uploadPath.toUri().toString();
    if (!uploadUri.endsWith("/")) {
      uploadUri += "/";
    }

    registry.addResourceHandler("/media/**")
        .addResourceLocations(uploadUri)
        .setCacheControl(CacheControl.maxAge(Duration.ofDays(365)).cachePublic());
  }
}
