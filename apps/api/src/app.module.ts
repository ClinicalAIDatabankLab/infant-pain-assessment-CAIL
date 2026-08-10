import { Module } from '@nestjs/common';
import { AssessmentsModule } from './assessments/assessments.module';
import { ClinicalModule } from './clinical/clinical.module';
import { EncountersModule } from './encounters/encounters.module';
import { InterventionsModule } from './interventions/interventions.module';
import { PersistenceModule } from './persistence/persistence.module';

@Module({imports:[ClinicalModule,PersistenceModule,AssessmentsModule,EncountersModule,InterventionsModule]})
export class AppModule {}
