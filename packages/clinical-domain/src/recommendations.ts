import type { NonMedicationAction, RecommendationSource, SeverityKey } from './types';

export const CURRENT_PROTOTYPE_SOURCE: RecommendationSource = {
  id: 'current-prototype-guideline-content',
  label: 'محتوای درمانی نسخه فعلی سامانه — نیازمند تطبیق نهایی با گایدلاین بالینی پروژه',
  reviewStatus: 'requires-clinical-review',
};

export const ENVIRONMENT_ACTIONS: NonMedicationAction[] = [
  { id:'reduce-stimulation', labelFa:'کاهش نور، صدا و دستکاری غیرضروری' },
  { id:'positioning', labelFa:'پوزیشن مناسب و حمایت وضعیت بدن نوزاد' },
];

export const SUPPORTIVE_ACTIONS: NonMedicationAction[] = [
  { id:'non-nutritive-sucking', labelFa:'مکیدن غیرمغذی' },
  { id:'breastfeeding', labelFa:'شیر مادر / شیردهی در صورت امکان بالینی' },
  { id:'sucrose', labelFa:'سوکروز در صورت نداشتن منع خوراکی و مطابق پروتکل واحد' },
  { id:'kangaroo-care', labelFa:'مراقبت آغوشی / کانگورویی در صورت امکان' },
  { id:'swaddling', labelFa:'قنداق کردن متناسب با وضعیت بالینی' },
  { id:'positioning', labelFa:'پوزیشن مناسب و حمایت وضعیت بدن' },
  { id:'reduce-stimulation', labelFa:'کاهش نور، صدا و دستکاری غیرضروری' },
];

export function severityTitleFa(severity: SeverityKey): string {
  return ({none:'بدون درد',observe:'زیر آستانه درد خفیف',mild:'درد خفیف',moderate:'درد متوسط',severe:'درد شدید'})[severity];
}
