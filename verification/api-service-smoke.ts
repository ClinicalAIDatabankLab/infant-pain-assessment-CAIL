import assert from 'node:assert/strict';
import { InMemoryAssessmentRepository } from '../apps/api/src/persistence/in-memory-assessment.repository';
import { AssessmentsService } from '../apps/api/src/assessments/assessments.service';
import { ScoringService } from '../apps/api/src/clinical/scoring.service';
import { RecommendationService } from '../apps/api/src/clinical/recommendation.service';

(async () => {
  const repo = new InMemoryAssessmentRepository();
  const service = new AssessmentsService(new ScoringService(), new RecommendationService(), repo);
  const result = service.evaluate({scale:'NIPS',answers:{face:1,cry:1,breathing:1,arms:0,legs:0,arousal:0}});
  assert.equal(result.score, 3);
  assert.equal(result.severity, 'moderate');
  assert.equal(result.recommendation.scale, 'NIPS');
  assert.ok(result.recommendation.nonMedication.length > 0);

  const encounter = await repo.createEncounter({preterm:false,ventilated:false,chronicPain:false,postoperative:false,assessmentType:'acute',motherNationalId:'1234567890'});
  await repo.saveAssessment(encounter.id, {...result, encounterId:encounter.id});
  const summary = await repo.getEncounterSummary(encounter.id);
  assert.equal(summary.assessments.length,1);
  assert.equal(summary.context.motherNationalId,'1234567890');
  console.log('api service smoke checks passed');
})();
