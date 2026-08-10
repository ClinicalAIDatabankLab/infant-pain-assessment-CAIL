import type { FormEvent } from 'react';
import type { InfantContext,ScaleKey } from '@neonatal/clinical-domain';
import { ClinicalButton } from '../../components/ClinicalButton';

export const EMPTY_CONTEXT:InfantContext={preterm:false,ventilated:false,chronicPain:false,postoperative:false,assessmentType:'acute'};

const SCALE_KEYS:ScaleKey[]=['PIPP','NIPS','CRIES','MPAT'];
const SCALE_DESCRIPTIONS:Record<ScaleKey,string>={
  PIPP:'مناسب ارزیابی درد حاد، به‌ویژه در نوزادان نارس',
  NIPS:'مناسب درد حاد ناشی از اقدامات تشخیصی و درمانی',
  CRIES:'مناسب ارزیابی درد پس از عمل',
  MPAT:'مناسب تهویه مکانیکی، درد مزمن یا پایش چندبعدی',
};

interface InfantContextFormProps {
  value:InfantContext;
  onChange:(value:InfantContext)=>void;
  onSubmit:()=>void;
  loading?:boolean;
  recommended?:ScaleKey;
  onChooseScale?:(scale:ScaleKey)=>void;
  error?:string;
  onRetry?:()=>void;
}

export function InfantContextForm({value,onChange,onSubmit,loading,recommended,onChooseScale,error,onRetry}:InfantContextFormProps){
  const update=<K extends keyof InfantContext>(key:K,next:InfantContext[K])=>onChange({...value,[key]:next});
  const submit=(event:FormEvent)=>{event.preventDefault();onSubmit();};

  return <form className="context-form" onSubmit={submit} noValidate>
    <section className="clinical-card context-section context-section--infant" aria-labelledby="infant-information-title">
      <div className="section-heading compact-section-heading"><div><span className="eyebrow">۱. اطلاعات پایه</span><h2 id="infant-information-title">اطلاعات نوزاد</h2><p>اطلاعات شناسایی فقط در همین ارزیابی استفاده می‌شود.</p></div></div>
      <div className="infant-details-grid">
        <label className="field field--record"><span>شماره پرونده</span><input value={value.recordId??''} onChange={event=>update('recordId',event.target.value)} autoComplete="off"/></label>
        <label className="field field--mother-id"><span>کد ملی مادر</span><input value={value.motherNationalId??''} onChange={event=>update('motherNationalId',event.target.value)} inputMode="numeric" autoComplete="off" maxLength={32}/></label>
        <label className="field"><span>هفته بارداری</span><input type="number" min={20} max={45} placeholder="مثلاً ۳۶" value={value.gestationalWeeks??''} onChange={event=>update('gestationalWeeks',event.target.value===''?undefined:Number(event.target.value))} inputMode="numeric"/></label>
        <label className="field"><span>سن (روز)</span><input type="number" min={0} max={180} placeholder="مثلاً ۵" value={value.ageDays??''} onChange={event=>update('ageDays',event.target.value===''?undefined:Number(event.target.value))}/></label>
        <label className="field"><span>وزن (گرم)</span><input type="number" min={300} max={10000} placeholder="مثلاً ۲۸۵۰" value={value.weightGrams??''} onChange={event=>update('weightGrams',event.target.value===''?undefined:Number(event.target.value))}/></label>
        <fieldset className="field compact-segmented field--sex"><legend>جنسیت</legend><div><label><input type="radio" name="sex" checked={value.sex==='male'} onChange={()=>update('sex','male')}/><span>پسر</span></label><label><input type="radio" name="sex" checked={value.sex==='female'} onChange={()=>update('sex','female')}/><span>دختر</span></label></div></fieldset>
      </div>
    </section>

    <section className="clinical-card context-section context-section--clinical" aria-labelledby="assessment-context-title">
      <div className="section-heading compact-section-heading"><div><span className="eyebrow">۲. زمینه بالینی</span><h2 id="assessment-context-title">وضعیت و هدف ارزیابی</h2><p>ابزار پیشنهادی بر اساس سن، وضعیت نوزاد و نوع درد انتخاب می‌شود.</p></div></div>
      <div className="clinical-layout">
        <fieldset className="context-flags"><legend>وضعیت بالینی</legend><div className="clinical-choice-grid">
          <label className="compact-choice"><input type="checkbox" checked={value.preterm} onChange={event=>update('preterm',event.target.checked)}/><span>نارس / پره‌ترم</span></label>
          <label className="compact-choice"><input type="checkbox" checked={value.ventilated} onChange={event=>update('ventilated',event.target.checked)}/><span>تحت تهویه مکانیکی</span></label>
          <label className="compact-choice"><input type="checkbox" checked={value.chronicPain} onChange={event=>update('chronicPain',event.target.checked)}/><span>درد مزمن</span></label>
          <label className="compact-choice"><input type="checkbox" checked={value.postoperative} onChange={event=>update('postoperative',event.target.checked)}/><span>پس از عمل جراحی</span></label>
        </div></fieldset>
        <fieldset className="assessment-type"><legend>نوع ارزیابی</legend><div className="assessment-type-grid">
          <label className="compact-choice"><input type="radio" name="assessment-type" checked={value.assessmentType==='acute'} onChange={()=>update('assessmentType','acute')}/><span>درد حاد ناشی از اقدام تشخیصی / درمانی</span></label>
          <label className="compact-choice"><input type="radio" name="assessment-type" checked={value.assessmentType==='other'} onChange={()=>update('assessmentType','other')}/><span>پایش عمومی / دوره‌ای</span></label>
        </div></fieldset>
      </div>

      {error?<div className="api-state-error context-api-error" role="alert"><strong>ارتباط با API برقرار نشد</strong><span>{error}</span>{onRetry?<ClinicalButton type="button" variant="secondary" onClick={onRetry}>تلاش دوباره</ClinicalButton>:null}</div>:null}

      {!recommended?<div className="form-actions compact-form-actions"><ClinicalButton type="submit" loading={loading} showArrow>دریافت ابزار پیشنهادی</ClinicalButton></div>:null}

      {recommended?<div className="scale-choice-panel" aria-labelledby="scale-choice-title">
        <div className="scale-choice-summary"><span className="eyebrow">ابزار پیشنهادی</span><h3 id="scale-choice-title">{recommended}</h3><p>{SCALE_DESCRIPTIONS[recommended]}</p></div>
        <div className="scale-choice-grid">{SCALE_KEYS.map(key=><button className={`scale-choice ${key===recommended?'is-recommended':''}`} key={key} type="button" onClick={()=>onChooseScale?.(key)}><span><strong>{key}</strong><small>{SCALE_DESCRIPTIONS[key]}</small></span>{key===recommended?<em className="recommendation-badge">پیشنهادشده</em>:null}</button>)}</div>
      </div>:null}
    </section>
  </form>;
}
