import { useState } from 'react';
import { NON_MEDICATION_ACTION_CATALOG,type AssessmentResult,type RecordedIntervention } from '@neonatal/clinical-domain';
import { saveInterventions } from '../../api/client';
import { ClinicalButton } from '../../components/ClinicalButton';
import { RecommendationPanel } from '../../components/RecommendationPanel';

interface InterventionRecorderProps {
  encounterId:string;
  result:AssessmentResult;
  onSaved:(items:RecordedIntervention[])=>void;
}

export function InterventionRecorder({encounterId,result,onSaved}:InterventionRecorderProps){
  const [selected,setSelected]=useState<string[]>([]);
  const [medication,setMedication]=useState(false);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const recommendedIds=new Set(result.recommendation.nonMedication.map(action=>action.id));
  const actions=[...NON_MEDICATION_ACTION_CATALOG].sort((left,right)=>Number(recommendedIds.has(right.id))-Number(recommendedIds.has(left.id)));

  const toggle=(id:string)=>setSelected(previous=>previous.includes(id)?previous.filter(item=>item!==id):[...previous,id]);
  const save=async()=>{
    setLoading(true);
    setError('');
    try{
      const nonMedication=actions.filter(action=>selected.includes(action.id)).map(action=>({actionId:action.id,labelFa:action.labelFa,kind:'non-medication' as const}));
      const medicationItem=medication&&result.recommendation.medication?[{actionId:'physician-ordered-medication',labelFa:'مداخله دارویی طبق تجویز پزشک',kind:'physician-ordered-medication' as const}]:[];
      const response=await saveInterventions(encounterId,[...nonMedication,...medicationItem]);
      onSaved(response.interventions);
    }catch(error:any){
      setError(error?.message??'ثبت مداخله انجام نشد.');
    }finally{
      setLoading(false);
    }
  };

  return <section className="intervention-stack">
    <RecommendationPanel result={result}/>
    <div className="clinical-card"><div className="section-heading"><div><span className="eyebrow">ثبت اقدام انجام‌شده</span><h2>کدام مداخلات واقعاً انجام شدند؟</h2><p>همه گزینه‌های غیردارویی قابل انتخاب‌اند؛ موارد متناسب با این ارزیابی مشخص شده‌اند.</p></div></div>
      <div className="performed-grid">{actions.map(action=>{
        const isRecommended=recommendedIds.has(action.id);
        return <label className={`performed-card ${isRecommended?'is-recommended':''}`} key={action.id}><input type="checkbox" checked={selected.includes(action.id)} onChange={()=>toggle(action.id)}/><span><span className="performed-card__title"><strong>{action.labelFa}</strong>{isRecommended?<small className="recommendation-badge">پیشنهادشده</small>:null}</span><small>مداخله غیردارویی</small></span></label>;
      })}</div>
      {result.recommendation.medication?<label className="performed-card performed-card--medical"><input type="checkbox" checked={medication} onChange={event=>setMedication(event.target.checked)}/><span><strong>مداخله دارویی طبق تجویز پزشک انجام شد</strong><small>این ثبت به معنی صدور دستور دارویی توسط سامانه نیست.</small></span></label>:null}
      {error?<div className="inline-error" role="alert">{error}</div>:null}
      <div className="form-actions"><ClinicalButton onClick={save} loading={loading} showArrow>ثبت مداخلات و ادامه</ClinicalButton></div>
    </div>
  </section>;
}
