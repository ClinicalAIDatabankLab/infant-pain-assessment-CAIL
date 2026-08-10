import { describe,expect,it } from 'vitest';
import { SCALE_DEFINITIONS } from '../../../packages/clinical-domain/src';
import { RecommendationService, RecommendationCoverageError } from '../src/clinical/recommendation.service';
import { ScoringService } from '../src/clinical/scoring.service';
import { RECOMMENDATION_MATRIX } from '../src/clinical/recommendation.matrix';
const scoring=new ScoringService();const recommendations=new RecommendationService();
describe('recommendation coverage',()=>{
  it('covers every reachable scale × severity result with visible non-medication guidance',()=>{for(const scale of Object.keys(SCALE_DEFINITIONS) as (keyof typeof SCALE_DEFINITIONS)[]){for(let score=0;score<=SCALE_DEFINITIONS[scale].max;score++){const severity=scoring.classifyScore(scale,score).severity;const rec=recommendations.getRecommendation(scale,severity);expect(rec.scale).toBe(scale);expect(rec.severity).toBe(severity);expect(rec.nonMedication.length).toBeGreaterThan(0);expect(rec.medicalActionFa.length).toBeGreaterThan(0);expect(rec.escalationFa.length).toBeGreaterThan(0);expect(rec.reassessment.labelFa.length).toBeGreaterThan(0);expect(rec.sourceRefs.length).toBeGreaterThan(0)}}});
  it('throws instead of falling back when a matrix entry is absent',()=>{const old=RECOMMENDATION_MATRIX.NIPS.mild;delete RECOMMENDATION_MATRIX.NIPS.mild;expect(()=>recommendations.getRecommendation('NIPS','mild')).toThrow(RecommendationCoverageError);RECOMMENDATION_MATRIX.NIPS.mild=old});
});
