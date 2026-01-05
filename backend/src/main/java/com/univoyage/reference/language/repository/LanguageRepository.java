package com.univoyage.reference.language.repository;

import com.univoyage.reference.language.model.Language;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for Language entities.
 */
@Repository
public interface LanguageRepository extends JpaRepository<Language, String> {

}