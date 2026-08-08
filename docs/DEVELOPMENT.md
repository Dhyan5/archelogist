# Development & Phase Roadmap: Software Archaeologist

## Monorepo Directory Structure

```
software-archaeologist/
├── frontend/             # React + TypeScript + Cytoscape + Recharts UI
├── backend/              # Spring Boot Java REST API & Security
├── analyzer/             # Python Static Analyzer & AST Microservice
├── database/             # Schema DDL, migrations, sample SQL
├── docs/                 # Platform Documentation
├── scripts/              # Setup & Build Scripts
└── docker-compose.yml    # Orchestration for local execution
```

---

## Roadmap of Implementation Phases

| Phase | Title | Objective |
|---|---|---|
| **Phase 0** | Project Planning | System architecture, DDL, Security, API docs, Implementation plan |
| **Phase 1** | Monorepo Foundation | Initialize directories, Vite React UI, Spring Boot Java backend, Python Analyzer service, Docker Compose |
| **Phase 2** | Auth & Security | Spring Security, JWT tokens, BCrypt, RBAC (`ADMIN`, `ANALYST`, `USER`), auth endpoints |
| **Phase 3** | Ingestion Engine | Safe ZIP extraction & GitHub cloning pipeline, status queue (`QUEUED` to `COMPLETED`) |
| **Phase 4** | Metadata Analyzer | LOC, file counts, directory tree, build configuration file detector |
| **Phase 5** | Language Detection | Extension & heuristic language classifier (Java, TS, Python, SQL, C#, etc.) |
| **Phase 6** | Structure Analysis | Interactive file tree data structure & filtering API |
| **Phase 7** | Source Code AST Analysis | Language-specific symbol parser for Java, Python, JavaScript, TypeScript |
| **Phase 8** | Dependency Analysis | Edge extraction for imports, calls, inheritance, DB queries |
| **Phase 9** | Interactive Graph UI | Cytoscape.js directed dependency graph visualization |
| **Phase 10** | API Endpoint Discovery | Framework REST route parser (`@GetMapping`, `@PostMapping`, etc.) |
| **Phase 11** | Database ORM Discovery | SQL & JPA entity relationship inference (`@Entity`, `@Table`, FKs) |
| **Phase 12** | Architecture Pattern Engine | Heuristic architecture style inference (Layered, MVC, Monolith) |
| **Phase 13** | Git Archaeology | Churn history, commit velocity, author contributions, commit timeline |
| **Phase 14** | Hotspot Analysis | High-change, high-complexity hotspot scoring |
| **Phase 15** | Code Complexity | Cyclomatic complexity, fan-in/fan-out metrics calculation |
| **Phase 16** | Technical Debt Analyzer | Code smell finder (God classes, long methods, TODOs, circular deps) |
| **Phase 17** | Risk Engine | Multi-factor risk scoring engine (0-100 score) |
| **Phase 18** | "What Breaks If I Change This?" | Direct & indirect dependency impact propagation analysis |
| **Phase 19** | Architecture Health Score | Aggregated maintainability & health score (0-100) |
| **Phase 20** | Evolution Timeline | Software evolution timeline from commit metadata |
| **Phase 21** | AI Explanation Layer | File & class functional logic explainer |
| **Phase 22** | Repository Q&A | Evidence-grounded conversational repository Q&A |
| **Phase 23** | AI Architecture Breakdown | Comprehensive architectural synthesis & recommendations |
| **Phase 24** | Dashboard UI | Main metrics dashboard with language charts & health scores |
| **Phase 25** | Visual Analytics | Interactive visual charts for risk distribution & hotspots |
| **Phase 26** | Code Explorer UI | File tree + syntax highlighter + AST symbol inspector |
| **Phase 27** | PDF Report Generator | Full PDF Software Archaeology Report generation |
| **Phase 28** | Automated Testing | Java JUnit/MockMvc, Python pytest, Frontend testing |
| **Phase 29** | Sample Repositories | Curated sample projects for end-to-end testing |
| **Phase 30** | Performance & Async | Background thread pool & non-blocking execution |
| **Phase 31** | Error Handling | Graceful error recovery & partial scan parsing resilience |
| **Phase 32** | AWS Cloud Readiness | Environment config, S3 storage abstraction, RDS compatibility |
| **Phase 33** | Container Orchestration | Dockerfiles & Docker Compose setup for local execution |
| **Phase 34** | Documentation | Comprehensive user guide & API references |
| **Phase 35** | UI Polish | Theme styling, loading states, tooltips, responsive layout |
| **Phase 36** | Security Audit | Vulnerability sweep (SQLi, XSS, Zip slip, SSRF) |
| **Phase 37** | Final Integration & Build | Build validation for Java, React, and Python services |
| **Phase 38** | Final Demo Scenario | Scripted walkthrough scenario for presentation |
