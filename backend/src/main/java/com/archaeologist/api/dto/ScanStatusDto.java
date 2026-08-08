package com.archaeologist.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScanStatusDto {
    private String scanId;
    private String repositoryId;
    private String repositoryName;
    private String status;
    private Integer progressPercentage;
    private String currentStep;
    private Integer totalFiles;
    private Integer totalLoc;
    private Integer healthScore;
    private Integer overallRiskScore;
    private String errorMessage;
}
