package com.univoyage.reference.country.service;

import com.univoyage.reference.country.dto.CountryDto;
import com.univoyage.reference.country.model.Country;
import com.univoyage.reference.country.repository.CountryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CountryService {

  private final CountryRepository countryRepository;

  public List<CountryDto> getAll() {
    return countryRepository.findAll().stream().map(CountryDto::from).toList();
  }

  public CountryDto create(Country country) {
    Country saved = countryRepository.save(country);
    return CountryDto.from(saved);
  }

  public void delete(String isoCode) {
    countryRepository.deleteById(isoCode);
  }
}
