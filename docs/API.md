# API Specification: Software Archaeologist

All APIs use standard REST conventions. Authentication uses `Authorization: Bearer <JWT_TOKEN>`. Response payloads are JSON formatted.

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
Registers a new user.
- **Request Body**:
  ```json
  {
    "username": "johndoe",
    "email": "john@example.com",
    "password": "SecurePassword123!",
    "role": "USER"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "message": "User registered successfully",
    "userId": "uuid-v4-string"
  }
  ```

### `POST /api/auth/login`
Authenticates a user and returns a JWT token.
- **Request Body**:
  ```json
  {
    "username": "johndoe",
    "password": "SecurePassword123!"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "token": "jwt.bearer.token.string",
    "tokenType": "Bearer",
    "username": "johndoe",
    "role": "USER"
  }
  ```

### `GET /api/auth/me`
Retrieves details of the currently authenticated user.
- **Response (200 OK)**: User profile details and assigned permissions.

---

## 2. Repository & Scan Endpoints

### `POST /api/repositories/analyze-url`
Submits a public GitHub repository URL for analysis.
- **Request Body**:
  ```json
  {
    "repoUrl": "https://github.com/owner/repository.git",
    "branch": "main"
  }
  ```
- **Response (202 Accepted)**:
  ```json
  {
    "scanId": "scan-12345",
    "status": "QUEUED",
    "message": "Repository analysis queued"
  }
  ```

### `POST /api/repositories/upload-zip`
Uploads a `.zip` archive containing source code for analysis.
- **Form Data**: `file` (multipart file)
- **Response (202 Accepted)**: Scan record object with `scanId` and `status`.

### `GET /api/scans/{scanId}/status`
Retrieves real-time execution status and progress of a scan.
- **Response (200 OK)**:
  ```json
  {
    "scanId": "scan-12345",
    "status": "ANALYZING",
    "progressPercentage": 65,
    "currentStep": "Calculating risk scores and technical debt",
    "errorMessage": null
  }
  ```

### `GET /api/scans`
Lists all scans belonging to the user (or all scans for ADMIN).

### `GET /api/scans/{scanId}/dashboard`
Retrieves aggregated repository metrics for the main dashboard.
- **Response (200 OK)**: Total LOC, file count, language distribution %, architecture health score, overall risk score, detected frameworks, key risk modules.

---

## 3. Architecture & Code Analysis Endpoints

### `GET /api/scans/{scanId}/structure`
Returns the hierarchical file tree with associated metrics per node.

### `GET /api/scans/{scanId}/dependencies`
Returns graph nodes and directed edges for interactive Cytoscape visualization.
- **Query Params**: `fileId`, `nodeType`, `maxDepth`

### `GET /api/scans/{scanId}/apis`
Returns all discovered REST controllers and endpoints with parameters and associated service mappings.

### `GET /api/scans/{scanId}/database`
Returns detected database entities, tables, ORM relationships, and raw SQL interactions.

### `GET /api/scans/{scanId}/architecture`
Returns inferred software architecture pattern (Monolith, Layered, MVC, Microservices) with confidence score and evidence list.

---

## 4. Risk, Debt & Impact Endpoints

### `GET /api/scans/{scanId}/risk-analysis`
Returns overall repository risk breakdown, top high-risk modules, and risk factor weights.

### `GET /api/scans/{scanId}/technical-debt`
Returns categorized technical debt findings (CRITICAL, HIGH, MEDIUM, LOW) with line numbers and refactoring guidance.

### `GET /api/scans/{scanId}/impact-analysis`
Calculates impact of modifying a specific target file or class.
- **Query Params**: `targetPath=/src/main/java/com/example/AuthService.java`
- **Response (200 OK)**:
  ```json
  {
    "target": "AuthService.java",
    "impactScore": 84,
    "impactLevel": "HIGH",
    "directDependents": ["LoginController.java", "SecurityConfig.java"],
    "indirectDependents": ["SessionService.java", "UserController.java"],
    "dependencyGraph": { "nodes": [], "edges": [] }
  }
  ```

---

## 5. Git Archaeology & AI Endpoints

### `GET /api/scans/{scanId}/git-history`
Returns Git timeline, commit stats, top contributors, and high-frequency change hotspots.

### `POST /api/scans/{scanId}/ai/explain`
Generates AST-grounded explanation for a specified file, method, or architectural layer.
- **Request Body**: `{ "filePath": "src/services/PaymentService.ts" }`

### `POST /api/scans/{scanId}/ai/query`
Repository Q&A assistant endpoint.
- **Request Body**: `{ "question": "Where is user authentication implemented?" }`
- **Response (200 OK)**: Answer with clickable line numbers and file paths.

### `GET /api/scans/{scanId}/report/pdf`
Generates and downloads the full PDF Software Archaeology Report.
