import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import type { InfantContext } from '@neonatal/clinical-domain';

export class CreateEncounterDto implements InfantContext {
  @IsOptional() @IsString() @MaxLength(64) recordId?: string;
  @IsOptional() @IsString() @MaxLength(32) motherNationalId?: string;
  @IsOptional() @Type(()=>Number) @IsNumber() @Min(20) @Max(45) gestationalWeeks?: number;
  @IsOptional() @Type(()=>Number) @IsNumber() @Min(0) @Max(180) ageDays?: number;
  @IsOptional() @Type(()=>Number) @IsNumber() @Min(300) @Max(10000) weightGrams?: number;
  @IsOptional() @IsIn(['male','female']) sex?: 'male'|'female';
  @IsBoolean() preterm!: boolean;
  @IsBoolean() ventilated!: boolean;
  @IsBoolean() chronicPain!: boolean;
  @IsBoolean() postoperative!: boolean;
  @IsIn(['acute','other']) assessmentType!: 'acute'|'other';
}
