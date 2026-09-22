package com.wedding_app.backend.modules.guestphoto.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.wedding_app.backend.common.exception.ResourceNotFoundException;
import com.wedding_app.backend.modules.guestphoto.dto.GuestPhotoResponse;
import com.wedding_app.backend.modules.guestphoto.entity.GuestPhoto;
import com.wedding_app.backend.modules.guestphoto.repository.GuestPhotoRepository;
import com.wedding_app.backend.modules.media.dto.MediaUploadResponse;
import com.wedding_app.backend.modules.media.service.MediaStorageService;
import com.wedding_app.backend.modules.wedding.entity.Wedding;
import com.wedding_app.backend.modules.wedding.repository.WeddingRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GuestPhotoService {

  private static final Logger log = LoggerFactory.getLogger(GuestPhotoService.class);
  private static final int MAX_FILES_PER_BATCH = 10;

  private final GuestPhotoRepository guestPhotoRepository;
  private final WeddingRepository weddingRepository;
  private final MediaStorageService mediaStorageService;

  @Transactional(readOnly = true)
  public List<GuestPhotoResponse> findAll() {
    Wedding wedding = getCurrentWedding();
    return guestPhotoRepository.findByWeddingIdOrderByCreatedAtDesc(wedding.getId()).stream()
        .map(this::toResponse)
        .toList();
  }

  @Transactional
  public List<GuestPhotoResponse> uploadPhotos(String uploaderName, String caption, List<MultipartFile> files) {
    if (!StringUtils.hasText(uploaderName)) {
      throw new IllegalArgumentException("El nombre del invitado es obligatorio para subir fotos");
    }

    if (files == null || files.isEmpty()) {
      throw new IllegalArgumentException("Debe seleccionar al menos una foto para subir");
    }

    if (files.size() > MAX_FILES_PER_BATCH) {
      throw new IllegalArgumentException("Solo se permite subir hasta " + MAX_FILES_PER_BATCH + " fotos a la vez");
    }

    Wedding wedding = getCurrentWedding();
    String sanitizedName = uploaderName.trim();
    String sanitizedCaption = StringUtils.hasText(caption) ? caption.trim() : null;

    List<GuestPhotoResponse> uploaded = new ArrayList<>();

    for (MultipartFile file : files) {
      if (file != null && !file.isEmpty()) {
        MediaUploadResponse storedMedia = mediaStorageService.store(file);

        GuestPhoto photo = new GuestPhoto();
        photo.setWedding(wedding);
        photo.setImageUrl(storedMedia.url());
        photo.setUploaderName(sanitizedName);
        photo.setCaption(sanitizedCaption);

        GuestPhoto saved = guestPhotoRepository.save(photo);
        uploaded.add(toResponse(saved));
      }
    }

    if (uploaded.isEmpty()) {
      throw new IllegalArgumentException("No se ha podido procesar ninguna foto válida");
    }

    log.info("Invitado '{}' ha subido {} fotos para la boda", sanitizedName, uploaded.size());
    return uploaded;
  }

  @Transactional
  public void delete(UUID id) {
    GuestPhoto photo = guestPhotoRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Foto de invitado no encontrada con ID: " + id));

    mediaStorageService.delete(photo.getImageUrl());
    guestPhotoRepository.delete(photo);
    log.info("Foto de invitado con ID {} eliminada por el administrador", id);
  }

  @Transactional(readOnly = true)
  public byte[] createZipArchive() throws IOException {
    Wedding wedding = getCurrentWedding();
    List<GuestPhoto> photos = guestPhotoRepository.findByWeddingIdOrderByCreatedAtDesc(wedding.getId());

    try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
         ZipOutputStream zos = new ZipOutputStream(baos)) {

      int index = 1;
      for (GuestPhoto photo : photos) {
        Path filePath = mediaStorageService.resolvePath(photo.getImageUrl());
        if (filePath != null && Files.exists(filePath)) {
          String sanitizedAuthor = photo.getUploaderName().replaceAll("[^a-zA-Z0-9_-]", "_");
          String fileName = String.format("%03d_%s_%s", index, sanitizedAuthor, filePath.getFileName().toString());
          ZipEntry entry = new ZipEntry(fileName);
          zos.putNextEntry(entry);
          Files.copy(filePath, zos);
          zos.closeEntry();
          index++;
        }
      }

      zos.finish();
      return baos.toByteArray();
    }
  }

  private Wedding getCurrentWedding() {
    return weddingRepository.findFirstByOrderByCreatedAtAsc()
        .orElseThrow(() -> new ResourceNotFoundException("No se ha encontrado ninguna boda configurada"));
  }

  private GuestPhotoResponse toResponse(GuestPhoto photo) {
    return new GuestPhotoResponse(
        photo.getId(),
        photo.getImageUrl(),
        photo.getUploaderName(),
        photo.getCaption(),
        photo.getCreatedAt()
    );
  }
}
