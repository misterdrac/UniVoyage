package com.univoyage.auth.repository;

import com.univoyage.auth.user.relations.Language;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LanguageRepository extends JpaRepository<Language, String> {

}