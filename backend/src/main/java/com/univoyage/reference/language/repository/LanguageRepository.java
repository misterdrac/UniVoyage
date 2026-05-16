package com.univoyage.reference.language.repository;

import com.univoyage.reference.language.model.Language;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for Language entities.
 */
@Repository
public interface LanguageRepository extends JpaRepository<Language, String> {

  List<Language> findByActiveTrueOrderByLangNameAsc();

  @Query("SELECT l FROM Language l WHERE LOWER(l.langCode) LIKE LOWER(CONCAT('%', :q, '%')) "
      + "OR LOWER(l.langName) LIKE LOWER(CONCAT('%', :q, '%'))")
  Page<Language> search(@Param("q") String q, Pageable pageable);

  boolean existsByLangNameAndLangCodeNot(String langName, String langCode);

  boolean existsByLangName(String langName);

  @Query("SELECT COALESCE(MAX(l.sortOrder), -1) FROM Language l")
  int findMaxSortOrder();
}
