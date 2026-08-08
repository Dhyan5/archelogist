# Security Architecture & Risk Mitigations: Software Archaeologist

Repositories submitted by users are treated as **UNTRUSTED INPUT**. The system operates under strict zero-trust assumptions regarding uploaded files and repository structures.

---

## 1. Zero-Execution Mandate

### Strict Principle
Under NO circumstances will the platform execute uploaded code, build scripts, or binaries.

### Explicitly Forbidden Commands:
- `npm install`, `npm run`, `npx`
- `mvn package`, `./mvnw`, `gradle build`, `./gradlew`
- `python setup.py`, `pip install`
- Shell scripts (`.sh`, `.bat`, `.cmd`, `.ps1`)
- Binary execution (`.exe`, `.so`, `.dll`, elf binaries)

All repository understanding is performed strictly via **AST static parsing**, lexical tokenization, and metadata extraction.

---

## 2. Input Sanitization & Archive Safety

### 2.1 ZIP Archive Extraction Controls
- **Path Traversal Guard**: Prevents Zip Slip vulnerabilities by verifying that every extracted entry resolves inside the designated temporary workspace:
  ```java
  File targetFile = new File(destinationDir, entry.getName());
  if (!targetFile.getCanonicalPath().startsWith(destinationDir.getCanonicalPath() + File.separator)) {
      throw new SecurityException("Zip entry attempts path traversal: " + entry.getName());
  }
  ```
- **Zip Bomb Mitigation**:
  - Max total extracted size limit: 250 MB.
  - Max file count limit: 10,000 files.
  - Compression ratio threshold check (> 100:1 ratio aborts extraction).

### 2.2 GitHub URL Ingestion Controls
- **Protocol Restriction**: Only `https://` URLs from validated domains (e.g. `github.com`) are permitted. `file://`, `ftp://`, and local loopback IPs (`127.0.0.1`, `169.254.169.254`) are blocked (SSRF prevention).
- **Command Injection Prevention**: Git URLs are parsed into strict string tokens without shell expansion. Git operations use explicit API or sub-process parameter arrays (`git`, `clone`, `--depth`, `1`, `https://...`, `target_dir`).

---

## 3. Application Security (Auth & Data)

- **Password Hashing**: Passwords stored using BCrypt with strength factor 12.
- **JWT Protection**: Signed with HS512 secret stored securely in environment variables. Token expiry enforced.
- **Role-Based Access Control (RBAC)**:
  - `ADMIN`: User management, scan management, system stats.
  - `ANALYST`: Deep report generation, risk auditing.
  - `USER`: Upload, analyze, view personal repositories.
- **Temporary Workspace Cleanup**: Temporary scan directories (`/tmp/archaeologist/scans/{scan_id}`) are automatically purged upon scan completion or failure.
