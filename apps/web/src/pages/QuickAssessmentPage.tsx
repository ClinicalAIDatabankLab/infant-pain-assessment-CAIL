import { useState } from 'react';
import type { ScaleKey } from '@neonatal/clinical-domain';
import { SCALE_DEFINITIONS } from '@neonatal/clinical-domain';
import { AssessmentRenderer } from '../features/assessment/AssessmentRenderer';
const SCALE_KEYS:ScaleKey[]=['PIPP','NIPS','CRIES','MPAT'];
export function QuickAssessmentPage(){const [scale,setScale]=useState<ScaleKey>();return <main className="page-shell"><div className="page-intro"><div><span className="eyebrow">Quick assessment</span><h1>ارزیابی سریع</h1><p>بدون ایجاد پرونده، ابزار را انتخاب و نتیجه و توصیه اختصاصی را دریافت کنید.</p></div></div>{!scale?<div className="tool-grid">{SCALE_KEYS.map(key=><button type="button" className="tool-card" key={key} onClick={()=>setScale(key)}><span>{key}</span><h2>{SCALE_DEFINITIONS[key].title}</h2><p>{SCALE_DEFINITIONS[key].contextFa}</p><strong>شروع ارزیابی ←</strong></button>)}</div>:<><button type="button" className="text-back" onClick={()=>setScale(undefined)}>انتخاب ابزار دیگر</button><AssessmentRenderer scale={scale}/></>}</main>}
