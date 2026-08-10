import { Body, Controller, Get, Inject, NotFoundException, Param, Post } from '@nestjs/common';
import { ASSESSMENT_REPOSITORY, type AssessmentRepository } from '../persistence/assessment.repository';
import { CreateEncounterDto } from './dto/create-encounter.dto';

@Controller('encounters')
export class EncountersController {
  constructor(@Inject(ASSESSMENT_REPOSITORY) private readonly repository:AssessmentRepository) {}

  @Post()
  create(@Body() dto:CreateEncounterDto) { return this.repository.createEncounter(dto); }

  @Get(':id')
  async get(@Param('id') id:string) {
    const encounter = await this.repository.getEncounter(id);
    if (!encounter) throw new NotFoundException({code:'ENCOUNTER_NOT_FOUND',messageFa:'پرونده موقت موردنظر یافت نشد.'});
    return encounter;
  }

  @Get(':id/summary')
  async summary(@Param('id') id:string) {
    try { return await this.repository.getEncounterSummary(id); }
    catch (error) {
      if (error instanceof Error && error.message === 'ENCOUNTER_NOT_FOUND') throw new NotFoundException({code:'ENCOUNTER_NOT_FOUND',messageFa:'پرونده موقت موردنظر یافت نشد.'});
      throw error;
    }
  }
}
