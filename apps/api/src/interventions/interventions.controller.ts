import { Body, Controller, Inject, NotFoundException, Param, Post } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ASSESSMENT_REPOSITORY, type AssessmentRepository } from '../persistence/assessment.repository';
import { RecordInterventionsDto } from './dto/record-interventions.dto';

@Controller('encounters/:encounterId/interventions')
export class InterventionsController {
  constructor(@Inject(ASSESSMENT_REPOSITORY) private readonly repository:AssessmentRepository) {}

  @Post()
  async record(@Param('encounterId') encounterId:string,@Body() dto:RecordInterventionsDto) {
    const interventions = dto.interventions.map(item=>({...item,id:randomUUID(),performedAt:new Date().toISOString()}));
    try { await this.repository.saveInterventions(encounterId,interventions); return {saved:interventions.length,interventions}; }
    catch (error) {
      if (error instanceof Error && error.message === 'ENCOUNTER_NOT_FOUND') throw new NotFoundException({code:'ENCOUNTER_NOT_FOUND',messageFa:'پرونده موقت موردنظر یافت نشد.'});
      throw error;
    }
  }
}
