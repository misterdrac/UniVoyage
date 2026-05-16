package com.univoyage.admin.language.service;

import com.univoyage.admin.language.dto.AdminCreateLanguageRequest;
import com.univoyage.admin.language.dto.AdminLanguagePageResponse;
import com.univoyage.admin.language.dto.AdminLanguageResponse;
import com.univoyage.admin.language.dto.AdminPatchLanguageRequest;
import com.univoyage.exception.ResourceNotFoundException;
import com.univoyage.reference.language.model.Language;
import com.univoyage.reference.language.repository.LanguageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminLanguageService {

  private final LanguageRepository languageRepository;

  @Transactional(readOnly = true)
  public AdminLanguagePageResponse list(String search, Pageable pageable) {
    Page<Language> page = (search == null || search.isBlank())
        ? languageRepository.findAll(pageable)
        : languageRepository.search(search.trim(), pageable);
    return new AdminLanguagePageResponse(page.getContent().stream().map(this::toDto).toList(),
        page.getTotalElements(), page.getTotalPages(), page.getSize(), page.getNumber());
  }

  @Transactional(readOnly = true)
  public AdminLanguageResponse get(String langCode) {
    Language l = languageRepository.findById(langCode.toLowerCase())
        .orElseThrow(() -> new ResourceNotFoundException("Language not found: " + langCode));
    return toDto(l);
  }

  @Transactional
  public AdminLanguageResponse create(AdminCreateLanguageRequest req) {
    String code = req.langCode().toLowerCase();
    if (languageRepository.existsById(code))
      throw new IllegalArgumentException("Language code already exists: " + code);
    String name = req.langName().trim();
    if (languageRepository.existsByLangName(name))
      throw new IllegalArgumentException("Language name already in use: " + name);
    Language l = new Language();
    l.setLangCode(code);
    l.setLangName(name);
    l.setEmoji(null);
    l.setSortOrder(languageRepository.findMaxSortOrder() + 1);
    l.setActive(true);
    return toDto(languageRepository.save(l));
  }

  @Transactional
  public AdminLanguageResponse putUpdate(String langCode, AdminCreateLanguageRequest req) {
    String code = req.langCode().toLowerCase();
    if (!code.equals(langCode.toLowerCase()))
      throw new IllegalArgumentException("langCode in body must match URL");
    Language l = languageRepository.findById(code)
        .orElseThrow(() -> new ResourceNotFoundException("Language not found: " + langCode));
    resolveUniqueName(req.langName().trim(), code);
    l.setLangName(req.langName().trim());
    return toDto(languageRepository.save(l));
  }

  @Transactional
  public AdminLanguageResponse patchUpdate(String langCode, AdminPatchLanguageRequest req) {
    Language l = languageRepository.findById(langCode.toLowerCase())
        .orElseThrow(() -> new ResourceNotFoundException("Language not found: " + langCode));
    if (req.langName() != null) {
      String name = req.langName().trim();
      resolveUniqueName(name, l.getLangCode());
      l.setLangName(name);
    }
    if (req.emoji() != null)
      l.setEmoji(trimToNull(req.emoji()));
    if (req.sortOrder() != null)
      l.setSortOrder(req.sortOrder());
    if (req.active() != null)
      l.setActive(req.active());
    return toDto(languageRepository.save(l));
  }

  @Transactional
  public void delete(String langCode) {
    if (!languageRepository.existsById(langCode.toLowerCase()))
      throw new ResourceNotFoundException("Language not found: " + langCode);
    languageRepository.deleteById(langCode.toLowerCase());
  }

  private void resolveUniqueName(String name, String langCode) {
    if (languageRepository.existsByLangNameAndLangCodeNot(name, langCode))
      throw new IllegalArgumentException("Language name already in use: " + name);
  }

  private AdminLanguageResponse toDto(Language l) {
    return new AdminLanguageResponse(l.getLangCode(), l.getLangName(), l.getEmoji(),
        l.getSortOrder(), l.isActive());
  }

  private static String trimToNull(String s) {
    if (s == null)
      return null;
    String t = s.trim();
    return t.isEmpty() ? null : t;
  }
}
