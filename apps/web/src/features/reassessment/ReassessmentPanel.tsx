import type { AssessmentResult, InfantContext, ScaleKey } from '@neonatal/clinical-domain';
import { AssessmentRenderer } from '../assessment/AssessmentRenderer';
export function ReassessmentPanel({scale,context,encounterId,baseline,onDone}:{scale:ScaleKey;context:InfantContext;encounterId:string;baseline:AssessmentResult;onDone:(result:AssessmentResult)=>void}){
  return <section><div className="reassessment-banner"><strong>ارزیابی مجدد با همان ابزار: {scale}</strong><span>نتیجه اولیه: {baseline.score} · {baseline.severityLabelFa}. مقادیر جدید را مستقل ثبت کنید.</span></div><AssessmentRenderer scale={scale} infantContext={context} encounterId={encounterId} onContinue={onDone} continueLabel="ثبت ارزیابی مجدد و مشاهده گزارش"/></section>
}
