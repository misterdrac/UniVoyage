package com.univoyage.reference.country.repository;

import com.univoyage.reference.country.model.Country;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CountryRepository extends JpaRepository<Country, String> {
    Optional<Country> findByIsoCode(String isoCode);
}