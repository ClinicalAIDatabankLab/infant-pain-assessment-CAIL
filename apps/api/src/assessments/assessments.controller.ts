import { BadRequestException, Body, Controller, NotFoundException, Param, Post, UnprocessableEntityException } from '@nestjs/common';
import { RecommendationCoverageError } from '../clinical/recommendation.service';
import { AssessmentsService, IncompleteAssessmentError } from './assessments.service';
import { EvaluateAssessmentDto } from './dto/evaluate-assessment.dto';

@Controller()
export class AssessmentsController {
  constructor(private readonly assessments: AssessmentsService) {}

  @Post('assessments/evaluate')
  evaluate(@Body() dto: EvaluateAssessmentDto) {
    try { return this.assessments.evaluate(dto); }
    catch (error) { this.rethrow(error); }
  }

  @Post('encounters/:encounterId/assessments')
  async evaluateAndSave(@Param('encounterId') encounterId:string,@Body() dto:EvaluateAssessmentDto) {
    try { return await this.assessments.evaluateAndSave(encounterId,{scale:dto.scale,answers:dto.answers}); }
    catch (error) { this.rethrow(error); }
  }

  private rethrow(error:unknown): never {
    if (error instanceof IncompleteAssessmentError) throw new BadRequestException({code:'ASSESSMENT_INCOMPLETE',completed:error.completed,total:error.total,messageFa:'تمام معیارهای ابزار باید پیش از محاسبه نتیجه تکمیل شوند.'});
    if (error instanceof RecommendationCoverageError) throw new UnprocessableEntityException({code:'RECOMMENDATION_COVERAGE_ERROR',messageFa:'برای این ترکیب ابزار و سطح درد، توصیه معتبر در سامانه تعریف نشده است. نتیجه امتیاز نمایش داده می‌شود اما پیشنهاد درمانی جایگزین تولید نمی‌شود.'});
    if (error instanceof Error && error.message === 'ENCOUNTER_NOT_FOUND') throw new NotFoundException({code:'ENCOUNTER_NOT_FOUND',messageFa:'پرونده موقت موردنظر یافت نشد.'});
    throw error;
  }
}
