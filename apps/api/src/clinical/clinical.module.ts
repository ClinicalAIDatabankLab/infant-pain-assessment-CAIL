import { Module } from '@nestjs/common';
import { ClinicalController } from './clinical.controller';
import { RecommendationService } from './recommendation.service';
import { ScoringService } from './scoring.service';

@Module({
  controllers:[ClinicalController],
  providers:[ScoringService,RecommendationService],
  exports:[ScoringService,RecommendationService],
})
export class ClinicalModule {}
