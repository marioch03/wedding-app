package com.wedding_app.backend.modules.wedding.service;

import java.util.HashMap;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.wedding_app.backend.common.exception.ResourceNotFoundException;
import com.wedding_app.backend.modules.wedding.dto.WeddingPublicResponse;
import com.wedding_app.backend.modules.wedding.dto.WeddingRequest;
import com.wedding_app.backend.modules.wedding.dto.WeddingResponse;
import com.wedding_app.backend.modules.wedding.entity.Wedding;
import com.wedding_app.backend.modules.wedding.repository.WeddingRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WeddingService {

  private final WeddingRepository weddingRepository;

  @Transactional(readOnly = true)
  public WeddingResponse getCurrentWedding() {
    Wedding wedding = getCurrentEntity();
    return toResponse(wedding);
  }

  @Transactional(readOnly = true)
  public WeddingPublicResponse getCurrentWeddingPublic() {
    Wedding wedding = getCurrentEntity();
    return toPublicResponse(wedding);
  }

  @Transactional(readOnly = true)
  public WeddingResponse getById(UUID id) {
    return toResponse(getEntityById(id));
  }

  @Transactional(readOnly = true)
  public WeddingPublicResponse getPublicById(UUID id) {
    return toPublicResponse(getEntityById(id));
  }

  @Transactional(readOnly = true)
  public List<WeddingResponse> findAll() {
    return weddingRepository.findAll().stream()
        .map(this::toResponse)
        .toList();
  }

  @Transactional
  public WeddingResponse create(WeddingRequest request) {
    Wedding wedding = new Wedding();
    applyRequest(wedding, request);
    return toResponse(weddingRepository.save(wedding));
  }

  @Transactional
  public WeddingResponse update(UUID id, WeddingRequest request) {
    Wedding wedding = getEntityById(id);
    applyRequest(wedding, request);
    return toResponse(wedding);
  }

  @Transactional
  public WeddingResponse updateCurrent(WeddingRequest request) {
    Wedding wedding = weddingRepository.findFirstByOrderByCreatedAtAsc().orElseGet(Wedding::new);
    applyRequest(wedding, request);
    return toResponse(weddingRepository.save(wedding));
  }

  @Transactional
  public void delete(UUID id) {
    Wedding wedding = getEntityById(id);
    weddingRepository.delete(wedding);
  }

  public Wedding getEntityById(UUID id) {
    return weddingRepository.findById(id)
        .orElseThrow(() -> ResourceNotFoundException.of("Boda", id));
  }

  private Wedding getCurrentEntity() {
    return weddingRepository.findFirstByOrderByCreatedAtAsc()
        .orElseThrow(() -> new ResourceNotFoundException("No hay ninguna boda configurada en el sistema"));
  }

  private void applyRequest(Wedding wedding, WeddingRequest request) {
    wedding.setPartner1Name(request.partner1Name().trim());
    wedding.setPartner2Name(request.partner2Name().trim());
    wedding.setWeddingDate(request.weddingDate());
    wedding.setContent(request.content() != null ? new HashMap<>(request.content()) : new HashMap<>());
  }

  private WeddingResponse toResponse(Wedding wedding) {
    return new WeddingResponse(
        wedding.getId(),
        wedding.getPartner1Name(),
        wedding.getPartner2Name(),
        wedding.getWeddingDate(),
        wedding.getContent(),
        wedding.getCreatedAt(),
        wedding.getUpdatedAt());
  }

  private WeddingPublicResponse toPublicResponse(Wedding wedding) {
    return new WeddingPublicResponse(
        wedding.getId(),
        wedding.getPartner1Name(),
        wedding.getPartner2Name(),
        wedding.getWeddingDate(),
        wedding.getContent());
  }
}
