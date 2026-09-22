package com.wedding_app.backend.modules.guestphoto.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.wedding_app.backend.modules.guestphoto.entity.GuestPhoto;

@Repository
public interface GuestPhotoRepository extends JpaRepository<GuestPhoto, UUID> {

  List<GuestPhoto> findByWeddingIdOrderByCreatedAtDesc(UUID weddingId);

  List<GuestPhoto> findAllByOrderByCreatedAtDesc();

  long countByWeddingId(UUID weddingId);
}
