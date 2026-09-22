package com.wedding_app.backend.modules.guestphoto.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import com.wedding_app.backend.common.exception.ResourceNotFoundException;
import com.wedding_app.backend.modules.guestphoto.dto.GuestPhotoResponse;
import com.wedding_app.backend.modules.guestphoto.entity.GuestPhoto;
import com.wedding_app.backend.modules.guestphoto.repository.GuestPhotoRepository;
import com.wedding_app.backend.modules.media.dto.MediaUploadResponse;
import com.wedding_app.backend.modules.media.service.MediaStorageService;
import com.wedding_app.backend.modules.wedding.entity.Wedding;
import com.wedding_app.backend.modules.wedding.repository.WeddingRepository;

@ExtendWith(MockitoExtension.class)
class GuestPhotoServiceTest {

  @Mock
  private GuestPhotoRepository guestPhotoRepository;

  @Mock
  private WeddingRepository weddingRepository;

  @Mock
  private MediaStorageService mediaStorageService;

  @InjectMocks
  private GuestPhotoService guestPhotoService;

  private Wedding wedding;

  @BeforeEach
  void setUp() {
    wedding = new Wedding();
    wedding.setId(UUID.randomUUID());
  }

  @Test
  void findAll_ReturnsMappedPhotos() {
    when(weddingRepository.findFirstByOrderByCreatedAtAsc()).thenReturn(Optional.of(wedding));

    GuestPhoto photo = new GuestPhoto();
    photo.setId(UUID.randomUUID());
    photo.setWedding(wedding);
    photo.setImageUrl("/media/foto.jpg");
    photo.setUploaderName("Familia Pérez");
    photo.setCaption("Un día inolvidable");

    when(guestPhotoRepository.findByWeddingIdOrderByCreatedAtDesc(wedding.getId())).thenReturn(List.of(photo));

    List<GuestPhotoResponse> result = guestPhotoService.findAll();

    assertEquals(1, result.size());
    assertEquals("Familia Pérez", result.get(0).uploaderName());
    assertEquals("/media/foto.jpg", result.get(0).imageUrl());
  }

  @Test
  void uploadPhotos_Valid_SavesPhotos() {
    when(weddingRepository.findFirstByOrderByCreatedAtAsc()).thenReturn(Optional.of(wedding));

    MockMultipartFile file = new MockMultipartFile(
        "files", "test.jpg", "image/jpeg", "image-content".getBytes()
    );

    MediaUploadResponse uploadRes = new MediaUploadResponse("/media/abc-test.jpg", "abc-test.jpg", 13);
    when(mediaStorageService.store(file)).thenReturn(uploadRes);

    GuestPhoto savedPhoto = new GuestPhoto();
    savedPhoto.setId(UUID.randomUUID());
    savedPhoto.setWedding(wedding);
    savedPhoto.setImageUrl("/media/abc-test.jpg");
    savedPhoto.setUploaderName("Amigos del novio");
    savedPhoto.setCaption("¡Enhorabuena pareja!");

    when(guestPhotoRepository.save(any(GuestPhoto.class))).thenReturn(savedPhoto);

    List<GuestPhotoResponse> responses = guestPhotoService.uploadPhotos(
        "Amigos del novio", "¡Enhorabuena pareja!", List.of(file)
    );

    assertEquals(1, responses.size());
    assertEquals("Amigos del novio", responses.get(0).uploaderName());
    assertEquals("/media/abc-test.jpg", responses.get(0).imageUrl());
  }

  @Test
  void uploadPhotos_BlankName_ThrowsException() {
    assertThrows(IllegalArgumentException.class, () ->
        guestPhotoService.uploadPhotos("   ", "Mensaje", List.of(new MockMultipartFile("f", "f.jpg", "image/jpeg", new byte[5])))
    );
  }

  @Test
  void delete_ExistingPhoto_DeletesFromDiskAndDb() {
    UUID photoId = UUID.randomUUID();
    GuestPhoto photo = new GuestPhoto();
    photo.setId(photoId);
    photo.setImageUrl("/media/foto.jpg");

    when(guestPhotoRepository.findById(photoId)).thenReturn(Optional.of(photo));

    guestPhotoService.delete(photoId);

    verify(mediaStorageService).delete("/media/foto.jpg");
    verify(guestPhotoRepository).delete(photo);
  }

  @Test
  void delete_NotFound_ThrowsException() {
    UUID photoId = UUID.randomUUID();
    when(guestPhotoRepository.findById(photoId)).thenReturn(Optional.empty());

    assertThrows(ResourceNotFoundException.class, () -> guestPhotoService.delete(photoId));
  }
}
