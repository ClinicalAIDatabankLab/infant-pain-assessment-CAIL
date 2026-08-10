import type { NonMedicationAction, RecommendationPackage, RecommendationSource, ScaleKey, SeverityKey } from '@neonatal/clinical-domain';
import { CURRENT_PROTOTYPE_SOURCE, ENVIRONMENT_ACTIONS, SUPPORTIVE_ACTIONS } from '@neonatal/clinical-domain';

const cloneActions = (actions: NonMedicationAction[]) => actions.map(action => ({...action}));
const sourceRefs = (): RecommendationSource[] => [{...CURRENT_PROTOTYPE_SOURCE}];
const observeActions: NonMedicationAction[] = [
  ...ENVIRONMENT_ACTIONS,
  {id:'swaddling',labelFa:'قنداق کردن متناسب با وضعیت بالینی'},
  {id:'kangaroo-care',labelFa:'مراقبت آغوشی / کانگورویی در صورت امکان'},
];

const none = (scale:ScaleKey): RecommendationPackage => ({
  scale,severity:'none',titleFa:'بدون درد — مراقبت معمول و پیشگیری از ناراحتی',
  nonMedication:cloneActions(ENVIRONMENT_ACTIONS),
  medicalActionFa:'در متن فعلی سامانه برای سطح «بدون درد» توصیه دارویی اختصاصی تعریف نشده است؛ دستورات جاری تیم درمان و قضاوت بالینی مقدم است.',
  escalationFa:'اگر نشانه‌های درد ظاهر شد یا امتیاز افزایش یافت، درد دوباره با ابزار مناسب ارزیابی و مسیر متناسب با سطح جدید دنبال شود.',
  reassessment:{labelFa:'هر ۴ ساعت',minMinutes:240,maxMinutes:240},sourceRefs:sourceRefs(),
});
const observe = (scale:ScaleKey): RecommendationPackage => ({
  scale,severity:'observe',titleFa:'زیر آستانه درد خفیف — پایش و اقدامات حمایتی',
  nonMedication:cloneActions(observeActions),
  medicalActionFa:'در متن فعلی سامانه برای این سطح توصیه دارویی اختصاصی تعریف نشده است؛ در صورت تغییر وضعیت، تصمیم درمانی با پزشک بازبینی شود.',
  escalationFa:'اگر درد ادامه یافت یا امتیاز به محدوده خفیف/متوسط/شدید رسید، ارزیابی تکرار و مداخله متناسب با سطح جدید انجام شود.',
  reassessment:{labelFa:'۲ تا ۴ ساعت',minMinutes:120,maxMinutes:240},sourceRefs:sourceRefs(),
});
const mild = (scale:ScaleKey): RecommendationPackage => ({
  scale,severity:'mild',titleFa:'درد خفیف — مداخله غیردارویی و پایش',
  nonMedication:cloneActions(SUPPORTIVE_ACTIONS),
  medicalActionFa:'در متن فعلی سامانه برای درد خفیف توصیه دارویی اختصاصی تعریف نشده است؛ در صورت عدم پاسخ یا تشدید درد، نظر پزشک اخذ شود.',
  escalationFa:'اگر درد باقی ماند یا به سطح متوسط/شدید رسید، ارزیابی تکرار و درمان دارویی فقط با نظر پزشک بررسی شود.',
  reassessment:{labelFa:'حدود هر ۲ ساعت',minMinutes:120,maxMinutes:120},sourceRefs:sourceRefs(),
});
const moderate = (scale:ScaleKey,titleFa='درد متوسط — درمان ترکیبی و پایش نزدیک'): RecommendationPackage => ({
  scale,severity:'moderate',titleFa,
  nonMedication:cloneActions(SUPPORTIVE_ACTIONS),
  medication:{summaryFa:'در صورت تجویز پزشک، پاراستامول ۱۰–۱۵ mg/kg مطابق متن فعلی گایدلاین می‌تواند در برنامه درمان قرار گیرد.',physicianOrderRequired:true},
  medicalActionFa:'ارزیابی بالینی نزدیک و بررسی درمان دارویی فقط طبق دستور پزشک انجام شود.',
  escalationFa:'اگر درد شدید یا رو به تشدید شد، پزشک مطلع شود و گزینه‌های ذکرشده برای درد شدید فقط طبق دستور پزشک بررسی شوند.',
  reassessment:{labelFa:'۳۰ دقیقه تا ۴ ساعت',minMinutes:30,maxMinutes:240},sourceRefs:sourceRefs(),
});
const severe = (scale:ScaleKey): RecommendationPackage => ({
  scale,severity:'severe',titleFa:'درد شدید — اقدام فوری، درمان ترکیبی و اطلاع پزشک',
  nonMedication:cloneActions(SUPPORTIVE_ACTIONS),
  medication:{summaryFa:'در درد شدید/مزمن، متن فعلی گایدلاین مورفین ۱۰ mcg/kg/hr و فنتانیل ۱–۴ mcg/kg را ذکر می‌کند؛ اجرا فقط طبق تجویز پزشک است.',physicianOrderRequired:true},
  medicalActionFa:'اقدام پزشکی و درمان دارویی فقط طبق دستور پزشک، همزمان با اقدامات غیردارویی و پایش نزدیک انجام شود.',
  escalationFa:'اگر درد کنترل نشد، ارزیابی مجدد، اطلاع پزشک و بازبینی مداخله بر اساس دستور پزشک انجام شود.',
  reassessment:{labelFa:'۳۰ دقیقه تا ۴ ساعت',minMinutes:30,maxMinutes:240},sourceRefs:sourceRefs(),
});

/**
 * Every valid scale/severity pair is intentionally listed here. Helpers only clone
 * source-supported content; lookup never falls back to severity-only content.
 */
export const RECOMMENDATION_MATRIX: Record<ScaleKey, Partial<Record<SeverityKey, RecommendationPackage>>> = {
  PIPP: {
    none: none('PIPP'),
    moderate: moderate('PIPP','درد خفیف تا متوسط — درمان ترکیبی و پایش نزدیک'),
    severe: severe('PIPP'),
  },
  NIPS: {
    none: none('NIPS'),
    mild: mild('NIPS'),
    moderate: moderate('NIPS'),
    severe: severe('NIPS'),
  },
  CRIES: {
    none: none('CRIES'),
    mild: mild('CRIES'),
    moderate: moderate('CRIES'),
    severe: severe('CRIES'),
  },
  MPAT: {
    none: none('MPAT'),
    observe: observe('MPAT'),
    mild: mild('MPAT'),
    moderate: moderate('MPAT'),
    severe: severe('MPAT'),
  },
};
