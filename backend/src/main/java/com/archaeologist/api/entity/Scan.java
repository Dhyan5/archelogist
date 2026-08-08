package com.archaeologist.api.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "scans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Scan {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "repository_id", nullable = false)
    private String repositoryId;

    @Column(nullable = false, length = 30)
    private String status; // QUEUED, CLONING, EXTRACTING, SCANNING, ANALYZING, COMPLETED, FAILED

    @Column(name = "progress_percentage")
    private Integer progressPercentage = 0;

    @Column(name = "current_step")
    private String currentStep;

    @Column(name = "total_files")
    private Integer totalFiles = 0;

    @Column(name = "total_loc")
    private Integer totalLoc = 0;

    @Column(name = "health_score")
    private Integer healthScore = 0;

    @Column(name = "overall_risk_score")
    private Integer overallRiskScore = 0;

    @Column(name = "architecture_type")
    private String architectureType = "Layered Architecture";

    @Column(name = "architecture_confidence")
    private Integer architectureConfidence = 85;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
