import { Body, Controller, Get, Post } from '@nestjs/common';
import { SCALE_DEFINITIONS } from '@neonatal/clinical-domain';
import { CreateEncounterDto } from '../encounters/dto/create-encounter.dto';
import { ScoringService } from './scoring.service';

@Controller()
export class ClinicalController {
  constructor(private readonly scoring: ScoringService) {}

  @Get('scales')
  getScales() { return Object.values(SCALE_DEFINITIONS); }

  @Post('recommend-scale')
  recommendScale(@Body() context: CreateEncounterDto) {
    return {scale:this.scoring.recommendScale(context)};
  }
}
