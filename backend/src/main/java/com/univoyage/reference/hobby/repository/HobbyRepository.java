package com.univoyage.reference.hobby.repository;

import com.univoyage.reference.hobby.model.Hobby;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for managing Hobby entities.
 */
@Repository
public interface HobbyRepository extends JpaRepository<Hobby, Long> {

  List<Hobby> findByActiveTrueOrderBySortOrderAscIdAsc();

  @Query("SELECT h FROM Hobby h WHERE LOWER(h.hobbyName) LIKE LOWER(CONCAT('%', :q, '%')) "
      + "OR LOWER(h.displayLabel) LIKE LOWER(CONCAT('%', :q, '%'))")
  Page<Hobby> search(@Param("q") String q, Pageable pageable);

  boolean existsByHobbyName(String hobbyName);

  boolean existsByHobbyNameAndIdNot(String hobbyName, Long id);

  @Query("SELECT COALESCE(MAX(h.sortOrder), -1) FROM Hobby h")
  int findMaxSortOrder();
}
