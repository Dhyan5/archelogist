# Software Archaeologist

> **AI-Powered Legacy Software Reverse Engineering, Architecture Discovery, Risk Analysis and Evolution Platform**

"Understand any software repository. Reconstruct its architecture. Discover its history. Predict what could break."

---

## Overview

Software Archaeologist is an enterprise platform designed to analyze existing, legacy, undocumented, or complex software repositories safely through static analysis, AST symbol parsing, dependency graph extraction, Git archaeology, and evidence-grounded AI explanations.

### Key Capabilities
- **Static Analysis & Parsing**: Parses Java, Python, JavaScript, TypeScript, SQL, C#, and HTML/CSS without executing untrusted repository code or build scripts.
- **Interactive Dependency Visualization**: Renders interactive 2D graph nodes (Files, Classes, Endpoints, Database Tables) with Cytoscape.js.
- **"What Breaks If I Change This?"**: Calculates multi-level impact propagation chains and direct/indirect dependent risk scores.
- **Git Archaeology & Change Hotspots**: Computes commit churn velocity, contributor activity, and high-complexity hotspot modules.
- **Technical Debt & Health Scoring**: Identifies God classes, long methods, circular dependencies, and computes overall Architecture Health (0-100).
- **Evidence-Grounded AI Assistant**: Repository Q&A engine with clickable line-number evidence citations.
- **PDF Report Generation**: Exports comprehensive Software Archaeology PDF reports.

---

## Monorepo Architecture

```
software-archaeologist/
├── frontend/             # React 18 + TypeScript + Vite Enterprise Dashboard
├── backend/              # Java 17 + Spring Boot 3 + Spring Security JWT
├── analyzer/             # Python 3.12 AST Static Analysis Microservice
├── database/             # MySQL DDL Schema & Initial Data
├── docs/                 # Platform Documentation (Architecture, API, Security)
├── scripts/              # Development setup and automation scripts
└── docker-compose.yml    # Multi-container orchestration configuration
```

---

## Quick Start (Local Development)

### Prerequisites
- Node.js (v18+) & npm
- Python (v3.10+)
- Java (JDK 17+) & Maven *(or Python local analyzer mode)*
- MySQL (v8.0+) *(or SQLite fallback mode)*

### 1. Python Analyzer Microservice
```bash
cd analyzer
python -m venv venv
# On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```
*Analyzer starts on `http://localhost:8000`*

### 2. Spring Boot Backend API
```bash
cd backend
mvn clean install
mvn spring-boot:run
```
*Backend starts on `http://localhost:8080`*

### 3. React TypeScript Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend starts on `http://localhost:3000`*

---

## Docker Execution

```bash
docker-compose up --build
```

---

## Documentation Links
- [System Architecture](docs/ARCHITECTURE.md)
- [API Specifications](docs/API.md)
- [Database Schema](docs/DATABASE.md)
- [Security Guidelines](docs/SECURITY.md)
- [Development Roadmap](docs/DEVELOPMENT.md)
