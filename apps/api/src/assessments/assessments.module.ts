import { Module } from '@nestjs/common';
import { ClinicalModule } from '../clinical/clinical.module';
import { RecommendationService } from '../clinical/recommendation.service';
import { ScoringService } from '../clinical/scoring.service';
import { ASSESSMENT_REPOSITORY, type AssessmentRepository } from '../persistence/assessment.repository';
import { PersistenceModule } from '../persistence/persistence.module';
import { AssessmentsController } from './assessments.controller';
import { AssessmentsService } from './assessments.service';

@Module({
  imports:[ClinicalModule,PersistenceModule],
  controllers:[AssessmentsController],
  providers:[{
    provide:AssessmentsService,
    inject:[ScoringService,RecommendationService,ASSESSMENT_REPOSITORY],
    useFactory:(scoring:ScoringService,recommendations:RecommendationService,repository:AssessmentRepository)=>new AssessmentsService(scoring,recommendations,repository),
  }],
  exports:[AssessmentsService],
})
export class AssessmentsModule {}
