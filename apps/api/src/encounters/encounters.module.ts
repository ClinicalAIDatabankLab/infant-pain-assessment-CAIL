import { Module } from '@nestjs/common';
import { PersistenceModule } from '../persistence/persistence.module';
import { EncountersController } from './encounters.controller';
@Module({imports:[PersistenceModule],controllers:[EncountersController]})
export class EncountersModule {}
