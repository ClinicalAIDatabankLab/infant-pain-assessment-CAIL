export type ScaleKey = 'PIPP' | 'NIPS' | 'CRIES' | 'MPAT';
export type SeverityKey = 'none' | 'observe' | 'mild' | 'moderate' | 'severe';

export interface RecommendationSource {
  id: string;
  label: string;
  section?: string;
  reviewStatus: 'source-transcribed' | 'clinician-reviewed' | 'requires-clinical-review';
}

export interface NonMedicationAction {
  id: string;
  labelFa: string;
  rationaleFa?: string;
  applicability?: string[];
  contraindicationNoteFa?: string;
}

export interface MedicationGuidance {
  summaryFa: string;
  physicianOrderRequired: true;
}

export interface ReassessmentGuidance {
  labelFa: string;
  minMinutes?: number;
  maxMinutes?: number;
}

export interface RecommendationPackage {
  scale: ScaleKey;
  severity: SeverityKey;
  titleFa: string;
  nonMedication: NonMedicationAction[];
  medication?: MedicationGuidance;
  medicalActionFa: string;
  escalationFa: string;
  reassessment: ReassessmentGuidance;
  sourceRefs: RecommendationSource[];
}

export interface ClinicalWarning {
  code: string;
  messageFa: string;
  blocking: boolean;
}

export interface InfantContext {
  recordId?: string;
  motherNationalId?: string;
  gestationalWeeks?: number;
  ageDays?: number;
  weightGrams?: number;
  sex?: 'male' | 'female';
  preterm: boolean;
  ventilated: boolean;
  chronicPain: boolean;
  postoperative: boolean;
  assessmentType: 'acute' | 'other';
}

export interface AssessmentResult {
  id: string;
  encounterId?: string;
  scale: ScaleKey;
  score: number;
  severity: SeverityKey;
  severityLabelFa: string;
  completedCriteria: number;
  totalCriteria: number;
  measurements: Record<string, unknown>;
  recommendation: RecommendationPackage;
  warnings: ClinicalWarning[];
  createdAt: string;
}

export interface RecordedIntervention {
  id: string;
  actionId: string;
  labelFa: string;
  kind: 'non-medication' | 'physician-ordered-medication';
  performedAt: string;
}

export interface Encounter {
  id: string;
  context: InfantContext;
  createdAt: string;
  assessments: AssessmentResult[];
  interventions: RecordedIntervention[];
}

export interface EncounterSummary extends Encounter {
  initialAssessment?: AssessmentResult;
  latestReassessment?: AssessmentResult;
}
