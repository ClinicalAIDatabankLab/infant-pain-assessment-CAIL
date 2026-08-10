import { Module } from '@nestjs/common';
import { PersistenceModule } from '../persistence/persistence.module';
import { InterventionsController } from './interventions.controller';
@Module({imports:[PersistenceModule],controllers:[InterventionsController]})
export class InterventionsModule {}
