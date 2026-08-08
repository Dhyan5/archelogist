# System Architecture: Software Archaeologist

## Executive Summary
"Software Archaeologist" is an enterprise-grade AI-powered legacy software reverse engineering, architecture discovery, risk analysis, and evolution platform. It enables software engineers, architects, and technical leaders to comprehend complex, legacy, or undocumented codebases safely through static analysis, dependency graph construction, Git archaeology, and evidence-grounded AI explanations.

---

## 1. High-Level Architecture Overview

```
                      +-----------------------------+
                      |     React + TypeScript      |
                      |          Frontend           |
                      +--------------+--------------+
                                     |
                             REST API / WebSockets
                                     v
                      +--------------+--------------+
                      |     Spring Boot Backend     |
                      |   (Java 17 / Spring 6)     |
                      +-------+--------------+------+
                              |              |
                      +-------v------+       +------v-------+
                      | MySQL DB     |              | Python        |
                      | (Entities &  |              | Static        |
                      | Scan Storage)|              | Analyzer      |
                      +--------------+              +-------+-------+
                                                            |
                  +-----------------------------------------+-----------------------------------------+
                  |                 |                       |                    |                    |
                  v                 v                       v                    v                    v
         Code Structural      Language & File           Dependency & Edge     Git Archaeology      Risk & Debt Engine
             Analyzer            Detector                   Extractor             Analyzer             & Impact Graph
```

---

## 2. Core Service Components

### 2.1 Frontend Component (React + TypeScript)
- **State & Router**: React Router v6, React Context API / Zustand for scan and session state.
- **Visualization Engines**: Cytoscape.js / React Flow for interactive 2D graph node relationships (Files, Classes, Endpoints, Tables), Recharts / Chart.js for health scores, cyclomatic metrics, and language breakdowns.
- **Code Explorer**: Syntax-highlighted code viewer integrated with AST symbol tooltips, dependency badges, risk scores, and technical debt indicators.
- **AI Assistant**: Interactive chat interface with clickable evidence citations linking directly to file lines in the repository.

### 2.2 Backend Service (Spring Boot)
- **Authentication & Security**: Spring Security, JWT (JSON Web Tokens), BCrypt password encoder, Role-Based Access Control (`ADMIN`, `ANALYST`, `USER`).
- **Scan Management**: Async scan queue using `@Async` TaskExecutor, tracking scan statuses (`QUEUED`, `CLONING`, `EXTRACTING`, `SCANNING`, `ANALYZING`, `FINALIZING`, `COMPLETED`, `FAILED`).
- **REST APIs**: Repository management, scan history, visual graph payloads, technical debt queries, impact propagation queries, PDF export endpoint.
- **Bridge to Analyzer**: Internal HTTP REST client communicating with the isolated Python analysis microservice.

### 2.3 Analyzer Engine (Python Microservice)
- **Static Parser**: `ast` module for Python, regex and lightweight AST parser for Java, JavaScript, TypeScript, PHP, C#, etc.
- **Metadata & Language Detector**: File extension mapping combined with content heuristics to identify 12+ programming languages and frameworks (Spring Boot, React, Django, Express, etc.).
- **Dependency & Impact Engine**: Builds directed graph edges for imports, calls, inheritance, and API route mappings. Computes graph depth for "What breaks if I change this?" impact score (0-100).
- **Git Archaeology Module**: Parses Git logs safely (commit frequencies, churn metrics, hotspot calculation, author distribution) without executing repository scripts or hooks.
- **Risk & Debt Analyzer**: Computes cyclomatic complexity, nesting depth, coupling (fan-in/fan-out), circular dependencies, and technical debt severity (CRITICAL, HIGH, MEDIUM, LOW).
- **AI RAG / Explanation Layer**: Context-building layer that feeds AST findings and dependency edges into AI prompts for hallucination-free repository Q&A and architecture explanations.

---

## 3. Data Flow Pipeline

1. **Ingestion Request**: User submits GitHub URL or uploads a ZIP file via Frontend.
2. **Validation & Isolation**: Backend validates input URL/ZIP, creates a temporary workspace directory (`/tmp/archaeologist/scans/{scan_id}`), and verifies safety rules (no path traversal, zip bombs, SSRF).
3. **Queue & Status Update**: Scan record created in MySQL (`status = QUEUED`), client polls or listens to updates.
4. **Static Extraction**:
   - GitHub: Safe shallow clone (`git clone --depth 1`) with timeout.
   - ZIP: Path-checked decompression.
5. **Python Analysis Call**: Backend invokes Python Analyzer endpoint with local workspace path.
6. **Multi-Stage Analysis**:
   - Stage 1: Metadata & Language Detection
   - Stage 2: File Tree & Structural Parsing (AST / Symbols)
   - Stage 3: Dependency Graph Edge Extraction
   - Stage 4: API Endpoint & Database ORM Mapping
   - Stage 5: Architecture Style Pattern Inference
   - Stage 6: Git History Archaeology & Hotspot Calculation
   - Stage 7: Cyclomatic Complexity, Debt & Risk Calculation
   - Stage 8: Impact Chain Pre-calculation
7. **Persistence**: Python service returns JSON payload; Spring Boot persists findings to MySQL tables (`file_nodes`, `code_symbols`, `dependencies`, `api_endpoints`, `technical_debt_items`, `git_hotspots`).
8. **Visualization**: Frontend queries REST APIs to render interactive graph, metrics dashboard, impact graph, and AI Q&A.
