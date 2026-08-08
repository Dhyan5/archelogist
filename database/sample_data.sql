-- Sample Data for Testing Software Archaeologist Database

USE software_archaeologist;

-- Sample Seed Users (Password: Password123! hashed with BCrypt)
-- Hash: $2a$12$e7r0X3n2wY4B3Jv6Z0Z6.eRz3D2v1c5b4a3f2e1d0c9b8a7f6e5d
INSERT INTO users (id, username, email, password_hash, role) VALUES
('usr-admin-001', 'admin', 'admin@archaeologist.io', '$2a$12$e7r0X3n2wY4B3Jv6Z0Z6.eRz3D2v1c5b4a3f2e1d0c9b8a7f6e5d', 'ROLE_ADMIN'),
('usr-analyst-001', 'analyst', 'analyst@archaeologist.io', '$2a$12$e7r0X3n2wY4B3Jv6Z0Z6.eRz3D2v1c5b4a3f2e1d0c9b8a7f6e5d', 'ROLE_ANALYST'),
('usr-user-001', 'user', 'user@archaeologist.io', '$2a$12$e7r0X3n2wY4B3Jv6Z0Z6.eRz3D2v1c5b4a3f2e1d0c9b8a7f6e5d', 'ROLE_USER');

-- Sample Repository
INSERT INTO repositories (id, user_id, name, source_type, source_url) VALUES
('repo-demo-001', 'usr-user-001', 'e-commerce-legacy-service', 'GITHUB_URL', 'https://github.com/example/e-commerce-legacy-service.git');

-- Sample Scan
INSERT INTO scans (id, repository_id, status, progress_percentage, current_step, total_files, total_loc, health_score, overall_risk_score, architecture_type, architecture_confidence, started_at, completed_at) VALUES
('scan-demo-001', 'repo-demo-001', 'COMPLETED', 100, 'Analysis complete', 42, 8750, 78, 64, 'Layered MVC Architecture', 92, NOW() - INTERVAL 10 MINUTE, NOW());
