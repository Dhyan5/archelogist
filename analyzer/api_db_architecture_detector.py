import re
import os
from typing import Dict, Any, List

def detect_api_endpoints(workspace_path: str) -> List[Dict[str, Any]]:
    endpoints = []

    # Spring mapping regexes
    spring_regexes = [
        (re.compile(r'@GetMapping\((?:value\s*=\s*)?["\']([^"\']+)["\']\)'), 'GET'),
        (re.compile(r'@PostMapping\((?:value\s*=\s*)?["\']([^"\']+)["\']\)'), 'POST'),
        (re.compile(r'@PutMapping\((?:value\s*=\s*)?["\']([^"\']+)["\']\)'), 'PUT'),
        (re.compile(r'@DeleteMapping\((?:value\s*=\s*)?["\']([^"\']+)["\']\)'), 'DELETE'),
        (re.compile(r'@RequestMapping\((?:value\s*=\s*)?["\']([^"\']+)["\']\)'), 'ALL')
    ]

    for root, dirs, files in os.walk(workspace_path):
        if '.git' in root or 'node_modules' in root:
            continue
        for f in files:
            if f.endswith('.java') or f.endswith('.ts') or f.endswith('.py'):
                rel_path = os.path.relpath(os.path.join(root, f), workspace_path).replace('\\', '/')
                try:
                    with open(os.path.join(root, f), 'r', encoding='utf-8', errors='ignore') as fh:
                        content = fh.read()
                        
                    for regex, method in spring_regexes:
                        matches = regex.findall(content)
                        for route in matches:
                            endpoints.append({
                                "filePath": rel_path,
                                "httpMethod": method if method != 'ALL' else 'GET',
                                "endpointPath": route,
                                "controllerName": f.replace('.java', '').replace('.ts', ''),
                                "handlerMethod": "handler"
                            })
                except Exception:
                    pass

    return endpoints

def detect_database_components(workspace_path: str) -> Dict[str, Any]:
    entities = []
    repositories = []
    sql_files = []

    for root, dirs, files in os.walk(workspace_path):
        if '.git' in root: continue
        for f in files:
            rel_path = os.path.relpath(os.path.join(root, f), workspace_path).replace('\\', '/')
            if f.endswith('.sql'):
                sql_files.append(rel_path)
            elif f.endswith('.java'):
                try:
                    with open(os.path.join(root, f), 'r', encoding='utf-8', errors='ignore') as fh:
                        content = fh.read()
                        if '@Entity' in content or '@Table' in content:
                            entities.append({"name": f.replace('.java', ''), "filePath": rel_path})
                        if 'JpaRepository' in content or 'CrudRepository' in content or '@Repository' in content:
                            repositories.append({"name": f.replace('.java', ''), "filePath": rel_path})
                except Exception:
                    pass

    return {
        "entities": entities,
        "repositories": repositories,
        "sqlFiles": sql_files
    }

def infer_architecture(file_ast_map: Dict[str, Dict[str, Any]], endpoints: List[Any], db_info: Dict[str, Any]) -> Dict[str, Any]:
    evidence = []
    has_controllers = len(endpoints) > 0
    has_services = False
    has_repos = len(db_info.get("repositories", [])) > 0
    has_entities = len(db_info.get("entities", [])) > 0

    for path, data in file_ast_map.items():
        comp = data.get("componentType", "")
        if comp == "SERVICE":
            has_services = True

    if has_controllers:
        evidence.append("REST Controller Layer detected")
    if has_services:
        evidence.append("Service Business Logic Layer detected")
    if has_repos:
        evidence.append("Persistence Repository Layer detected")
    if has_entities:
        evidence.append("ORM Domain Entity Layer detected")

    if has_controllers and has_services and (has_repos or has_entities):
        return {
            "type": "Layered MVC Enterprise Architecture",
            "confidence": 92,
            "evidence": evidence
        }
    elif has_controllers:
        return {
            "type": "Client-Server REST Service",
            "confidence": 85,
            "evidence": evidence
        }
    else:
        return {
            "type": "Monolithic Application",
            "confidence": 75,
            "evidence": ["Unified single repository package structure"]
        }
