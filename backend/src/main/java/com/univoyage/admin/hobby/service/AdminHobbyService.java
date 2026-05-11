package com.univoyage.admin.hobby.service;

import com.univoyage.admin.hobby.dto.AdminCreateHobbyRequest;
import com.univoyage.admin.hobby.dto.AdminHobbyPageResponse;
import com.univoyage.admin.hobby.dto.AdminHobbyResponse;
import com.univoyage.admin.hobby.dto.AdminPatchHobbyRequest;
import com.univoyage.exception.ResourceNotFoundException;
import com.univoyage.reference.hobby.model.Hobby;
import com.univoyage.reference.hobby.repository.HobbyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminHobbyService {

  private final HobbyRepository hobbyRepository;

  @Transactional(readOnly = true)
  public AdminHobbyPageResponse list(String search, Pageable pageable) {
    Page<Hobby> page =
        (search == null || search.isBlank()) ? hobbyRepository.findAll(pageable)
            : hobbyRepository.search(search.trim(), pageable);
    return new AdminHobbyPageResponse(page.getContent().stream().map(this::toDto).toList(),
        page.getTotalElements(), page.getTotalPages(), page.getSize(), page.getNumber());
  }

  @Transactional(readOnly = true)
  public AdminHobbyResponse get(long id) {
    return hobbyRepository.findById(id).map(this::toDto)
        .orElseThrow(() -> new ResourceNotFoundException("Hobby not found: " + id));
  }

  @Transactional
  public AdminHobbyResponse create(AdminCreateHobbyRequest req) {
    String key = req.hobbyName().trim();
    if (hobbyRepository.existsByHobbyName(key)) {
      throw new IllegalArgumentException("Hobby key already exists: " + key);
    }
    Hobby h = new Hobby();
    h.setHobbyName(key);
    h.setDisplayLabel(req.displayLabel().trim());
    h.setEmoji(req.emoji().trim());
    h.setSortOrder(hobbyRepository.findMaxSortOrder() + 1);
    h.setActive(true);
    return toDto(hobbyRepository.save(h));
  }

  @Transactional
  public AdminHobbyResponse putUpdate(long id, AdminCreateHobbyRequest req) {
    Hobby h = hobbyRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Hobby not found: " + id));
    String key = req.hobbyName().trim();
    if (hobbyRepository.existsByHobbyNameAndIdNot(key, id)) {
      throw new IllegalArgumentException("Hobby key already exists: " + key);
    }
    h.setHobbyName(key);
    h.setDisplayLabel(req.displayLabel().trim());
    h.setEmoji(req.emoji().trim());
    return toDto(hobbyRepository.save(h));
  }

  @Transactional
  public AdminHobbyResponse patchUpdate(long id, AdminPatchHobbyRequest req) {
    Hobby h = hobbyRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Hobby not found: " + id));
    if (req.hobbyName() != null) {
      String key = req.hobbyName().trim();
      validateHobbySlug(key);
      if (hobbyRepository.existsByHobbyNameAndIdNot(key, id)) {
        throw new IllegalArgumentException("Hobby key already exists: " + key);
      }
      h.setHobbyName(key);
    }
    if (req.displayLabel() != null)
      h.setDisplayLabel(req.displayLabel().trim());
    if (req.emoji() != null)
      h.setEmoji(trimToNull(req.emoji()));
    if (req.sortOrder() != null)
      h.setSortOrder(req.sortOrder());
    if (req.active() != null)
      h.setActive(req.active());
    return toDto(hobbyRepository.save(h));
  }

  @Transactional
  public void delete(long id) {
    if (!hobbyRepository.existsById(id))
      throw new ResourceNotFoundException("Hobby not found: " + id);
    hobbyRepository.deleteById(id);
  }

  private AdminHobbyResponse toDto(Hobby h) {
    return new AdminHobbyResponse(h.getId(), h.getHobbyName(), h.getDisplayLabel(), h.getEmoji(),
        h.getSortOrder(), h.isActive());
  }

  private static String trimToNull(String s) {
    if (s == null)
      return null;
    String t = s.trim();
    return t.isEmpty() ? null : t;
  }

  private static void validateHobbySlug(String key) {
    if (key.isBlank() || !key.matches("[a-z][a-z0-9_]{0,49}"))
      throw new IllegalArgumentException(
          "Invalid hobby key; must match [a-z][a-z0-9_]{0,49}");
  }
}
