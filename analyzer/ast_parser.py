import os
import re
import ast
from typing import Dict, Any, List

class CodeSymbol:
    def __init__(self, name: str, symbol_type: str, line_start: int, line_end: int = 0, signature: str = ""):
        self.name = name
        self.symbol_type = symbol_type
        self.line_start = line_start
        self.line_end = line_end
        self.signature = signature

    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "symbolType": self.symbol_type,
            "lineStart": self.line_start,
            "lineEnd": self.line_end,
            "signature": self.signature
        }

def parse_python_file(content: str) -> Dict[str, Any]:
    symbols = []
    imports = []

    try:
        tree = ast.parse(content)
        for node in ast.walk(tree):
            if isinstance(node, ast.ClassDef):
                symbols.append(CodeSymbol(node.name, "CLASS", node.lineno, getattr(node, 'end_lineno', node.lineno), f"class {node.name}"))
            elif isinstance(node, ast.FunctionDef) or isinstance(node, ast.AsyncFunctionDef):
                symbols.append(CodeSymbol(node.name, "FUNCTION", node.lineno, getattr(node, 'end_lineno', node.lineno), f"def {node.name}()"))
            elif isinstance(node, ast.Import):
                for alias in node.names:
                    imports.append(alias.name)
            elif isinstance(node, ast.ImportFrom):
                if node.module:
                    imports.append(node.module)
    except Exception:
        pass

    return {
        "symbols": [s.to_dict() for s in symbols],
        "imports": imports
    }

def parse_java_file(content: str) -> Dict[str, Any]:
    symbols = []
    imports = []
    annotations = []
    component_type = "UNKNOWN"

    lines = content.splitlines()

    class_pattern = re.compile(r'public\s+(class|interface|enum)\s+([A-Za-z0-9_]+)')
    method_pattern = re.compile(r'public\s+([A-Za-z0-9_<>\[\]\s]+\s+([A-Za-z0-9_]+)\s*\([^)]*\))')
    import_pattern = re.compile(r'import\s+([a-zA-Z0-9_.]+);')
    annotation_pattern = re.compile(r'@([A-Za-z0-9_]+)')

    for idx, line in enumerate(lines, 1):
        line_str = line.strip()

        # Imports
        imp_match = import_pattern.search(line_str)
        if imp_match:
            imports.append(imp_match.group(1))

        # Annotations & Component Type Detection
        ann_matches = annotation_pattern.findall(line_str)
        for ann in ann_matches:
            annotations.append(ann)
            if ann in ['RestController', 'Controller']:
                component_type = 'CONTROLLER'
            elif ann == 'Service':
                component_type = 'SERVICE'
            elif ann == 'Repository':
                component_type = 'REPOSITORY'
            elif ann == 'Entity':
                component_type = 'MODEL'

        # Class / Interface
        cls_match = class_pattern.search(line_str)
        if cls_match:
            kind = cls_match.group(1).upper()
            cname = cls_match.group(2)
            symbols.append(CodeSymbol(cname, kind, idx, idx, f"{cls_match.group(1)} {cname}"))

        # Methods
        m_match = method_pattern.search(line_str)
        if m_match and not ('class' in line_str or 'interface' in line_str):
            mname = m_match.group(2)
            symbols.append(CodeSymbol(mname, "METHOD", idx, idx, m_match.group(1)))

    return {
        "symbols": [s.to_dict() for s in symbols],
        "imports": imports,
        "annotations": list(set(annotations)),
        "componentType": component_type
    }

def parse_ts_js_file(content: str) -> Dict[str, Any]:
    symbols = []
    imports = []
    component_type = "UNKNOWN"

    lines = content.splitlines()

    import_pattern = re.compile(r'import\s+.*?from\s+[\'"]([^\'"]+)[\'"]')
    class_pattern = re.compile(r'export\s+(?:default\s+)?class\s+([A-Za-z0-9_]+)')
    func_pattern = re.compile(r'(?:export\s+)?(?:const|function)\s+([A-Za-z0-9_]+)\s*=\s*(?:\([^)]*\)|function|\([^)]*\)\s*=>)')

    for idx, line in enumerate(lines, 1):
        line_str = line.strip()

        imp_match = import_pattern.search(line_str)
        if imp_match:
            imports.append(imp_match.group(1))

        cls_match = class_pattern.search(line_str)
        if cls_match:
            symbols.append(CodeSymbol(cls_match.group(1), "CLASS", idx, idx, f"class {cls_match.group(1)}"))

        fn_match = func_pattern.search(line_str)
        if fn_match:
            symbols.append(CodeSymbol(fn_match.group(1), "FUNCTION", idx, idx, f"function {fn_match.group(1)}"))

    return {
        "symbols": [s.to_dict() for s in symbols],
        "imports": imports,
        "componentType": component_type
    }

def analyze_file_ast(file_path: str) -> Dict[str, Any]:
    _, ext = os.path.splitext(file_path)
    ext = ext.lower()

    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()

        if ext == '.py':
            return parse_python_file(content)
        elif ext in ['.java', '.kt']:
            return parse_java_file(content)
        elif ext in ['.js', '.jsx', '.ts', '.tsx']:
            return parse_ts_js_file(content)
        else:
            return {"symbols": [], "imports": [], "componentType": "UNKNOWN"}
    except Exception:
        return {"symbols": [], "imports": [], "componentType": "UNKNOWN"}
