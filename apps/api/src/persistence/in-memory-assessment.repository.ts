import { randomUUID } from 'node:crypto';
import type { AssessmentResult, Encounter, EncounterSummary, InfantContext, RecordedIntervention } from '@neonatal/clinical-domain';
import type { AssessmentRepository } from './assessment.repository';

export class InMemoryAssessmentRepository implements AssessmentRepository {
  private readonly encounters = new Map<string, Encounter>();

  async createEncounter(context: InfantContext): Promise<Encounter> {
    const encounter: Encounter = {id:randomUUID(),context:structuredClone(context),createdAt:new Date().toISOString(),assessments:[],interventions:[]};
    this.encounters.set(encounter.id, encounter);
    return structuredClone(encounter);
  }

  async getEncounter(id: string): Promise<Encounter | null> {
    const encounter = this.encounters.get(id);
    return encounter ? structuredClone(encounter) : null;
  }

  async saveAssessment(encounterId: string, result: AssessmentResult): Promise<void> {
    const encounter = this.encounters.get(encounterId);
    if (!encounter) throw new Error('ENCOUNTER_NOT_FOUND');
    encounter.assessments.push(structuredClone(result));
  }

  async saveInterventions(encounterId: string, interventions: RecordedIntervention[]): Promise<void> {
    const encounter = this.encounters.get(encounterId);
    if (!encounter) throw new Error('ENCOUNTER_NOT_FOUND');
    encounter.interventions.push(...structuredClone(interventions));
  }

  async getEncounterSummary(encounterId: string): Promise<EncounterSummary> {
    const encounter = this.encounters.get(encounterId);
    if (!encounter) throw new Error('ENCOUNTER_NOT_FOUND');
    const assessments = structuredClone(encounter.assessments);
    return {
      ...structuredClone(encounter),
      initialAssessment: assessments[0],
      latestReassessment: assessments.length > 1 ? assessments[assessments.length - 1] : undefined,
    };
  }
}
