import os
from typing import Dict, Any, List

def build_dependency_graph(workspace_path: str, file_ast_map: Dict[str, Dict[str, Any]]) -> List[Dict[str, Any]]:
    edges = []

    # Map file basenames to full relative paths
    basename_map: Dict[str, str] = {}
    for rel_path in file_ast_map.keys():
        bname = os.path.basename(rel_path)
        name_no_ext, _ = os.path.splitext(bname)
        basename_map[bname] = rel_path
        basename_map[name_no_ext] = rel_path

    for source_path, ast_data in file_ast_map.items():
        imports = ast_data.get("imports", [])
        for imp in imports:
            # Resolve import to target file if possible
            target_key = imp.split('.')[-1]
            if target_key in basename_map:
                target_path = basename_map[target_key]
                if target_path != source_path:
                    edges.append({
                        "id": f"edge-{hash(source_path + target_path)}",
                        "sourcePath": source_path,
                        "targetPath": target_path,
                        "relationType": "IMPORTS"
                    })

    return edges
