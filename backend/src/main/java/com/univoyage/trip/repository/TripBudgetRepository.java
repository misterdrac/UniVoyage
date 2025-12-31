package com.univoyage.trip.repository;

import com.univoyage.trip.model.TripBudgetEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TripBudgetRepository extends JpaRepository<TripBudgetEntity, Long> {}
