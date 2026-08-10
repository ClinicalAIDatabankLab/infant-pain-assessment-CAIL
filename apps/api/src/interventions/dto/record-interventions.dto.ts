import { IsArray, IsIn, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class RecordedInterventionDto {
  @IsString() actionId!: string;
  @IsString() labelFa!: string;
  @IsIn(['non-medication','physician-ordered-medication']) kind!: 'non-medication'|'physician-ordered-medication';
}
export class RecordInterventionsDto {
  @IsArray() @ValidateNested({each:true}) @Type(()=>RecordedInterventionDto) interventions!: RecordedInterventionDto[];
}
