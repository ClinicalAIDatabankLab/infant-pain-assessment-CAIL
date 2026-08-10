import { randomUUID } from 'node:crypto';
import type { AssessmentResult, InfantContext, ScaleKey } from '@neonatal/clinical-domain';
import type { AssessmentRepository } from '../persistence/assessment.repository';
import { RecommendationService } from '../clinical/recommendation.service';
import { ScoringService } from '../clinical/scoring.service';

export interface EvaluateAssessmentInput {
  scale: ScaleKey;
  answers: Record<string, number>;
  infantContext?: InfantContext;
  encounterId?: string;
}

export class IncompleteAssessmentError extends Error {
  constructor(public readonly completed:number, public readonly total:number) {
    super(`Assessment incomplete: ${completed}/${total}`);
    this.name='IncompleteAssessmentError';
  }
}

export class AssessmentsService {
  constructor(
    private readonly scoring: ScoringService,
    private readonly recommendations: RecommendationService,
    private readonly repository?: AssessmentRepository,
  ) {}

  evaluate(input: EvaluateAssessmentInput): AssessmentResult {
    const scoringResult = input.scale === 'PIPP'
      ? this.scoring.scorePipp(input.answers)
      : this.scoring.scoreGeneric(input.scale, input.answers);
    if (scoringResult.completedCriteria !== scoringResult.totalCriteria) {
      throw new IncompleteAssessmentError(scoringResult.completedCriteria,scoringResult.totalCriteria);
    }
    const classification = this.scoring.classifyScore(input.scale, scoringResult.score);
    const warnings = input.scale === 'PIPP'
      ? this.scoring.pippGestationalMismatch(input.infantContext?.gestationalWeeks, Number.isFinite(input.answers.gaScore) ? input.answers.gaScore : null)
      : [];
    return {
      id:randomUUID(),
      encounterId:input.encounterId,
      scale:input.scale,
      score:scoringResult.score,
      severity:classification.severity,
      severityLabelFa:classification.severityLabelFa,
      completedCriteria:scoringResult.completedCriteria,
      totalCriteria:scoringResult.totalCriteria,
      measurements:input.scale === 'PIPP' && 'measurements' in scoringResult ? scoringResult.measurements as Record<string,unknown> : structuredClone(input.answers),
      recommendation:this.recommendations.getRecommendation(input.scale,classification.severity),
      warnings,
      createdAt:new Date().toISOString(),
    };
  }

  async evaluateAndSave(encounterId:string,input:Omit<EvaluateAssessmentInput,'encounterId'|'infantContext'>): Promise<AssessmentResult> {
    if (!this.repository) throw new Error('REPOSITORY_NOT_CONFIGURED');
    const encounter = await this.repository.getEncounter(encounterId);
    if (!encounter) throw new Error('ENCOUNTER_NOT_FOUND');
    const result = this.evaluate({...input,encounterId,infantContext:encounter.context});
    await this.repository.saveAssessment(encounterId,result);
    return result;
  }
}
