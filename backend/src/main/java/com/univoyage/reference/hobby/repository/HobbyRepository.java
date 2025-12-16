package com.univoyage.reference.hobby.repository;

import com.univoyage.auth.user.relations.Hobby;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HobbyRepository extends JpaRepository<Hobby, Long> {

}