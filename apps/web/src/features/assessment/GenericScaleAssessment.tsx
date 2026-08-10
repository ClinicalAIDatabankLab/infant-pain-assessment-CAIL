import { useMemo, useState } from 'react';
import type { AssessmentResult, InfantContext, ScaleKey } from '@neonatal/clinical-domain';
import { SCALE_DEFINITIONS } from '@neonatal/clinical-domain';
import { evaluateAssessment } from '../../api/client';
import { ClinicalButton } from '../../components/ClinicalButton';
import { RecommendationPanel } from '../../components/RecommendationPanel';

export function GenericScaleAssessment({scale,infantContext,encounterId,onResult,onContinue,continueLabel='ادامه به مداخله'}:{scale:Exclude<ScaleKey,'PIPP'>;infantContext?:InfantContext;encounterId?:string;onResult?:(result:AssessmentResult)=>void;onContinue?:(result:AssessmentResult)=>void;continueLabel?:string}){
  const definition=SCALE_DEFINITIONS[scale];
  const [answers,setAnswers]=useState<Record<string,number>>({});
  const [result,setResult]=useState<AssessmentResult>();
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const completed=useMemo(()=>definition.items.filter(item=>Number.isFinite(answers[item.id])).length,[answers,definition]);
  const evaluate=async()=>{setLoading(true);setError('');try{const next=await evaluateAssessment({scale,answers,infantContext,encounterId});setResult(next);onResult?.(next);}catch(error:any){setError(error?.message??'ارتباط با API برقرار نشد. پاسخ‌های شما حفظ شده‌اند.');}finally{setLoading(false)}};
  return <section className="assessment-stack"><header className="assessment-heading"><div><span className="eyebrow">{scale}</span><h2>{definition.title}</h2><p>{definition.contextFa}</p></div><span className="scale-pill">{completed}/{definition.items.length} معیار</span></header>
    {definition.items.map((item,index)=><fieldset className={`criterion-card ${Number.isFinite(answers[item.id])?'is-answered':''}`} key={item.id}><legend><span>{index+1}</span>{item.labelFa}</legend>{item.helpFa?<p>{item.helpFa}</p>:null}<div className="option-grid">{item.options.map(option=><label className="option-tile" key={option.value}><input type="radio" name={`${scale}-${item.id}`} value={option.value} checked={answers[item.id]===option.value} onChange={()=>{setAnswers(prev=>({...prev,[item.id]:option.value}));setResult(undefined)}}/><span className="option-tile__copy"><strong>{option.labelFa}</strong><small>امتیاز {option.value}</small></span></label>)}</div></fieldset>)}
    <div className="assessment-submit"><div className="progress-row"><span>تکمیل ارزیابی</span><strong>{completed} از {definition.items.length}</strong></div><div className="linear-progress"><span style={{width:`${completed/definition.items.length*100}%`}}/></div>{error?<div className="inline-error" role="alert">{error}</div>:null}<ClinicalButton onClick={evaluate} disabled={completed!==definition.items.length} loading={loading} showArrow>محاسبه نتیجه و دریافت پیشنهاد</ClinicalButton></div>
    {result?<><RecommendationPanel result={result}/>{onContinue?<div className="sticky-next"><ClinicalButton onClick={()=>onContinue(result)} showArrow>{continueLabel}</ClinicalButton></div>:null}</>:null}
  </section>
}
