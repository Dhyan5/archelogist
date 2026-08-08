import os
import re
from typing import Dict, Any, List, Set

def calculate_cyclomatic_complexity(content: str) -> int:
    # Estimate decision points: if, elif, else, for, while, case, catch, &&, ||, ?, try
    decision_keywords = [
        r'\bif\b', r'\belif\b', r'\belse\b', r'\bfor\b', r'\bwhile\b', 
        r'\bcase\b', r'\bcatch\b', r'\&\&', r'\|\|', r'\?'
    ]
    score = 1
    for kw in decision_keywords:
        score += len(re.findall(kw, content))
    return min(score, 100)

def detect_technical_debt(file_path: str, content: str, complexity: int) -> List[Dict[str, Any]]:
    debt_items = []
    lines = content.splitlines()

    # 1. TODO / FIXME Comments
    for idx, l in enumerate(lines, 1):
        if 'TODO' in l or 'FIXME' in l:
            debt_items.append({
                "filePath": file_path,
                "lineNumber": idx,
                "severity": "LOW" if 'TODO' in l else "MEDIUM",
                "category": "TODO_COMMENT",
                "description": f"Unresolved comment at line {idx}: {l.strip()}",
                "recommendation": "Address or remove temporary comment annotation."
            })

    # 2. God Class / Large File (> 300 lines)
    if len(lines) > 300:
        debt_items.append({
            "filePath": file_path,
            "lineNumber": 1,
            "severity": "HIGH",
            "category": "GOD_CLASS",
            "description": f"File is excessively long ({len(lines)} LOC), violating Single Responsibility Principle.",
            "recommendation": "Refactor component into smaller, focused modules."
        })

    # 3. High Cyclomatic Complexity (> 15)
    if complexity > 15:
        debt_items.append({
            "filePath": file_path,
            "lineNumber": 1,
            "severity": "CRITICAL" if complexity > 30 else "HIGH",
            "category": "HIGH_COMPLEXITY",
            "description": f"Cyclomatic complexity of {complexity} exceeds threshold (15).",
            "recommendation": "Simplify conditional branches and decompose complex logic."
        })

    # 4. Security Sensitive Hardcoded Keywords
    if any(k in content.lower() for k in ['password =', 'secret =', 'api_key =', 'jwt_secret =']):
        debt_items.append({
            "filePath": file_path,
            "lineNumber": 1,
            "severity": "CRITICAL",
            "category": "HARDCODED_CONFIG",
            "description": "Potential hardcoded credential or secret detected.",
            "recommendation": "Move sensitive keys to environment variables or key vault."
        })

    return debt_items

def calculate_file_risk(loc: int, complexity: int, churn: int, debt_count: int, is_security_sensitive: bool) -> int:
    # Formula: Risk = (Complexity * 2.5) + (Churn * 3.0) + (Debt * 10) + (Security ? 25 : 0)
    raw = (complexity * 2.5) + (churn * 3.0) + (debt_count * 10.0) + (25.0 if is_security_sensitive else 0.0)
    if loc > 250:
        raw += 15.0
    return min(int(raw), 100)

def calculate_impact_analysis(target_path: str, edges: List[Dict[str, Any]]) -> Dict[str, Any]:
    # Build incoming graph (who depends on target_path)
    dependents_map: Dict[str, List[str]] = {}
    for edge in edges:
        source = edge["sourcePath"] # source depends on target
        target = edge["targetPath"]
        if target not in dependents_map:
            dependents_map[target] = []
        dependents_map[target].append(source)

    direct = dependents_map.get(target_path, [])
    indirect_set: Set[str] = set()

    for d in direct:
        second_level = dependents_map.get(d, [])
        for s in second_level:
            if s != target_path and s not in direct:
                indirect_set.add(s)

    indirect = list(indirect_set)
    total_affected = len(direct) + len(indirect)

    impact_score = min(int((len(direct) * 25.0) + (len(indirect) * 12.0) + 15.0), 100)
    impact_level = "CRITICAL" if impact_score >= 75 else ("HIGH" if impact_score >= 50 else ("MEDIUM" if impact_score >= 25 else "LOW"))

    return {
        "targetPath": target_path,
        "impactScore": impact_score,
        "impactLevel": impact_level,
        "directDependents": direct,
        "indirectDependents": indirect,
        "affectedEndpoints": [f"GET /api/{os.path.basename(target_path).replace('.java','').replace('.ts','').lower()}"]
    }
