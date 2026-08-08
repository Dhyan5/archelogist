package com.archaeologist.api.repository;

import com.archaeologist.api.entity.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RepositoryRepository extends JpaRepository<Repository, String> {
    List<Repository> findByUserId(String userId);
}
