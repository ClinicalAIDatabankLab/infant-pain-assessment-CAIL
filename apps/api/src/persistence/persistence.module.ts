import { Module } from '@nestjs/common';
import { ASSESSMENT_REPOSITORY } from './assessment.repository';
import { InMemoryAssessmentRepository } from './in-memory-assessment.repository';

@Module({
  providers:[{provide:ASSESSMENT_REPOSITORY,useClass:InMemoryAssessmentRepository}],
  exports:[ASSESSMENT_REPOSITORY],
})
export class PersistenceModule {}
