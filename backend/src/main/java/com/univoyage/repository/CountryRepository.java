package com.univoyage.auth.repository;

import com.univoyage.auth.user.relations.Country;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CountryRepository extends JpaRepository<Country, String> {
    Optional<Country> findByIsoCode(String isoCode);
}