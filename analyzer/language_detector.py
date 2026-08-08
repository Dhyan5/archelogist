import os
from typing import Dict, Any, List

EXTENSION_MAP = {
    '.java': 'Java',
    '.py': 'Python',
    '.js': 'JavaScript',
    '.jsx': 'JavaScript',
    '.ts': 'TypeScript',
    '.tsx': 'TypeScript',
    '.html': 'HTML',
    '.css': 'CSS',
    '.scss': 'CSS',
    '.sql': 'SQL',
    '.php': 'PHP',
    '.cs': 'C#',
    '.kt': 'Kotlin',
    '.kts': 'Kotlin',
    '.swift': 'Swift',
    '.c': 'C/C++',
    '.cpp': 'C/C++',
    '.h': 'C/C++',
    '.hpp': 'C/C++',
    '.json': 'JSON',
    '.xml': 'XML',
    '.yml': 'YAML',
    '.yaml': 'YAML',
    '.md': 'Markdown',
    '.sh': 'Shell',
}

FRAMEWORK_DETECTORS = {
    'pom.xml': 'Spring Boot / Maven',
    'build.gradle': 'Gradle / Java',
    'package.json': 'Node.js / React / Express',
    'requirements.txt': 'Python / Django / Flask / FastAPI',
    'Pipfile': 'Python Pipenv',
    'composer.json': 'PHP Laravel / Symfony',
    'Dockerfile': 'Docker Containerized',
    'docker-compose.yml': 'Docker Compose Orchestrated',
    'application.properties': 'Spring Boot Configuration',
    'application.yml': 'Spring Boot Configuration'
}

def detect_languages_and_metadata(workspace_path: str) -> Dict[str, Any]:
    file_count = 0
    dir_count = 0
    total_loc = 0
    lang_loc: Dict[str, int] = {}
    detected_frameworks: List[str] = []
    config_files: List[str] = []

    for root, dirs, files in os.walk(workspace_path):
        if '.git' in root or 'node_modules' in root or 'venv' in root or 'target' in root:
            continue
            
        dir_count += len(dirs)

        for filename in files:
            file_count += 1
            full_path = os.path.join(root, filename)
            _, ext = os.path.splitext(filename)
            ext = ext.lower()

            if filename in FRAMEWORK_DETECTORS:
                config_files.append(filename)
                framework = FRAMEWORK_DETECTORS[filename]
                if framework not in detected_frameworks:
                    detected_frameworks.append(framework)

            lang = EXTENSION_MAP.get(ext, 'Other')
            
            loc = 0
            try:
                with open(full_path, 'r', encoding='utf-8', errors='ignore') as f:
                    lines = f.readlines()
                    loc = len(lines)
            except Exception:
                loc = 0

            total_loc += loc
            lang_loc[lang] = lang_loc.get(lang, 0) + loc

    # Calculate exact percentages
    languages_pct: Dict[str, float] = {}
    if total_loc > 0:
        for lang, loc in lang_loc.items():
            pct = round((loc / total_loc) * 100, 1)
            if pct > 0:
                languages_pct[lang] = pct

    # Sort languages descending
    sorted_languages = dict(sorted(languages_pct.items(), key=lambda item: item[1], reverse=True))

    return {
        "fileCount": file_count,
        "dirCount": dir_count,
        "totalLoc": total_loc,
        "languageBreakdown": sorted_languages,
        "frameworks": detected_frameworks,
        "configFiles": list(set(config_files))
    }
