package com.univoyage.reference.service;

import com.univoyage.reference.country.model.Country;
import com.univoyage.reference.country.repository.CountryRepository;
import com.univoyage.reference.hobby.model.Hobby;
import com.univoyage.reference.hobby.repository.HobbyRepository;
import com.univoyage.reference.language.model.Language;
import com.univoyage.reference.language.repository.LanguageRepository;
import com.univoyage.reference.service.dto.ReferenceCountryResponse;
import com.univoyage.reference.service.dto.ReferenceHobbyResponse;
import com.univoyage.reference.service.dto.ReferenceLanguageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReferenceDataService {

  private final HobbyRepository hobbyRepository;
  private final LanguageRepository languageRepository;
  private final CountryRepository countryRepository;

  @Transactional(readOnly = true)
  public List<ReferenceHobbyResponse> listActiveHobbies() {
    return hobbyRepository.findByActiveTrueOrderBySortOrderAscIdAsc().stream()
        .map(ReferenceDataService::toHobby).toList();
  }

  @Transactional(readOnly = true)
  public List<ReferenceLanguageResponse> listActiveLanguages() {
    return languageRepository.findByActiveTrueOrderByLangNameAsc().stream()
        .map(ReferenceDataService::toLanguage).toList();
  }

  @Transactional(readOnly = true)
  public List<ReferenceCountryResponse> listActiveCountries() {
    return countryRepository.findByActiveTrueOrderByCountryNameAsc().stream()
        .map(ReferenceDataService::toCountry).toList();
  }

  private static ReferenceHobbyResponse toHobby(Hobby h) {
    return new ReferenceHobbyResponse(h.getId(), h.getHobbyName(), h.getDisplayLabel(),
        h.getEmoji(), h.getSortOrder());
  }

  private static ReferenceLanguageResponse toLanguage(Language l) {
    return new ReferenceLanguageResponse(l.getLangCode(), l.getLangName(), l.getEmoji(),
        l.getSortOrder());
  }

  private static ReferenceCountryResponse toCountry(Country c) {
    return new ReferenceCountryResponse(c.getIsoCode(), c.getCountryName(), c.getCurrencyCode(),
        c.getCurrencyName(), c.getSortOrder());
  }
}
