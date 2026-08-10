import type { AssessmentResult, Encounter, EncounterSummary, InfantContext, RecordedIntervention } from '@neonatal/clinical-domain';

export const ASSESSMENT_REPOSITORY = Symbol('ASSESSMENT_REPOSITORY');

export interface AssessmentRepository {
  createEncounter(context: InfantContext): Promise<Encounter>;
  getEncounter(id: string): Promise<Encounter | null>;
  saveAssessment(encounterId: string, result: AssessmentResult): Promise<void>;
  saveInterventions(encounterId: string, interventions: RecordedIntervention[]): Promise<void>;
  getEncounterSummary(encounterId: string): Promise<EncounterSummary>;
}
