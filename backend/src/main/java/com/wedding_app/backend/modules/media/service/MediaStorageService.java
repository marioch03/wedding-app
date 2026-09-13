package com.wedding_app.backend.modules.media.service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.wedding_app.backend.modules.media.dto.MediaUploadResponse;

import jakarta.annotation.PostConstruct;

@Service
public class MediaStorageService {

  private static final Logger log = LoggerFactory.getLogger(MediaStorageService.class);

  private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif"
  );

  private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
      "jpg", "jpeg", "png", "webp", "gif"
  );

  @Value("${app.upload.dir:./uploads/images}")
  private String uploadDir;

  private Path rootLocation;

  @PostConstruct
  public void init() {
    this.rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
    try {
      Files.createDirectories(this.rootLocation);
      log.info("Directorio de subidas inicializado en: {}", this.rootLocation);
    } catch (IOException e) {
      throw new IllegalStateException("No se pudo crear el directorio de subidas: " + this.rootLocation, e);
    }
  }

  public MediaUploadResponse store(MultipartFile file) {
    if (file == null || file.isEmpty()) {
      throw new IllegalArgumentException("No se ha proporcionado ningún archivo para subir");
    }

    String contentType = file.getContentType();
    if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
      throw new IllegalArgumentException("Formato no soportado (" + contentType + "). Formatos permitidos: JPG, PNG, WebP y GIF");
    }

    String originalFilename = file.getOriginalFilename();
    String extension = extractExtension(originalFilename);
    if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
      throw new IllegalArgumentException("Extensión no permitida (." + extension + "). Extensiones permitidas: jpg, jpeg, png, webp, gif");
    }

    // Generar nombre único seguro
    String sanitizedBaseName = sanitizeBaseName(originalFilename);
    String uniqueFileName = UUID.randomUUID().toString().substring(0, 12) + "-" + sanitizedBaseName + "." + extension.toLowerCase();

    try {
      Path destinationFile = this.rootLocation.resolve(uniqueFileName).normalize().toAbsolutePath();

      // Protección contra Path Traversal
      if (!destinationFile.getParent().equals(this.rootLocation)) {
        throw new IllegalArgumentException("Ruta de archivo no permitida");
      }

      try (InputStream inputStream = file.getInputStream()) {
        Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
      }

      log.info("Archivo guardado con éxito: {}", uniqueFileName);
      String publicUrl = "/media/" + uniqueFileName;
      return new MediaUploadResponse(publicUrl, uniqueFileName, file.getSize());

    } catch (IOException e) {
      log.error("Fallo al guardar archivo en disco", e);
      throw new IllegalStateException("Fallo al almacenar el archivo", e);
    }
  }

  public List<MediaUploadResponse> storeMultiple(List<MultipartFile> files) {
    if (files == null || files.isEmpty()) {
      throw new IllegalArgumentException("No se han proporcionado archivos para subir");
    }

    List<MediaUploadResponse> results = new ArrayList<>();
    for (MultipartFile file : files) {
      if (file != null && !file.isEmpty()) {
        results.add(store(file));
      }
    }

    if (results.isEmpty()) {
      throw new IllegalArgumentException("Ninguno de los archivos proporcionados es válido");
    }

    return results;
  }

  private String extractExtension(String filename) {
    if (!StringUtils.hasText(filename)) {
      return "jpg";
    }
    int dotIndex = filename.lastIndexOf('.');
    if (dotIndex == -1 || dotIndex == filename.length() - 1) {
      return "jpg";
    }
    return filename.substring(dotIndex + 1);
  }

  private String sanitizeBaseName(String filename) {
    if (!StringUtils.hasText(filename)) {
      return "imagen";
    }
    int dotIndex = filename.lastIndexOf('.');
    String base = (dotIndex != -1) ? filename.substring(0, dotIndex) : filename;
    String sanitized = base.replaceAll("[^a-zA-Z0-9_-]", "_");
    if (sanitized.length() > 30) {
      sanitized = sanitized.substring(0, 30);
    }
    return sanitized.isEmpty() ? "imagen" : sanitized;
  }
}
