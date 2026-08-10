import type { RecommendationPackage, ScaleKey, SeverityKey } from '@neonatal/clinical-domain';
import { RECOMMENDATION_MATRIX } from './recommendation.matrix';

export class RecommendationCoverageError extends Error {
  constructor(public readonly scale: ScaleKey, public readonly severity: SeverityKey) {
    super(`Recommendation coverage missing for ${scale}/${severity}`);
    this.name = 'RecommendationCoverageError';
  }
}

export class RecommendationService {
  getRecommendation(scale: ScaleKey, severity: SeverityKey): RecommendationPackage {
    const recommendation = RECOMMENDATION_MATRIX[scale]?.[severity];
    if (!recommendation) throw new RecommendationCoverageError(scale,severity);
    if (!recommendation.nonMedication.length || !recommendation.sourceRefs.length) throw new RecommendationCoverageError(scale,severity);
    return structuredClone(recommendation);
  }
}
