import assert from 'node:assert/strict';
import { NON_MEDICATION_ACTION_CATALOG } from '../packages/clinical-domain/src/recommendations';
import { SCALE_DEFINITIONS, VALID_SEVERITIES } from '../packages/clinical-domain/src/scales';
import { ScoringService } from '../apps/api/src/clinical/scoring.service';
import { RECOMMENDATION_MATRIX } from '../apps/api/src/clinical/recommendation.matrix';
import { RecommendationService } from '../apps/api/src/clinical/recommendation.service';

assert.deepEqual(Object.keys(SCALE_DEFINITIONS), ['PIPP','NIPS','CRIES','MPAT']);
const scoring = new ScoringService();
assert.equal(scoring.classifyScore('PIPP', 6).severity, 'none');
assert.equal(scoring.classifyScore('PIPP', 7).severity, 'moderate');
assert.equal(scoring.classifyScore('PIPP', 13).severity, 'severe');
assert.equal(scoring.classifyScore('NIPS', 2).severity, 'mild');
assert.equal(scoring.classifyScore('NIPS', 3).severity, 'moderate');
assert.equal(scoring.classifyScore('NIPS', 6).severity, 'severe');
assert.equal(scoring.classifyScore('CRIES', 3).severity, 'mild');
assert.equal(scoring.classifyScore('CRIES', 4).severity, 'moderate');
assert.equal(scoring.classifyScore('CRIES', 7).severity, 'severe');
assert.equal(scoring.classifyScore('MPAT', 3).severity, 'observe');
assert.equal(scoring.classifyScore('MPAT', 4).severity, 'mild');
assert.equal(scoring.classifyScore('MPAT', 7).severity, 'moderate');
assert.equal(scoring.classifyScore('MPAT', 13).severity, 'severe');

assert.equal(scoring.pippPercentScore(9), 0);
assert.equal(scoring.pippPercentScore(10), 1);
assert.equal(scoring.pippPercentScore(39), 1);
assert.equal(scoring.pippPercentScore(40), 2);
assert.equal(scoring.pippPercentScore(69), 2);
assert.equal(scoring.pippPercentScore(70), 3);
assert.equal(scoring.pippPercentScore(-1), null);
assert.equal(scoring.pippPercentScore(101), null);
const invalidPipp = scoring.scorePipp({gaScore:99,behavior:0,baselineHr:140,maxHr:140,baselineSpo2:98,minSpo2:98,browPercent:0,eyePercent:0,nasolabialPercent:0});
assert.equal(invalidPipp.completedCriteria, 6);
assert.equal(scoring.pippHeartRateScore(140, 144), 0);
assert.equal(scoring.pippHeartRateScore(140, 145), 1);
assert.equal(scoring.pippHeartRateScore(140, 165), 3);
assert.equal(scoring.pippSpo2Score(98, 95.6), 0);
assert.equal(scoring.pippSpo2Score(98, 95.5), 1);
assert.equal(scoring.pippSpo2Score(98, 90.5), 3);

const recommendations = new RecommendationService();
for (const [scale, definition] of Object.entries(SCALE_DEFINITIONS)) {
  for (let score = 0; score <= definition.max; score++) {
    const { severity } = scoring.classifyScore(scale as keyof typeof SCALE_DEFINITIONS, score);
    assert.ok(VALID_SEVERITIES[scale as keyof typeof SCALE_DEFINITIONS].includes(severity));
    const rec = recommendations.getRecommendation(scale as keyof typeof SCALE_DEFINITIONS, severity);
    assert.equal(rec.scale, scale);
    assert.equal(rec.severity, severity);
    assert.ok(rec.nonMedication.length > 0, `${scale}/${severity} lacks nonMedication`);
    assert.ok(rec.medicalActionFa.length > 0);
    assert.ok(rec.escalationFa.length > 0);
    assert.ok(rec.reassessment.labelFa.length > 0);
    assert.ok(rec.sourceRefs.length > 0, `${scale}/${severity} lacks sourceRefs`);
  }
}

const catalogIds = NON_MEDICATION_ACTION_CATALOG.map(action => action.id);
assert.equal(new Set(catalogIds).size, catalogIds.length, 'non-medication catalog IDs must be unique');
for (const recommendation of Object.values(RECOMMENDATION_MATRIX).flatMap(bySeverity => Object.values(bySeverity))) {
  for (const action of recommendation?.nonMedication ?? []) {
    assert.ok(catalogIds.includes(action.id), `catalog is missing ${action.id}`);
  }
}

console.log('domain smoke checks passed');
