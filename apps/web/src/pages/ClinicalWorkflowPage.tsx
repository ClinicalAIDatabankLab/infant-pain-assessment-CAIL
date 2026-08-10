import { useState } from 'react';
import type { AssessmentResult, InfantContext, RecordedIntervention, ScaleKey } from '@neonatal/clinical-domain';
import { createEncounter, recommendScale } from '../api/client';
import { ClinicalButton } from '../components/ClinicalButton';
import { ArrowRightIcon } from '../components/icons';
import { WorkflowStepper } from '../components/WorkflowStepper';
import { AssessmentRenderer } from '../features/assessment/AssessmentRenderer';
import { DocumentationSummary } from '../features/documentation/DocumentationSummary';
import { EMPTY_CONTEXT, InfantContextForm } from '../features/infant-context/InfantContextForm';
import { InterventionRecorder } from '../features/intervention/InterventionRecorder';
import { ReassessmentPanel } from '../features/reassessment/ReassessmentPanel';

const SCALE_DESCRIPTIONS:Record<ScaleKey,string>={PIPP:'درد حاد، به‌ویژه در نوزادان نارس',NIPS:'درد حاد ناشی از اقدامات تشخیصی/درمانی',CRIES:'درد پس از عمل',MPAT:'تهویه مکانیکی، درد مزمن یا پایش چندبعدی'};
const SCALE_KEYS:ScaleKey[]=['PIPP','NIPS','CRIES','MPAT'];

export function ClinicalWorkflowPage(){
  const [step,setStepState]=useState(1);const [maxReached,setMaxReached]=useState(1);
  const [context,setContext]=useState<InfantContext>(EMPTY_CONTEXT);const [encounterId,setEncounterId]=useState<string>();const [recommended,setRecommended]=useState<ScaleKey>();const [scale,setScale]=useState<ScaleKey>();
  const [initial,setInitial]=useState<AssessmentResult>();const [reassessment,setReassessment]=useState<AssessmentResult>();const [interventions,setInterventions]=useState<RecordedIntervention[]>([]);
  const [loadingContext,setLoadingContext]=useState(false);const [contextError,setContextError]=useState('');
  const goto=(next:number)=>{setStepState(next);setMaxReached(current=>Math.max(current,next));window.scrollTo({top:0,behavior:'smooth'})};
  const prepare=async()=>{setLoadingContext(true);setContextError('');try{const [encounter,recommendation]=await Promise.all([createEncounter(context),recommendScale(context)]);setEncounterId(encounter.id);setRecommended(recommendation.scale);setScale(undefined);setInitial(undefined);setReassessment(undefined);setInterventions([]);}catch(error:any){setContextError(error?.message??'API در دسترس نیست. اطلاعات واردشده در فرم حفظ شده‌اند.');}finally{setLoadingContext(false)}};
  const chooseScale=(key:ScaleKey)=>{setScale(key);goto(2)};
  return <main className="page-shell"><div className="page-intro"><div><span className="eyebrow">Clinical workflow</span><h1>مسیر ارزیابی و مدیریت درد نوزاد</h1><p>پنج مرحله از ثبت زمینه بالینی تا ارزیابی مجدد و مستندسازی.</p></div>{step>1?<ClinicalButton variant="secondary" icon={<ArrowRightIcon/>} onClick={()=>setStepState(step-1)}>بازگشت به مرحله قبل</ClinicalButton>:null}</div>
    <WorkflowStepper current={step} maxReached={maxReached} onStep={setStepState}/>
    {step===1?<><InfantContextForm value={context} onChange={setContext} onSubmit={prepare} loading={loadingContext}/>{contextError?<div className="api-state-error" role="alert"><strong>ارتباط با API برقرار نشد</strong><span>{contextError}</span><ClinicalButton variant="secondary" onClick={prepare}>تلاش دوباره</ClinicalButton></div>:null}{recommended&&encounterId?<section className="clinical-card scale-recommend-card"><div><span className="eyebrow">پیشنهاد NestJS</span><h2>ابزار پیشنهادی: {recommended}</h2><p>{SCALE_DESCRIPTIONS[recommended]}</p></div><div className="scale-choice-actions"><ClinicalButton onClick={()=>chooseScale(recommended)} showArrow>شروع با {recommended}</ClinicalButton><div className="override-row"><span>انتخاب آگاهانه ابزار دیگر:</span>{SCALE_KEYS.filter(key=>key!==recommended).map(key=><button className="scale-override" key={key} type="button" onClick={()=>chooseScale(key)}><strong>{key}</strong><small>{SCALE_DESCRIPTIONS[key]}</small></button>)}</div></div></section>:null}</>:null}
    {step===2&&scale?<AssessmentRenderer scale={scale} infantContext={context} encounterId={encounterId} onResult={setInitial} onContinue={result=>{setInitial(result);goto(3)}}/>:null}
    {step===3&&initial&&encounterId?<InterventionRecorder encounterId={encounterId} result={initial} onSaved={items=>{setInterventions(items);goto(4)}}/>:null}
    {step===4&&initial&&scale&&encounterId?<ReassessmentPanel scale={scale} context={context} encounterId={encounterId} baseline={initial} onDone={result=>{setReassessment(result);goto(5)}}/>:null}
    {step===5&&initial&&scale?<DocumentationSummary context={context} scale={scale} initial={initial} reassessment={reassessment} interventions={interventions}/>:null}
  </main>
}
