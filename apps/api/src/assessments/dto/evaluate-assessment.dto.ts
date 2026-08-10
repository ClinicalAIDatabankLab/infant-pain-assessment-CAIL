import { IsIn, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import type { ScaleKey } from '@neonatal/clinical-domain';
import { CreateEncounterDto } from '../../encounters/dto/create-encounter.dto';

export class EvaluateAssessmentDto {
  @IsIn(['PIPP','NIPS','CRIES','MPAT']) scale!: ScaleKey;
  @IsObject() answers!: Record<string, number>;
  @IsOptional() @ValidateNested() @Type(()=>CreateEncounterDto) infantContext?: CreateEncounterDto;
  @IsOptional() @IsString() encounterId?: string;
}
