package com.archaeologist.api.service;

import com.archaeologist.api.dto.ScanStatusDto;
import com.archaeologist.api.entity.Repository;
import com.archaeologist.api.entity.Scan;
import com.archaeologist.api.repository.RepositoryRepository;
import com.archaeologist.api.repository.ScanRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ScanService {

    private final RepositoryRepository repositoryRepository;
    private final ScanRepository scanRepository;
    private final WorkspaceManagerService workspaceManagerService;
    private final RestTemplate restTemplate;

    @Value("${analyzer.service.url:http://localhost:8000}")
    private String analyzerServiceUrl;

    public ScanService(RepositoryRepository repositoryRepository,
                       ScanRepository scanRepository,
                       WorkspaceManagerService workspaceManagerService) {
        this.repositoryRepository = repositoryRepository;
        this.scanRepository = scanRepository;
        this.workspaceManagerService = workspaceManagerService;
        this.restTemplate = new RestTemplate();
    }

    public Scan createUrlScan(String userId, String repoUrl, String name) {
        String repoName = name != null && !name.isBlank() ? name : extractRepoNameFromUrl(repoUrl);

        Repository repository = Repository.builder()
                .userId(userId)
                .name(repoName)
                .sourceType("GITHUB_URL")
                .sourceUrl(repoUrl)
                .build();
        repository = repositoryRepository.save(repository);

        Scan scan = Scan.builder()
                .repositoryId(repository.getId())
                .status("QUEUED")
                .progressPercentage(5)
                .currentStep("Scan queued for GitHub repository analysis")
                .startedAt(LocalDateTime.now())
                .build();
        scan = scanRepository.save(scan);

        processUrlScanAsync(scan.getId(), repository.getSourceUrl());

        return scan;
    }

    public Scan createZipScan(String userId, MultipartFile file) throws Exception {
        String repoName = file.getOriginalFilename() != null ? file.getOriginalFilename().replace(".zip", "") : "Uploaded Repository";

        Repository repository = Repository.builder()
                .userId(userId)
                .name(repoName)
                .sourceType("ZIP_UPLOAD")
                .sourceUrl(file.getOriginalFilename())
                .build();
        repository = repositoryRepository.save(repository);

        Scan scan = Scan.builder()
                .repositoryId(repository.getId())
                .status("QUEUED")
                .progressPercentage(5)
                .currentStep("Scan queued for ZIP extraction")
                .startedAt(LocalDateTime.now())
                .build();
        scan = scanRepository.save(scan);

        File workspaceDir = workspaceManagerService.createScanWorkspace(scan.getId());
        updateScanProgress(scan.getId(), "EXTRACTING", 20, "Extracting uploaded ZIP archive securely");
        workspaceManagerService.extractZipSafely(file, workspaceDir);

        processWorkspaceAsync(scan.getId(), workspaceDir.getAbsolutePath(), repository.getName());

        return scan;
    }

    @Async
    public void processUrlScanAsync(String scanId, String repoUrl) {
        try {
            File workspaceDir = workspaceManagerService.createScanWorkspace(scanId);
            updateScanProgress(scanId, "CLONING", 25, "Cloning shallow Git repository safely");
            workspaceManagerService.cloneRepositorySafely(repoUrl, workspaceDir);

            processWorkspaceAsync(scanId, workspaceDir.getAbsolutePath(), extractRepoNameFromUrl(repoUrl));
        } catch (Exception e) {
            markScanFailed(scanId, "Git cloning failed: " + e.getMessage());
        }
    }

    @Async
    public void processWorkspaceAsync(String scanId, String workspacePath, String repoName) {
        try {
            updateScanProgress(scanId, "ANALYZING", 50, "Executing multi-stage Python AST static analysis");

            Map<String, Object> reqBody = new HashMap<>();
            reqBody.put("scan_id", scanId);
            reqBody.put("workspace_path", workspacePath);
            reqBody.put("repo_name", repoName);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(reqBody, headers);

            String analyzeUrl = analyzerServiceUrl + "/api/analyze";
            Map<?, ?> response = restTemplate.postForObject(analyzeUrl, entity, Map.class);

            if (response != null && "COMPLETED".equals(response.get("status"))) {
                Map<?, ?> summary = (Map<?, ?>) response.get("summary");
                int files = summary != null && summary.get("total_files") != null ? (Integer) summary.get("total_files") : 0;
                int loc = summary != null && summary.get("total_loc") != null ? (Integer) summary.get("total_loc") : 0;
                int health = summary != null && summary.get("health_score") != null ? (Integer) summary.get("health_score") : 85;
                int risk = summary != null && summary.get("overall_risk_score") != null ? (Integer) summary.get("overall_risk_score") : 30;

                Scan scan = scanRepository.findById(scanId).orElse(null);
                if (scan != null) {
                    scan.setStatus("COMPLETED");
                    scan.setProgressPercentage(100);
                    scan.setCurrentStep("Repository analysis completed successfully");
                    scan.setTotalFiles(files);
                    scan.setTotalLoc(loc);
                    scan.setHealthScore(health);
                    scan.setOverallRiskScore(risk);
                    scan.setCompletedAt(LocalDateTime.now());
                    scanRepository.save(scan);
                }
            } else {
                markScanFailed(scanId, "Analyzer service returned incomplete or error status.");
            }
        } catch (Exception e) {
            markScanFailed(scanId, "Analysis error: " + e.getMessage());
        }
    }

    public ScanStatusDto getScanStatus(String scanId) {
        Scan scan = scanRepository.findById(scanId)
                .orElseThrow(() -> new RuntimeException("Scan not found: " + scanId));

        Repository repo = repositoryRepository.findById(scan.getRepositoryId()).orElse(null);
        String repoName = repo != null ? repo.getName() : "Repository";

        return ScanStatusDto.builder()
                .scanId(scan.getId())
                .repositoryId(scan.getRepositoryId())
                .repositoryName(repoName)
                .status(scan.getStatus())
                .progressPercentage(scan.getProgressPercentage())
                .currentStep(scan.getCurrentStep())
                .totalFiles(scan.getTotalFiles())
                .totalLoc(scan.getTotalLoc())
                .healthScore(scan.getHealthScore())
                .overallRiskScore(scan.getOverallRiskScore())
                .errorMessage(scan.getErrorMessage())
                .build();
    }

    public List<Scan> getAllScans() {
        return scanRepository.findAll();
    }

    private void updateScanProgress(String scanId, String status, int progress, String step) {
        Scan scan = scanRepository.findById(scanId).orElse(null);
        if (scan != null) {
            scan.setStatus(status);
            scan.setProgressPercentage(progress);
            scan.setCurrentStep(step);
            scanRepository.save(scan);
        }
    }

    private void markScanFailed(String scanId, String error) {
        Scan scan = scanRepository.findById(scanId).orElse(null);
        if (scan != null) {
            scan.setStatus("FAILED");
            scan.setCurrentStep("Analysis failed");
            scan.setErrorMessage(error);
            scan.setCompletedAt(LocalDateTime.now());
            scanRepository.save(scan);
        }
    }

    private String extractRepoNameFromUrl(String gitUrl) {
        if (gitUrl == null) return "Repository";
        String clean = gitUrl.replace(".git", "");
        String[] parts = clean.split("/");
        return parts[parts.length - 1];
    }
}
