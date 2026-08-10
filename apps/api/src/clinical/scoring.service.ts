import type { ClinicalWarning, InfantContext, ScaleKey, SeverityKey } from '@neonatal/clinical-domain';
import { SCALE_DEFINITIONS } from '@neonatal/clinical-domain';

export interface Classification { severity: SeverityKey; severityLabelFa: string; }

export class ScoringService {
  classifyScore(scale: ScaleKey, score: number): Classification {
    const max = SCALE_DEFINITIONS[scale].max;
    if (!Number.isFinite(score) || score < 0 || score > max) throw new RangeError(`Invalid ${scale} score: ${score}`);
    if (scale === 'PIPP') {
      if (score <= 6) return {severity:'none',severityLabelFa:'بدون درد'};
      if (score <= 12) return {severity:'moderate',severityLabelFa:'درد خفیف تا متوسط'};
      return {severity:'severe',severityLabelFa:'درد شدید'};
    }
    if (scale === 'NIPS') {
      if (score === 0) return {severity:'none',severityLabelFa:'بدون درد'};
      if (score <= 2) return {severity:'mild',severityLabelFa:'درد خفیف'};
      if (score <= 5) return {severity:'moderate',severityLabelFa:'درد متوسط'};
      return {severity:'severe',severityLabelFa:'درد شدید'};
    }
    if (scale === 'CRIES') {
      if (score === 0) return {severity:'none',severityLabelFa:'بدون درد'};
      if (score <= 3) return {severity:'mild',severityLabelFa:'درد خفیف / زیر آستانه متوسط'};
      if (score <= 6) return {severity:'moderate',severityLabelFa:'درد متوسط'};
      return {severity:'severe',severityLabelFa:'درد شدید'};
    }
    if (score === 0) return {severity:'none',severityLabelFa:'بدون درد'};
    if (score <= 3) return {severity:'observe',severityLabelFa:'زیر آستانه درد خفیف'};
    if (score <= 6) return {severity:'mild',severityLabelFa:'درد خفیف'};
    if (score <= 12) return {severity:'moderate',severityLabelFa:'درد متوسط'};
    return {severity:'severe',severityLabelFa:'درد شدید'};
  }

  recommendScale(context: InfantContext): ScaleKey {
    if (context.postoperative) return 'CRIES';
    if (context.ventilated || context.chronicPain) return 'MPAT';
    if (context.preterm && context.assessmentType === 'acute') return 'PIPP';
    if (context.assessmentType === 'acute') return 'NIPS';
    return 'MPAT';
  }

  pippGestationalAgeScore(weeks: number): number | null {
    if (!Number.isFinite(weeks) || weeks < 20 || weeks > 45) return null;
    if (weeks >= 36) return 0;
    if (weeks >= 32) return 1;
    if (weeks >= 28) return 2;
    return 3;
  }

  pippPercentScore(percent: number): number | null {
    if (!Number.isFinite(percent) || percent < 0 || percent > 100) return null;
    if (percent <= 9) return 0;
    if (percent <= 39) return 1;
    if (percent <= 69) return 2;
    return 3;
  }

  pippHeartRateScore(baseline: number, maximum: number): number {
    const delta = Math.max(0, Number(maximum) - Number(baseline));
    if (delta <= 4) return 0;
    if (delta <= 14) return 1;
    if (delta <= 24) return 2;
    return 3;
  }

  pippSpo2Score(baseline: number, minimum: number): number {
    const drop = Math.round(Math.max(0, Number(baseline) - Number(minimum)) * 10) / 10;
    if (drop <= 2.4) return 0;
    if (drop <= 4.9) return 1;
    if (drop <= 7.4) return 2;
    return 3;
  }

  pippGestationalMismatch(initialWeeks: number | undefined, selectedScore: number | null): ClinicalWarning[] {
    if (initialWeeks === undefined || selectedScore === null) return [];
    const initialScore = this.pippGestationalAgeScore(initialWeeks);
    if (initialScore === null || initialScore === selectedScore) return [];
    return [{
      code:'PIPP_GESTATIONAL_AGE_MISMATCH',
      blocking:false,
      messageFa:`سن حاملگی اولیه ${initialWeeks} هفته با دسته انتخاب‌شده در PIPP همخوان نیست. انتخاب PIPP حفظ شده و این هشدار مانع ادامه نیست.`,
    }];
  }

  scoreGeneric(scale: Exclude<ScaleKey,'PIPP'>, answers: Record<string, number>): {score:number; completedCriteria:number; totalCriteria:number} {
    const def = SCALE_DEFINITIONS[scale];
    let score = 0; let completedCriteria = 0;
    for (const item of def.items) {
      const value = answers[item.id];
      if (Number.isFinite(value) && item.options.some(option => option.value === value)) {
        score += value; completedCriteria++;
      }
    }
    return {score, completedCriteria, totalCriteria:def.items.length};
  }

  scorePipp(answers: Record<string, number>): {score:number; completedCriteria:number; totalCriteria:number; measurements:Record<string,unknown>} {
    const ga = Number.isInteger(answers.gaScore) && answers.gaScore >= 0 && answers.gaScore <= 3 ? answers.gaScore : null;
    const behavior = Number.isInteger(answers.behavior) && answers.behavior >= 0 && answers.behavior <= 3 ? answers.behavior : null;
    const hr = [answers.baselineHr,answers.maxHr].every(Number.isFinite) ? this.pippHeartRateScore(answers.baselineHr,answers.maxHr) : null;
    const spo2 = [answers.baselineSpo2,answers.minSpo2].every(Number.isFinite) ? this.pippSpo2Score(answers.baselineSpo2,answers.minSpo2) : null;
    const brow = Number.isFinite(answers.browPercent) ? this.pippPercentScore(answers.browPercent) : null;
    const eye = Number.isFinite(answers.eyePercent) ? this.pippPercentScore(answers.eyePercent) : null;
    const nasolabial = Number.isFinite(answers.nasolabialPercent) ? this.pippPercentScore(answers.nasolabialPercent) : null;
    const values = [ga,behavior,hr,spo2,brow,eye,nasolabial];
    const completedCriteria = values.filter(v => v !== null).length;
    const score = values.reduce<number>((sum,v) => sum + (v ?? 0), 0);
    return {score,completedCriteria,totalCriteria:7,measurements:{gaScore:ga,behavior,hrScore:hr,spo2Score:spo2,browPercent:answers.browPercent,eyePercent:answers.eyePercent,nasolabialPercent:answers.nasolabialPercent,baselineHr:answers.baselineHr,maxHr:answers.maxHr,baselineSpo2:answers.baselineSpo2,minSpo2:answers.minSpo2}};
  }
}
