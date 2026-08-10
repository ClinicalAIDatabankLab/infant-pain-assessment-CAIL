import type { FormEvent } from 'react';
import type { InfantContext } from '@neonatal/clinical-domain';
import { ClinicalButton } from '../../components/ClinicalButton';

export const EMPTY_CONTEXT:InfantContext={preterm:false,ventilated:false,chronicPain:false,postoperative:false,assessmentType:'acute'};

export function InfantContextForm({value,onChange,onSubmit,loading}:{value:InfantContext;onChange:(value:InfantContext)=>void;onSubmit:()=>void;loading?:boolean}){
  const update=<K extends keyof InfantContext>(key:K,next:InfantContext[K])=>onChange({...value,[key]:next});
  const submit=(event:FormEvent)=>{event.preventDefault();onSubmit();};
  return <form className="clinical-card context-form" onSubmit={submit} noValidate>
    <div className="section-heading"><div><span className="eyebrow">مرحله ۱</span><h2>اطلاعات اولیه نوزاد</h2><p>اطلاعات شناسایی در این نسخه آزمایشی فقط در حافظه موقت سرور قرار می‌گیرد.</p></div></div>
    <div className="form-grid">
      <label className="field"><span>شماره پرونده</span><input value={value.recordId??''} onChange={e=>update('recordId',e.target.value)} autoComplete="off"/></label>
      <label className="field"><span>کدملی مادر</span><input value={value.motherNationalId??''} onChange={e=>update('motherNationalId',e.target.value)} inputMode="numeric" autoComplete="off" maxLength={32}/><small>در console یا log سامانه ثبت نمی‌شود.</small></label>
      <label className="field"><span>هفته بارداری</span><input type="number" min={20} max={45} value={value.gestationalWeeks??''} onChange={e=>update('gestationalWeeks',e.target.value===''?undefined:Number(e.target.value))} inputMode="numeric"/></label>
      <label className="field"><span>سن (روز)</span><input type="number" min={0} max={180} value={value.ageDays??''} onChange={e=>update('ageDays',e.target.value===''?undefined:Number(e.target.value))}/></label>
      <label className="field"><span>وزن (گرم)</span><input type="number" min={300} max={10000} value={value.weightGrams??''} onChange={e=>update('weightGrams',e.target.value===''?undefined:Number(e.target.value))}/></label>
      <fieldset className="field fieldset-inline"><legend>جنسیت</legend><label><input type="radio" name="sex" checked={value.sex==='male'} onChange={()=>update('sex','male')}/> پسر</label><label><input type="radio" name="sex" checked={value.sex==='female'} onChange={()=>update('sex','female')}/> دختر</label></fieldset>
    </div>
    <fieldset className="context-flags"><legend>زمینه بالینی</legend><div className="check-grid">
      <label className="check-card"><input type="checkbox" checked={value.preterm} onChange={e=>update('preterm',e.target.checked)}/><span><strong>نارس</strong><small>برای پیشنهاد PIPP در درد حاد</small></span></label>
      <label className="check-card"><input type="checkbox" checked={value.ventilated} onChange={e=>update('ventilated',e.target.checked)}/><span><strong>تهویه مکانیکی</strong><small>زمینه مناسب MPAT</small></span></label>
      <label className="check-card"><input type="checkbox" checked={value.chronicPain} onChange={e=>update('chronicPain',e.target.checked)}/><span><strong>درد مزمن</strong><small>زمینه مناسب MPAT</small></span></label>
      <label className="check-card"><input type="checkbox" checked={value.postoperative} onChange={e=>update('postoperative',e.target.checked)}/><span><strong>پس از عمل</strong><small>زمینه مناسب CRIES</small></span></label>
    </div></fieldset>
    <fieldset className="field fieldset-inline assessment-type"><legend>نوع ارزیابی</legend><label><input type="radio" checked={value.assessmentType==='acute'} onChange={()=>update('assessmentType','acute')}/> درد حاد</label><label><input type="radio" checked={value.assessmentType==='other'} onChange={()=>update('assessmentType','other')}/> سایر / پایش</label></fieldset>
    <div className="form-actions"><ClinicalButton type="submit" loading={loading} showArrow>ثبت اطلاعات و دریافت پیشنهاد ابزار</ClinicalButton></div>
  </form>
}
