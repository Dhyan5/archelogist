package com.archaeologist.api.repository;

import com.archaeologist.api.entity.Scan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ScanRepository extends JpaRepository<Scan, String> {
    List<Scan> findByRepositoryIdOrderByCreatedAtDesc(String repositoryId);
    Optional<Scan> findFirstByRepositoryIdOrderByCreatedAtDesc(String repositoryId);
}
