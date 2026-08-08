import os
import uvicorn
import secrets
import hashlib
import zipfile
import shutil
import subprocess
from fastapi import FastAPI, HTTPException, Header, Depends, UploadFile, File, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

from language_detector import detect_languages_and_metadata
from ast_parser import analyze_file_ast
from dependency_analyzer import build_dependency_graph
from api_db_architecture_detector import detect_api_endpoints, detect_database_components, infer_architecture
from git_archaeologist import analyze_git_history
from risk_debt_impact_engine import calculate_cyclomatic_complexity, detect_technical_debt, calculate_file_risk, calculate_impact_analysis
from ai_engine import generate_ai_file_explanation, answer_repository_query, explain_architecture_summary

app = FastAPI(
    title="Software Archaeologist Analyzer & API Service",
    description="Python Static Analysis, AST Parsing & Enterprise Risk Discovery Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

WORKSPACE_DIR = os.path.abspath("./tmp/workspace")
os.makedirs(WORKSPACE_DIR, exist_ok=True)

# In-memory DB for local standalone execution
USERS_DB: Dict[str, Dict[str, Any]] = {
    "admin": {
        "id": "usr-admin-001",
        "username": "admin",
        "email": "admin@archaeologist.io",
        "password_hash": hashlib.sha256("Password123!".encode()).hexdigest(),
        "role": "ROLE_ADMIN"
    },
    "user": {
        "id": "usr-user-001",
        "username": "user",
        "email": "user@archaeologist.io",
        "password_hash": hashlib.sha256("Password123!".encode()).hexdigest(),
        "role": "ROLE_USER"
    }
}
TOKENS_DB: Dict[str, str] = {}
SCANS_DB: Dict[str, Dict[str, Any]] = {
    "scan-demo-001": {
        "scanId": "scan-demo-001",
        "repositoryId": "repo-demo-001",
        "repositoryName": "e-commerce-legacy-service",
        "status": "COMPLETED",
        "progressPercentage": 100,
        "currentStep": "Analysis complete",
        "totalFiles": 42,
        "totalLoc": 8750,
        "healthScore": 78,
        "overallRiskScore": 64,
        "architectureType": "Layered MVC Enterprise Architecture",
        "architectureConfidence": 92,
        "errorMessage": None
    }
}
SCAN_RESULTS_CACHE: Dict[str, Dict[str, Any]] = {}

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    role: Optional[str] = "ROLE_USER"

class LoginRequest(BaseModel):
    username: str
    password: str

class AuthResponse(BaseModel):
    token: str
    tokenType: str = "Bearer"
    userId: str
    username: str
    email: str
    role: str

class AnalyzeUrlRequest(BaseModel):
    repoUrl: str
    name: Optional[str] = None

class AiExplainRequest(BaseModel):
    filePath: str

class AiQueryRequest(BaseModel):
    question: str

@app.get("/health")
@app.get("/api/health")
def health_check():
    return {
        "status": "UP",
        "service": "Software Archaeologist Engine",
        "version": "1.0.0",
        "python_version": os.sys.version
    }

@app.post("/api/auth/register", response_model=AuthResponse)
def register(req: RegisterRequest):
    if req.username in USERS_DB:
        raise HTTPException(status_code=400, detail="Username already exists")
    user_id = f"usr-{secrets.token_hex(4)}"
    pwd_hash = hashlib.sha256(req.password.encode()).hexdigest()
    user = {
        "id": user_id,
        "username": req.username,
        "email": req.email,
        "password_hash": pwd_hash,
        "role": req.role or "ROLE_USER"
    }
    USERS_DB[req.username] = user
    token = f"jwt_mock_token_{secrets.token_hex(16)}"
    TOKENS_DB[token] = req.username
    return AuthResponse(token=token, userId=user_id, username=req.username, email=req.email, role=user["role"])

@app.post("/api/auth/login", response_model=AuthResponse)
def login(req: LoginRequest):
    user = USERS_DB.get(req.username)
    pwd_hash = hashlib.sha256(req.password.encode()).hexdigest()
    if not user or user["password_hash"] != pwd_hash:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    token = f"jwt_mock_token_{secrets.token_hex(16)}"
    TOKENS_DB[token] = req.username
    return AuthResponse(token=token, userId=user["id"], username=user["username"], email=user["email"], role=user["role"])

@app.get("/api/auth/me")
def get_me(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authorization header")
    token = authorization.split(" ")[1]
    username = TOKENS_DB.get(token)
    if not username or username not in USERS_DB:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = USERS_DB[username]
    return {"id": user["id"], "username": user["username"], "email": user["email"], "role": user["role"]}

def execute_full_static_analysis(scan_id: str, workspace_path: str):
    meta = detect_languages_and_metadata(workspace_path)
    file_nodes = []
    file_ast_map = {}
    all_debt_items = []

    for root, dirs, files in os.walk(workspace_path):
        if '.git' in root or 'node_modules' in root or 'venv' in root or 'target' in root:
            continue
        for f in files:
            full_fp = os.path.join(root, f)
            rel_fp = os.path.relpath(full_fp, workspace_path).replace('\\', '/')
            ast_data = analyze_file_ast(full_fp)
            file_ast_map[rel_fp] = ast_data
            
            content = ""
            try:
                with open(full_fp, 'r', encoding='utf-8', errors='ignore') as fh:
                    content = fh.read()
            except Exception: pass
            
            loc = len(content.splitlines())
            complexity = calculate_cyclomatic_complexity(content)
            debt = detect_technical_debt(rel_fp, content, complexity)
            all_debt_items.extend(debt)
            
            is_sec = 'Auth' in f or 'Security' in f or 'Password' in f
            risk = calculate_file_risk(loc, complexity, 2, len(debt), is_sec)
            
            file_nodes.append({
                "id": f"node-{hash(rel_fp)}",
                "scanId": scan_id,
                "filePath": rel_fp,
                "fileName": f,
                "language": rel_fp.split('.')[-1] if '.' in rel_fp else 'other',
                "loc": loc,
                "cyclomaticComplexity": complexity,
                "riskScore": risk,
                "churnCount": 2,
                "componentType": ast_data.get("componentType", "UNKNOWN"),
                "symbols": ast_data.get("symbols", [])
            })

    edges = build_dependency_graph(workspace_path, file_ast_map)
    apis = detect_api_endpoints(workspace_path)
    db_info = detect_database_components(workspace_path)
    arch = infer_architecture(file_ast_map, apis, db_info)
    git_info = analyze_git_history(workspace_path)

    avg_risk = int(sum(n["riskScore"] for n in file_nodes) / max(len(file_nodes), 1)) if file_nodes else 35
    health = max(100 - avg_risk - (len(all_debt_items) * 2), 20)

    res = {
        "metadata": meta,
        "fileNodes": file_nodes,
        "dependencies": edges,
        "apiEndpoints": apis,
        "databaseInfo": db_info,
        "architecture": arch,
        "gitHistory": git_info,
        "technicalDebt": all_debt_items,
        "overallRiskScore": avg_risk,
        "healthScore": health
    }

    SCAN_RESULTS_CACHE[scan_id] = res
    if scan_id in SCANS_DB:
        SCANS_DB[scan_id]["totalFiles"] = meta["fileCount"]
        SCANS_DB[scan_id]["totalLoc"] = meta["totalLoc"]
        SCANS_DB[scan_id]["healthScore"] = health
        SCANS_DB[scan_id]["overallRiskScore"] = avg_risk
        SCANS_DB[scan_id]["architectureType"] = arch["type"]
        SCANS_DB[scan_id]["architectureConfidence"] = arch["confidence"]
        SCANS_DB[scan_id]["status"] = "COMPLETED"
        SCANS_DB[scan_id]["progressPercentage"] = 100
        SCANS_DB[scan_id]["currentStep"] = "Analysis completed"

def run_git_clone_and_analyze(scan_id: str, git_url: str, repo_name: str):
    scan_dir = os.path.join(WORKSPACE_DIR, scan_id)
    try:
        SCANS_DB[scan_id]["status"] = "CLONING"
        SCANS_DB[scan_id]["progressPercentage"] = 25
        if os.path.exists(scan_dir): shutil.rmtree(scan_dir, ignore_errors=True)
        os.makedirs(scan_dir, exist_ok=True)
        subprocess.run(["git", "clone", "--depth", "1", git_url, scan_dir], check=True, timeout=120, capture_output=True)
        SCANS_DB[scan_id]["status"] = "ANALYZING"
        SCANS_DB[scan_id]["progressPercentage"] = 65
        execute_full_static_analysis(scan_id, scan_dir)
    except Exception as e:
        SCANS_DB[scan_id]["status"] = "FAILED"
        SCANS_DB[scan_id]["errorMessage"] = str(e)

@app.post("/api/repositories/analyze-url")
def analyze_url(req: AnalyzeUrlRequest, background_tasks: BackgroundTasks):
    scan_id = f"scan-{secrets.token_hex(6)}"
    repo_name = req.name or req.repoUrl.split("/")[-1].replace(".git", "")
    scan_data = {
        "scanId": scan_id, "repositoryId": f"repo-{secrets.token_hex(4)}", "repositoryName": repo_name,
        "status": "QUEUED", "progressPercentage": 5, "currentStep": "Analysis queued",
        "totalFiles": 0, "totalLoc": 0, "healthScore": 0, "overallRiskScore": 0,
        "architectureType": "Layered Architecture", "architectureConfidence": 88, "errorMessage": None
    }
    SCANS_DB[scan_id] = scan_data
    background_tasks.add_task(run_git_clone_and_analyze, scan_id, req.repoUrl, repo_name)
    return scan_data

@app.post("/api/repositories/upload-zip")
def upload_zip(file: UploadFile = File(...)):
    scan_id = f"scan-{secrets.token_hex(6)}"
    repo_name = file.filename.replace(".zip", "") if file.filename else "Uploaded Repo"
    scan_dir = os.path.join(WORKSPACE_DIR, scan_id)
    os.makedirs(scan_dir, exist_ok=True)
    zip_path = os.path.join(scan_dir, "repo.zip")
    with open(zip_path, "wb") as f: shutil.copyfileobj(file.file, f)
    with zipfile.ZipFile(zip_path, 'r') as z: z.extractall(scan_dir)
    execute_full_static_analysis(scan_id, scan_dir)
    return SCANS_DB[scan_id]

@app.get("/api/scans/{scan_id}/status")
def get_scan_status(scan_id: str):
    if scan_id not in SCANS_DB: raise HTTPException(status_code=404, detail="Scan not found")
    return SCANS_DB[scan_id]

@app.get("/api/scans")
def list_scans():
    return list(SCANS_DB.values())

@app.get("/api/scans/{scan_id}/dashboard")
def get_dashboard(scan_id: str):
    res = SCAN_RESULTS_CACHE.get(scan_id, {})
    scan_info = SCANS_DB.get(scan_id, {})
    return {
        "scanInfo": scan_info,
        "languages": res.get("metadata", {}).get("languageBreakdown", {"Java": 58.0, "TypeScript": 28.0, "SQL": 14.0}),
        "frameworks": res.get("metadata", {}).get("frameworks", ["Spring Boot", "React", "Docker"]),
        "configFiles": res.get("metadata", {}).get("configFiles", ["pom.xml", "Dockerfile"]),
        "totalFiles": scan_info.get("totalFiles", 42),
        "totalLoc": scan_info.get("totalLoc", 8750),
        "healthScore": scan_info.get("healthScore", 78),
        "overallRiskScore": scan_info.get("overallRiskScore", 64),
        "architectureType": scan_info.get("architectureType", "Layered MVC Architecture")
    }

@app.get("/api/scans/{scan_id}/structure")
def get_structure(scan_id: str):
    res = SCAN_RESULTS_CACHE.get(scan_id, {})
    return {"files": res.get("fileNodes", [])}

@app.get("/api/scans/{scan_id}/dependencies")
def get_dependencies(scan_id: str):
    res = SCAN_RESULTS_CACHE.get(scan_id, {})
    nodes = res.get("fileNodes", [])
    edges = res.get("dependencies", [])
    return {"nodes": nodes, "edges": edges}

@app.get("/api/scans/{scan_id}/apis")
def get_apis(scan_id: str):
    res = SCAN_RESULTS_CACHE.get(scan_id, {})
    return {"endpoints": res.get("apiEndpoints", [])}

@app.get("/api/scans/{scan_id}/database")
def get_database(scan_id: str):
    res = SCAN_RESULTS_CACHE.get(scan_id, {})
    return res.get("databaseInfo", {"entities": [], "repositories": [], "sqlFiles": []})

@app.get("/api/scans/{scan_id}/architecture")
def get_architecture(scan_id: str):
    res = SCAN_RESULTS_CACHE.get(scan_id, {})
    arch = res.get("architecture", {"type": "Layered MVC Enterprise Architecture", "confidence": 92, "evidence": ["Controller Layer", "Service Layer"]})
    return explain_architecture_summary(arch, res.get("metadata", {}))

@app.get("/api/scans/{scan_id}/git-history")
def get_git_history(scan_id: str):
    res = SCAN_RESULTS_CACHE.get(scan_id, {})
    return res.get("gitHistory", {"commitCount": 15, "timeline": [], "hotspots": []})

@app.get("/api/scans/{scan_id}/technical-debt")
def get_technical_debt(scan_id: str):
    res = SCAN_RESULTS_CACHE.get(scan_id, {})
    return {"items": res.get("technicalDebt", [])}

@app.get("/api/scans/{scan_id}/impact-analysis")
def get_impact_analysis(scan_id: str, targetPath: str = "src/main/java/com/archaeologist/api/service/ScanService.java"):
    res = SCAN_RESULTS_CACHE.get(scan_id, {})
    edges = res.get("dependencies", [])
    return calculate_impact_analysis(targetPath, edges)

@app.post("/api/scans/{scan_id}/ai/explain")
def ai_explain(scan_id: str, req: AiExplainRequest):
    res = SCAN_RESULTS_CACHE.get(scan_id, {})
    nodes = res.get("fileNodes", [])
    target = next((n for n in nodes if n["filePath"] == req.filePath), None)
    ast_data = {"symbols": target.get("symbols", [])} if target else {}
    debts = [d for d in res.get("technicalDebt", []) if d["filePath"] == req.filePath]
    return generate_ai_file_explanation(req.filePath, "", ast_data, debts)

@app.post("/api/scans/{scan_id}/ai/query")
def ai_query(scan_id: str, req: AiQueryRequest):
    scan_info = SCANS_DB.get(scan_id, {})
    return answer_repository_query(req.question, scan_info)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
