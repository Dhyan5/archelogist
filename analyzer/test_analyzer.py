import unittest
import os
import shutil
import tempfile
from language_detector import detect_languages_and_metadata
from ast_parser import parse_java_file, parse_python_file, parse_ts_js_file
from risk_debt_impact_engine import calculate_cyclomatic_complexity, detect_technical_debt, calculate_file_risk, calculate_impact_analysis

class TestSoftwareArchaeologistAnalyzer(unittest.TestCase):

    def test_language_detection(self):
        tmp = tempfile.mkdtemp()
        try:
            with open(os.path.join(tmp, "Test.java"), "w") as f:
                f.write("public class Test {}")
            with open(os.path.join(tmp, "app.ts"), "w") as f:
                f.write("console.log('hello');")
            with open(os.path.join(tmp, "pom.xml"), "w") as f:
                f.write("<project></project>")

            res = detect_languages_and_metadata(tmp)
            self.assertEqual(res["fileCount"], 3)
            self.assertIn("Spring Boot / Maven", res["frameworks"])
        finally:
            shutil.rmtree(tmp, ignore_errors=True)

    def test_java_ast_parsing(self):
        code = """
        package com.example;
        import java.util.List;
        
        @RestController
        public class UserController {
            @GetMapping("/api/users")
            public List<String> getUsers() {
                return List.of("alice", "bob");
            }
        }
        """
        res = parse_java_file(code)
        self.assertEqual(res["componentType"], "CONTROLLER")
        self.assertIn("RestController", res["annotations"])
        self.assertTrue(len(res["symbols"]) > 0)

    def test_cyclomatic_complexity_and_debt(self):
        complex_code = "if (a) { if (b) { if (c) { while (d) { for (e) { } } } } } // TODO: refactor this"
        comp = calculate_cyclomatic_complexity(complex_code)
        self.assertGreater(comp, 4)
        
        debt = detect_technical_debt("Service.java", complex_code, comp)
        self.assertTrue(any(d["category"] == "TODO_COMMENT" for d in debt))

    def test_impact_analysis_propagation(self):
        edges = [
            {"id": "e1", "sourcePath": "UserController.java", "targetPath": "UserService.java", "relationType": "IMPORTS"},
            {"id": "e2", "sourcePath": "LoginController.java", "targetPath": "UserService.java", "relationType": "IMPORTS"},
            {"id": "e3", "sourcePath": "SecurityConfig.java", "targetPath": "UserController.java", "relationType": "IMPORTS"}
        ]
        res = calculate_impact_analysis("UserService.java", edges)
        self.assertEqual(len(res["directDependents"]), 2)
        self.assertIn("UserController.java", res["directDependents"])
        self.assertIn("SecurityConfig.java", res["indirectDependents"])
        self.assertGreaterEqual(res["impactScore"], 50)

if __name__ == "__main__":
    unittest.main()
