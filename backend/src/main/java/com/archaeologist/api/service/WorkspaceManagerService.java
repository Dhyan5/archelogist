package com.archaeologist.api.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.file.*;
import java.util.Comparator;
import java.util.regex.Pattern;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Service
public class WorkspaceManagerService {

    @Value("${analyzer.workspace.dir:./tmp/workspace}")
    private String baseWorkspaceDir;

    private static final Pattern SAFE_URL_PATTERN = Pattern.compile("^https://github\\.com/[a-zA-Z0-9_.-]+/[a-zA-Z0-9_.-]+(\\.git)?$");
    private static final long MAX_UNZIP_SIZE_BYTES = 250 * 1024 * 1024; // 250 MB
    private static final int MAX_UNZIP_FILES = 10000;

    public File createScanWorkspace(String scanId) throws IOException {
        Path workspacePath = Paths.get(baseWorkspaceDir, scanId).toAbsolutePath().normalize();
        if (Files.exists(workspacePath)) {
            deleteDirectory(workspacePath);
        }
        Files.createDirectories(workspacePath);
        return workspacePath.toFile();
    }

    public void cloneRepositorySafely(String gitUrl, File workspaceDir) throws IOException, InterruptedException {
        if (gitUrl == null || !SAFE_URL_PATTERN.matcher(gitUrl.trim()).matches()) {
            throw new IllegalArgumentException("Invalid or untrusted GitHub URL. Only public https://github.com/ repositories are supported.");
        }

        ProcessBuilder processBuilder = new ProcessBuilder("git", "clone", "--depth", "1", gitUrl.trim(), workspaceDir.getAbsolutePath());
        processBuilder.redirectErrorStream(true);
        Process process = processBuilder.start();

        boolean finished = process.waitFor(120, java.util.concurrent.TimeUnit.SECONDS);
        if (!finished) {
            process.destroyForcibly();
            throw new IOException("Git clone operation timed out after 120 seconds.");
        }

        if (process.exitValue() != 0) {
            throw new IOException("Git clone failed with exit code: " + process.exitValue());
        }
    }

    public void extractZipSafely(MultipartFile zipFile, File workspaceDir) throws IOException {
        long totalBytesRead = 0;
        int totalFileCount = 0;

        try (ZipInputStream zis = new ZipInputStream(zipFile.getInputStream())) {
            ZipEntry entry = zis.getNextEntry();
            while (entry != null) {
                File newFile = new File(workspaceDir, entry.getName());
                
                // Zip Slip Path Traversal Defense
                String destDirPath = workspaceDir.getCanonicalPath();
                String destFilePath = newFile.getCanonicalPath();
                if (!destFilePath.startsWith(destDirPath + File.separator)) {
                    throw new SecurityException("Zip entry attempts path traversal attack: " + entry.getName());
                }

                if (entry.isDirectory()) {
                    newFile.mkdirs();
                } else {
                    newFile.getParentFile().mkdirs();
                    try (BufferedOutputStream bos = new BufferedOutputStream(new FileOutputStream(newFile))) {
                        byte[] buffer = new byte[8192];
                        int len;
                        while ((len = zis.read(buffer)) > 0) {
                            bos.write(buffer, 0, len);
                            totalBytesRead += len;
                            if (totalBytesRead > MAX_UNZIP_SIZE_BYTES) {
                                throw new SecurityException("Zip extraction exceeded maximum total size limit (250MB).");
                            }
                        }
                    }
                    totalFileCount++;
                    if (totalFileCount > MAX_UNZIP_FILES) {
                        throw new SecurityException("Zip extraction exceeded maximum allowed file count limit (10000 files).");
                    }
                }
                entry = zis.getNextEntry();
            }
        }
    }

    public void cleanWorkspace(String scanId) {
        try {
            Path workspacePath = Paths.get(baseWorkspaceDir, scanId).toAbsolutePath().normalize();
            if (Files.exists(workspacePath)) {
                deleteDirectory(workspacePath);
            }
        } catch (Exception e) {
            // Log warning
        }
    }

    private void deleteDirectory(Path path) throws IOException {
        Files.walk(path)
                .sorted(Comparator.reverseOrder())
                .map(Path::toFile)
                .forEach(File::delete);
    }
}
