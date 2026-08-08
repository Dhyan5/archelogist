export type UserRole = 'ROLE_ADMIN' | 'ROLE_ANALYST' | 'ROLE_USER';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: string;
  username: string;
  email: string;
  role: UserRole;
}

export type ScanStatus = 
  | 'QUEUED'
  | 'CLONING'
  | 'EXTRACTING'
  | 'SCANNING'
  | 'ANALYZING'
  | 'FINALIZING'
  | 'COMPLETED'
  | 'FAILED';

export interface Scan {
  id: string;
  repositoryId: string;
  repositoryName: string;
  status: ScanStatus;
  progressPercentage: number;
  currentStep: string;
  totalFiles: number;
  totalLoc: number;
  healthScore: number;
  overallRiskScore: number;
  architectureType: string;
  architectureConfidence: number;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface FileNode {
  id: string;
  scanId: string;
  filePath: string;
  fileName: string;
  language: string;
  loc: number;
  cyclomaticComplexity: number;
  riskScore: number;
  churnCount: number;
  componentType: 'CONTROLLER' | 'SERVICE' | 'REPOSITORY' | 'MODEL' | 'UTIL' | 'CONFIG' | 'UNKNOWN';
}

export interface CodeSymbol {
  id: string;
  fileId: string;
  name: string;
  symbolType: 'CLASS' | 'INTERFACE' | 'METHOD' | 'FUNCTION' | 'ANNOTATION' | 'CONSTANT';
  lineStart: number;
  lineEnd: number;
  signature?: string;
}

export interface DependencyEdge {
  id: string;
  scanId: string;
  sourcePath: string;
  targetPath: string;
  relationType: 'IMPORTS' | 'CALLS' | 'EXTENDS' | 'IMPLEMENTS' | 'DB_QUERY' | 'API_CALL';
}

export interface ApiEndpoint {
  id: string;
  scanId: string;
  filePath: string;
  httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpointPath: string;
  controllerName: string;
  handlerMethod: string;
}

export interface TechnicalDebtItem {
  id: string;
  scanId: string;
  filePath: string;
  lineNumber: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'LONG_METHOD' | 'GOD_CLASS' | 'HIGH_COMPLEXITY' | 'CIRCULAR_DEP' | 'TODO_COMMENT' | 'HARDCODED_CONFIG';
  description: string;
  recommendation: string;
}

export interface ImpactResult {
  targetPath: string;
  impactScore: number;
  impactLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  directDependents: string[];
  indirectDependents: string[];
  affectedEndpoints: string[];
}
