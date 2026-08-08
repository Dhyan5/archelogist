-- Software Archaeologist Database Schema (MySQL 8.0 Compatible)

CREATE DATABASE IF NOT EXISTS software_archaeologist;
USE software_archaeologist;

-- Drop tables if exists (for clean migrations)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS git_hotspots;
DROP TABLE IF EXISTS technical_debt_items;
DROP TABLE IF EXISTS api_endpoints;
DROP TABLE IF EXISTS dependencies;
DROP TABLE IF EXISTS code_symbols;
DROP TABLE IF EXISTS file_nodes;
DROP TABLE IF EXISTS scans;
DROP TABLE IF EXISTS repositories;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Users Table
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'ROLE_USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Repositories Table
CREATE TABLE repositories (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    source_type VARCHAR(20) NOT NULL, -- GITHUB_URL, ZIP_UPLOAD
    source_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Scans Table
CREATE TABLE scans (
    id VARCHAR(36) PRIMARY KEY,
    repository_id VARCHAR(36) NOT NULL,
    status VARCHAR(30) NOT NULL, -- QUEUED, CLONING, EXTRACTING, SCANNING, ANALYZING, COMPLETED, FAILED
    progress_percentage INT DEFAULT 0,
    current_step VARCHAR(255),
    total_files INT DEFAULT 0,
    total_loc INT DEFAULT 0,
    health_score INT DEFAULT 0,
    overall_risk_score INT DEFAULT 0,
    architecture_type VARCHAR(50) DEFAULT 'Layered Architecture',
    architecture_confidence INT DEFAULT 85,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (repository_id) REFERENCES repositories(id) ON DELETE CASCADE
);

-- 4. File Nodes Table
CREATE TABLE file_nodes (
    id VARCHAR(36) PRIMARY KEY,
    scan_id VARCHAR(36) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    language VARCHAR(50),
    loc INT DEFAULT 0,
    cyclomatic_complexity INT DEFAULT 0,
    risk_score INT DEFAULT 0,
    churn_count INT DEFAULT 0,
    component_type VARCHAR(50), -- CONTROLLER, SERVICE, REPOSITORY, MODEL, UTIL, CONFIG, UNKNOWN
    FOREIGN KEY (scan_id) REFERENCES scans(id) ON DELETE CASCADE
);

-- 5. Code Symbols Table
CREATE TABLE code_symbols (
    id VARCHAR(36) PRIMARY KEY,
    file_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    symbol_type VARCHAR(50) NOT NULL, -- CLASS, INTERFACE, METHOD, FUNCTION, ANNOTATION, CONSTANT
    line_start INT,
    line_end INT,
    signature VARCHAR(500),
    FOREIGN KEY (file_id) REFERENCES file_nodes(id) ON DELETE CASCADE
);

-- 6. Dependencies Table
CREATE TABLE dependencies (
    id VARCHAR(36) PRIMARY KEY,
    scan_id VARCHAR(36) NOT NULL,
    source_path VARCHAR(500) NOT NULL,
    target_path VARCHAR(500) NOT NULL,
    relation_type VARCHAR(50) NOT NULL, -- IMPORTS, CALLS, EXTENDS, IMPLEMENTS, DB_QUERY, API_CALL
    FOREIGN KEY (scan_id) REFERENCES scans(id) ON DELETE CASCADE
);

-- 7. API Endpoints Table
CREATE TABLE api_endpoints (
    id VARCHAR(36) PRIMARY KEY,
    scan_id VARCHAR(36) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    http_method VARCHAR(10) NOT NULL,
    endpoint_path VARCHAR(255) NOT NULL,
    controller_name VARCHAR(255),
    handler_method VARCHAR(255),
    FOREIGN KEY (scan_id) REFERENCES scans(id) ON DELETE CASCADE
);

-- 8. Technical Debt Items Table
CREATE TABLE technical_debt_items (
    id VARCHAR(36) PRIMARY KEY,
    scan_id VARCHAR(36) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    line_number INT,
    severity VARCHAR(20) NOT NULL, -- CRITICAL, HIGH, MEDIUM, LOW
    category VARCHAR(50) NOT NULL, -- LONG_METHOD, GOD_CLASS, HIGH_COMPLEXITY, CIRCULAR_DEP, TODO_COMMENT
    description TEXT NOT NULL,
    recommendation TEXT,
    FOREIGN KEY (scan_id) REFERENCES scans(id) ON DELETE CASCADE
);

-- 9. Git Hotspots Table
CREATE TABLE git_hotspots (
    id VARCHAR(36) PRIMARY KEY,
    scan_id VARCHAR(36) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    commit_count INT DEFAULT 0,
    complexity_score INT DEFAULT 0,
    risk_score INT DEFAULT 0,
    FOREIGN KEY (scan_id) REFERENCES scans(id) ON DELETE CASCADE
);
