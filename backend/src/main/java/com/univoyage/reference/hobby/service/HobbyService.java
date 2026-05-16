package com.univoyage.reference.hobby.service;

import com.univoyage.reference.hobby.dto.HobbyDto;
import com.univoyage.reference.hobby.model.Hobby;
import com.univoyage.reference.hobby.repository.HobbyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HobbyService {

  private final HobbyRepository hobbyRepository;

  public List<HobbyDto> getAll() {
    return hobbyRepository.findAll().stream().map(HobbyDto::from).toList();
  }

  public HobbyDto create(Hobby hobby) {
    return HobbyDto.from(hobbyRepository.save(hobby));
  }

  public void delete(Long id) {
    hobbyRepository.deleteById(id);
  }
}
