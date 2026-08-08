package com.archaeologist.api.controller;

import com.archaeologist.api.dto.RepoAnalyzeUrlRequest;
import com.archaeologist.api.dto.ScanStatusDto;
import com.archaeologist.api.entity.Scan;
import com.archaeologist.api.service.ScanService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api")
public class RepositoryController {

    private final ScanService scanService;

    public RepositoryController(ScanService scanService) {
        this.scanService = scanService;
    }

    @PostMapping("/repositories/analyze-url")
    public ResponseEntity<ScanStatusDto> analyzeUrl(@Valid @RequestBody RepoAnalyzeUrlRequest request,
                                                    @AuthenticationPrincipal UserDetails userDetails) {
        String userId = userDetails != null ? userDetails.getUsername() : "anonymous-user";
        Scan scan = scanService.createUrlScan(userId, request.getRepoUrl(), request.getName());
        return new ResponseEntity<>(scanService.getScanStatus(scan.getId()), HttpStatus.ACCEPTED);
    }

    @PostMapping("/repositories/upload-zip")
    public ResponseEntity<ScanStatusDto> uploadZip(@RequestParam("file") MultipartFile file,
                                                   @AuthenticationPrincipal UserDetails userDetails) throws Exception {
        String userId = userDetails != null ? userDetails.getUsername() : "anonymous-user";
        Scan scan = scanService.createZipScan(userId, file);
        return new ResponseEntity<>(scanService.getScanStatus(scan.getId()), HttpStatus.ACCEPTED);
    }

    @GetMapping("/scans/{scanId}/status")
    public ResponseEntity<ScanStatusDto> getScanStatus(@PathVariable String scanId) {
        return ResponseEntity.ok(scanService.getScanStatus(scanId));
    }

    @GetMapping("/scans")
    public ResponseEntity<List<Scan>> getAllScans() {
        return ResponseEntity.ok(scanService.getAllScans());
    }
}
