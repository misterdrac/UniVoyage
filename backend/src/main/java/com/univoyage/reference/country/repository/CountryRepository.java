package com.univoyage.reference.country.repository;

import com.univoyage.reference.country.model.Country;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for Country entities. Extends JpaRepository to provide
 * CRUD operations and custom query methods.
 */
@Repository
public interface CountryRepository extends JpaRepository<Country, String> {
  Optional<Country> findByIsoCode(String isoCode);

  List<Country> findByActiveTrueOrderByCountryNameAsc();

  @Query("SELECT c FROM Country c WHERE LOWER(c.isoCode) LIKE LOWER(CONCAT('%', :q, '%')) "
      + "OR LOWER(c.countryName) LIKE LOWER(CONCAT('%', :q, '%'))")
  Page<Country> search(@Param("q") String q, Pageable pageable);

  boolean existsByCountryName(String countryName);

  boolean existsByCountryNameAndIsoCodeNot(String countryName, String isoCode);
}
