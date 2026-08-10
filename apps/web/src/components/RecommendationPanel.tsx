import type { AssessmentResult, RecommendationPackage } from '@neonatal/clinical-domain';
import { AlertIcon, LeafIcon, RefreshIcon, StethoscopeIcon } from './icons';

export function RecommendationPanel({result,recommendation=result.recommendation}:{result:AssessmentResult;recommendation?:RecommendationPackage}){
  const needsReview = recommendation.sourceRefs.some(source=>source.reviewStatus==='requires-clinical-review');
  return <section className="recommendation-panel" aria-labelledby="recommendation-title">
    <header className="recommendation-header"><div><span className="eyebrow">بسته توصیه اختصاصی</span><h3 id="recommendation-title">{recommendation.titleFa}</h3><p>ابزار <strong>{recommendation.scale}</strong> · {result.severityLabelFa} · امتیاز {result.score}</p></div><span className={`severity-badge severity-${result.severity}`}>{result.severityLabelFa}</span></header>

    <section className="recommendation-section recommendation-section--nonmed" aria-labelledby="nonmed-title">
      <div className="recommendation-section__icon"><LeafIcon/></div><div><h4 id="nonmed-title">اقدامات غیردارویی پیشنهادی</h4><p className="section-intro">این اقدامات برای همین ترکیب ابزار و سطح درد از backend دریافت شده‌اند.</p><ul className="action-list">{recommendation.nonMedication.map(action=><li key={action.id}><span className="action-check">✓</span><div><strong>{action.labelFa}</strong>{action.rationaleFa?<small>{action.rationaleFa}</small>:null}{action.contraindicationNoteFa?<small className="action-note">{action.contraindicationNoteFa}</small>:null}</div></li>)}</ul></div>
    </section>

    <section className="recommendation-section" aria-labelledby="medical-title"><div className="recommendation-section__icon"><StethoscopeIcon/></div><div><h4 id="medical-title">اقدام پزشکی / درمان دارویی</h4><p>{recommendation.medicalActionFa}</p>{recommendation.medication?<div className="physician-order"><AlertIcon/><div><strong>فقط طبق تجویز پزشک</strong><span>{recommendation.medication.summaryFa}</span></div></div>:<p className="quiet-note">برای این سطح، توصیه دارویی اختصاصی در منبع فعلی تعریف نشده است.</p>}</div></section>

    <section className="recommendation-section" aria-labelledby="escalation-title"><div className="recommendation-section__icon"><AlertIcon/></div><div><h4 id="escalation-title">اگر درد ادامه یافت یا شدیدتر شد</h4><p>{recommendation.escalationFa}</p></div></section>
    <section className="recommendation-section" aria-labelledby="reassess-title"><div className="recommendation-section__icon"><RefreshIcon/></div><div><h4 id="reassess-title">ارزیابی مجدد</h4><p><strong>{recommendation.reassessment.labelFa}</strong> — درد با همان ابزار دوباره ارزیابی شود و وضعیت بالینی همزمان بررسی گردد.</p></div></section>
    {needsReview?<div className="source-review-note" role="status"><AlertIcon/><span>محتوای درمانی این نسخه از متن موجود در نمونه فعلی منتقل شده و پیش از استفاده تولیدی نیازمند مرور نهایی بالینی است.</span></div>:null}
  </section>
}
