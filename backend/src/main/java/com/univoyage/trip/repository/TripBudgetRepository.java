package com.univoyage.trip.repository;

import com.univoyage.trip.model.TripBudgetEntity;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository interface for TripBudgetEntity.
 */
public interface TripBudgetRepository extends JpaRepository<TripBudgetEntity, Long> {}
