package com.archaeologist.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RepoAnalyzeUrlRequest {

    @NotBlank(message = "GitHub repository URL is required")
    private String repoUrl;

    private String name;
}
