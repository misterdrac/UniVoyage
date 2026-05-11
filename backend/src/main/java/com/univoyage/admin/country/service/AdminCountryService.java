package com.univoyage.admin.country.service;

import com.univoyage.admin.country.dto.AdminCountryPageResponse;
import com.univoyage.admin.country.dto.AdminCountryResponse;
import com.univoyage.admin.country.dto.AdminCreateCountryRequest;
import com.univoyage.admin.country.dto.AdminPatchCountryRequest;
import com.univoyage.exception.ResourceNotFoundException;
import com.univoyage.reference.country.model.Country;
import com.univoyage.reference.country.repository.CountryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminCountryService {

  private final CountryRepository countryRepository;

  @Transactional(readOnly = true)
  public AdminCountryPageResponse list(String search, Pageable pageable) {
    Page<Country> page =
        (search == null || search.isBlank()) ? countryRepository.findAll(pageable)
            : countryRepository.search(search.trim(), pageable);
    return new AdminCountryPageResponse(page.getContent().stream().map(this::toDto).toList(),
        page.getTotalElements(), page.getTotalPages(), page.getSize(), page.getNumber());
  }

  @Transactional(readOnly = true)
  public AdminCountryResponse get(String isoCode) {
    Country c = countryRepository.findById(isoCode.toUpperCase())
        .orElseThrow(() -> new ResourceNotFoundException("Country not found: " + isoCode));
    return toDto(c);
  }

  @Transactional
  public AdminCountryResponse create(AdminCreateCountryRequest req) {
    String code = req.isoCode().toUpperCase();
    if (countryRepository.existsById(code))
      throw new IllegalArgumentException("Country code already exists: " + code);
    String name = req.countryName().trim();
    if (countryRepository.existsByCountryName(name))
      throw new IllegalArgumentException("Country name already in use: " + name);
    Country c = new Country();
    c.setIsoCode(code);
    c.setCountryName(name);
    c.setCurrencyCode(req.currencyCode().trim().toUpperCase());
    c.setCurrencyName(trimToNull(req.currencyName()));
    c.setSortOrder(0);
    c.setActive(true);
    return toDto(countryRepository.save(c));
  }

  @Transactional
  public AdminCountryResponse putUpdate(String isoCode, AdminCreateCountryRequest req) {
    String code = req.isoCode().toUpperCase();
    if (!code.equals(isoCode.toUpperCase()))
      throw new IllegalArgumentException("isoCode in body must match URL");
    Country c = countryRepository.findById(code)
        .orElseThrow(() -> new ResourceNotFoundException("Country not found: " + isoCode));
    resolveUniqueName(req.countryName().trim(), code);
    c.setCountryName(req.countryName().trim());
    c.setCurrencyCode(req.currencyCode().trim().toUpperCase());
    c.setCurrencyName(trimToNull(req.currencyName()));
    return toDto(countryRepository.save(c));
  }

  @Transactional
  public AdminCountryResponse patchUpdate(String isoCode, AdminPatchCountryRequest req) {
    Country c = countryRepository.findById(isoCode.toUpperCase())
        .orElseThrow(() -> new ResourceNotFoundException("Country not found: " + isoCode));
    if (req.countryName() != null) {
      String name = req.countryName().trim();
      resolveUniqueName(name, c.getIsoCode());
      c.setCountryName(name);
    }
    if (req.currencyCode() != null)
      c.setCurrencyCode(trimToNull(req.currencyCode()));
    if (req.currencyName() != null)
      c.setCurrencyName(trimToNull(req.currencyName()));
    if (req.sortOrder() != null)
      c.setSortOrder(req.sortOrder());
    if (req.active() != null)
      c.setActive(req.active());
    return toDto(countryRepository.save(c));
  }

  @Transactional
  public void delete(String isoCode) {
    if (!countryRepository.existsById(isoCode.toUpperCase()))
      throw new ResourceNotFoundException("Country not found: " + isoCode);
    countryRepository.deleteById(isoCode.toUpperCase());
  }

  private void resolveUniqueName(String name, String isoCode) {
    if (countryRepository.existsByCountryNameAndIsoCodeNot(name, isoCode))
      throw new IllegalArgumentException("Country name already in use: " + name);
  }

  private AdminCountryResponse toDto(Country c) {
    return new AdminCountryResponse(c.getIsoCode(), c.getCountryName(), c.getCurrencyCode(),
        c.getCurrencyName(), c.getSortOrder(), c.isActive());
  }

  private static String trimToNull(String s) {
    if (s == null)
      return null;
    String t = s.trim();
    return t.isEmpty() ? null : t;
  }
}
