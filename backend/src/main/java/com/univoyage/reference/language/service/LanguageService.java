package com.univoyage.reference.language.service;

import com.univoyage.reference.language.dto.LanguageDto;
import com.univoyage.reference.language.model.Language;
import com.univoyage.reference.language.repository.LanguageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LanguageService {

    private final LanguageRepository languageRepository;

    public List<LanguageDto> getAll() {
        return languageRepository.findAll()
                .stream()
                .map(LanguageDto::from)
                .toList();
    }

    public LanguageDto create(Language language) {
        return LanguageDto.from(languageRepository.save(language));
    }

    public void delete(String code) {
    languageRepository.deleteById(code);
}
}