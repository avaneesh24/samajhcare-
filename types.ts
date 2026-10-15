/**
 * SamajhCare - Core Type Definitions
 * Source-Grounded Healthcare Instruction Understanding Assistant
 */

export type Language = 'en' | 'hi';

export type ComparisonStatus = 
  | 'MATCHES_SOURCE' 
  | 'POSSIBLE_MISMATCH' 
  | 'NEEDS_CLARIFICATION';

export interface EmergencyCheckResult {
  isEmergency: boolean;
  detectedTriggers: string[];
  actionRequired: string;
  emergencyNumber: string;
}

export interface GroundedExplanation {
  plainLanguageSummary: string;
  keyInstructions: {
    item: string;
    sourceSentence: string;
    isExplicit: boolean;
  }[];
  criticalPrecautions: string[];
  flaggedAmbiguities?: string[];
  flaggedContradictions?: string[];
}

export interface TeachBackComparisonResult {
  status: ComparisonStatus;
  statusLabel: string;
  conciseExplanation: string;
  sourceGroundedExcerpt: string;
  isExcerptVerified: boolean;
  excerptMatchConfidence: number; // 0 to 1
  identifiedDifferences: string[];
  questionsForDoctor: string[];
  clinicalDisclaimer: string;
}

export interface SyntheticScenario {
  id: string;
  titleEn: string;
  titleHi: string;
  category: 'faithful' | 'misunderstanding' | 'ambiguous' | 'contradictory' | 'missing' | 'emergency';
  sourceTextEn: string;
  sourceTextHi: string;
  sampleTeachBackEn: string;
  sampleTeachBackHi: string;
  expectedStatus: ComparisonStatus | 'EMERGENCY_TRIGGERED';
  rationale: string;
}

export interface TestExecutionResult {
  testId: string;
  name: string;
  category: string;
  passed: boolean;
  expected: string;
  actual: string;
  details: string;
  durationMs: number;
}
