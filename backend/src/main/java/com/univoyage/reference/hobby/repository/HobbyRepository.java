package com.univoyage.reference.hobby.repository;

import com.univoyage.reference.hobby.model.Hobby;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HobbyRepository extends JpaRepository<Hobby, Long> {

}