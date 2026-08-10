import type { ScaleKey, SeverityKey } from './types';

export interface ScaleOption { value: number; labelFa: string; }
export interface ScaleItem { id: string; labelFa: string; helpFa?: string; options: ScaleOption[]; }
export interface ScaleDefinition { key: ScaleKey; title: string; max: number; contextFa: string; items: ScaleItem[]; }

export const SCALE_DEFINITIONS: Record<ScaleKey, ScaleDefinition> = {
  PIPP: {
    key: 'PIPP', title: 'PIPP — Premature Infant Pain Profile', max: 21,
    contextFa: 'برای درد حاد، به‌ویژه در نوزادان پره‌ترم؛ خط پایه پیش از اقدام و ارزیابی بلافاصله پس از اقدام ثبت شود.',
    items: [
      {id:'ga',labelFa:'سن حاملگی',options:[{value:0,labelFa:'۳۶ هفته یا بیشتر'},{value:1,labelFa:'۳۲ تا ۳۵ هفته و ۶ روز'},{value:2,labelFa:'۲۸ تا ۳۱ هفته و ۶ روز'},{value:3,labelFa:'کمتر از ۲۸ هفته'}]},
      {id:'behavior',labelFa:'وضعیت رفتاری',helpFa:'خط پایه (۱۵ ثانیه)',options:[{value:0,labelFa:'بیدار/فعال، چشم باز، حرکت صورت'},{value:1,labelFa:'بیدار/آرام، چشم باز، بدون حرکت صورت'},{value:2,labelFa:'خواب/فعال، چشم بسته، حرکت صورت'},{value:3,labelFa:'خواب/آرام، چشم بسته، بدون حرکت صورت'}]},
      {id:'hr',labelFa:'افزایش ضربان قلب',helpFa:'بیشترین تغییر پس از اقدام',options:[{value:0,labelFa:'۰–۴ ضربه در دقیقه'},{value:1,labelFa:'۵–۱۴ ضربه در دقیقه'},{value:2,labelFa:'۱۵–۲۴ ضربه در دقیقه'},{value:3,labelFa:'۲۵ ضربه یا بیشتر در دقیقه'}]},
      {id:'spo2',labelFa:'کاهش اشباع اکسیژن',helpFa:'کمترین اشباع پس از اقدام',options:[{value:0,labelFa:'۰–۲.۴٪ کاهش'},{value:1,labelFa:'۲.۵–۴.۹٪ کاهش'},{value:2,labelFa:'۵–۷.۴٪ کاهش'},{value:3,labelFa:'۷.۵٪ یا بیشتر کاهش'}]},
      {id:'brow',labelFa:'درهم کشیدن ابروها',options:[{value:0,labelFa:'۰–۹٪ زمان'},{value:1,labelFa:'۱۰–۳۹٪ زمان'},{value:2,labelFa:'۴۰–۶۹٪ زمان'},{value:3,labelFa:'۷۰٪ یا بیشتر از زمان'}]},
      {id:'eye',labelFa:'فشردن چشم‌ها',options:[{value:0,labelFa:'۰–۹٪ زمان'},{value:1,labelFa:'۱۰–۳۹٪ زمان'},{value:2,labelFa:'۴۰–۶۹٪ زمان'},{value:3,labelFa:'۷۰٪ یا بیشتر از زمان'}]},
      {id:'nasolabial',labelFa:'خط کنار پره‌های بینی',options:[{value:0,labelFa:'۰–۹٪ زمان'},{value:1,labelFa:'۱۰–۳۹٪ زمان'},{value:2,labelFa:'۴۰–۶۹٪ زمان'},{value:3,labelFa:'۷۰٪ یا بیشتر از زمان'}]},
    ],
  },
  NIPS: {
    key:'NIPS', title:'NIPS — Neonatal Infant Pain Scale', max:7,
    contextFa:'برای دردهای حاد ناشی از اقدامات تشخیصی/درمانی در نوزادان نارس و ترم تا شش هفته؛ قبل و بعد از اقدام دردناک استفاده شود.',
    items:[
      {id:'face',labelFa:'حالت صورت',options:[{value:0,labelFa:'حالت آرامش'},{value:1,labelFa:'عضلات صورت سفت و کشیده و اخم‌آلود'}]},
      {id:'cry',labelFa:'گریه',options:[{value:0,labelFa:'آرام، بدون گریه'},{value:1,labelFa:'ناله ملایم، گریه متناوب'},{value:2,labelFa:'جیغ/فریاد یا گریه بی‌صدا که با حرکات صورت مشخص است'}]},
      {id:'breathing',labelFa:'الگوی تنفس',options:[{value:0,labelFa:'آرام و طبیعی'},{value:1,labelFa:'نامنظم، سریع یا نگه‌داشتن تنفس'}]},
      {id:'arms',labelFa:'دست‌ها',options:[{value:0,labelFa:'شل، بدون انقباض عضلات، حرکات معمولی'},{value:1,labelFa:'انقباض دست‌ها یا حرکات سریع باز و بسته شدن'}]},
      {id:'legs',labelFa:'پاها',options:[{value:0,labelFa:'شل، بدون انقباض؛ گاهی حرکت پاها'},{value:1,labelFa:'سفتی، دشواری باز/بسته شدن، کشیدن پا یا حرکات سریع'}]},
      {id:'arousal',labelFa:'وضعیت تحریک‌پذیری',options:[{value:0,labelFa:'خواب/بیدار و آرام'},{value:1,labelFa:'تحریک‌پذیر، بی‌قرار و غلت‌زن'}]},
    ],
  },
  CRIES: {
    key:'CRIES', title:'CRIES — Postoperative Neonatal Pain', max:10,
    contextFa:'برای ارزیابی درد پس از عمل جراحی در نوزادان نارس و ترم؛ هر شاخص ۰ تا ۲ امتیاز دارد.',
    items:[
      {id:'cry',labelFa:'گریه',options:[{value:0,labelFa:'گریه نمی‌کند یا صدای گریه بلند نیست'},{value:1,labelFa:'گریه بلند؛ به راحتی ساکت می‌شود'},{value:2,labelFa:'گریه خیلی بلند؛ با آرام کردن ساکت نمی‌شود'}]},
      {id:'oxygen',labelFa:'نیاز به اکسیژن برای حفظ اشباع بالاتر از ۹۵٪',options:[{value:0,labelFa:'اکسیژن مورد نیاز نیست'},{value:1,labelFa:'کمتر از ۳۰٪ اکسیژن مورد نیاز است'},{value:2,labelFa:'بیشتر از ۳۰٪ اکسیژن مورد نیاز است'}]},
      {id:'vitals',labelFa:'علائم حیاتی (ضربان قلب / فشار خون)',options:[{value:0,labelFa:'برابر یا کمتر از قبل عمل'},{value:1,labelFa:'افزایش کمتر از ۲۰٪ نسبت به قبل عمل'},{value:2,labelFa:'افزایش بیشتر از ۲۰٪ نسبت به قبل عمل'}]},
      {id:'face',labelFa:'حالت‌های صورت',options:[{value:0,labelFa:'حالت طبیعی'},{value:1,labelFa:'شکلک درآوردن'},{value:2,labelFa:'شکلک درآوردن همراه با نالیدن'}]},
      {id:'sleep',labelFa:'بی‌خوابی',options:[{value:0,labelFa:'خواب مداوم'},{value:1,labelFa:'مرتب بیدار می‌شود و مدت زیادی بیدار است'},{value:2,labelFa:'همیشه و به‌طور مداوم بیدار است'}]},
    ],
  },
  MPAT: {
    key:'MPAT', title:'MPAT — Modified Pain Assessment Tool', max:20,
    contextFa:'ابزار چندبعدی رفتاری/فیزیولوژیک برای نوزادان بستری؛ مناسب تهویه مکانیکی یا درد مزمن.',
    items:[
      {id:'tone',labelFa:'تونیسیته',options:[{value:0,labelFa:'ریلکس، نرمال، بدون فلکسیون'},{value:1,labelFa:'اندام‌ها کاملاً باز، بدن سفت، شانه‌ها افتاده روی تخت'},{value:2,labelFa:'فلکسیون شدید، گارد اندام‌ها، مقاومت شانه/گردن به تغییر پوزیشن'}]},
      {id:'sleep',labelFa:'الگوی خواب',options:[{value:0,labelFa:'ریلکس'},{value:1,labelFa:'به راحتی بیدار می‌شود'},{value:2,labelFa:'با کوچک‌ترین محرک آژیته و وحشت‌زده می‌شود'}]},
      {id:'cry',labelFa:'گریه',options:[{value:0,labelFa:'ندارد'},{value:1,labelFa:'دارد ولی قابل کنترل است'},{value:2,labelFa:'پس از دستکاری به سادگی آرام نمی‌شود و بلند گریه می‌کند'}]},
      {id:'face',labelFa:'حالات صورت',options:[{value:0,labelFa:'ریلکس / آرام'},{value:1,labelFa:'اخمو، چین کم‌عمق یا چشم‌های نیمه‌بسته'},{value:2,labelFa:'چشم‌های محکم فشرده یا چین‌های عمیق'}]},
      {id:'skin',labelFa:'رنگ پوست',options:[{value:0,labelFa:'صورتی / پرفیوژن عالی'},{value:1,labelFa:'موتلینگ / رنگ‌پریده'},{value:2,labelFa:'خیلی رنگ‌پریده یا برافروخته / عرق کف دست'}]},
      {id:'breathing',labelFa:'تنفس',options:[{value:0,labelFa:'نرمال'},{value:1,labelFa:'تاکی‌پنه هنگام استراحت'},{value:2,labelFa:'آپنه'}]},
      {id:'heart',labelFa:'ضربان قلب',options:[{value:0,labelFa:'نرمال'},{value:1,labelFa:'تاکی‌کاردی هنگام استراحت'},{value:2,labelFa:'نوسان هنگام استراحت و دستکاری'}]},
      {id:'spo2',labelFa:'میزان اشباع اکسیژن خون شریانی',options:[{value:0,labelFa:'نرمال'},{value:1,labelFa:'کاهش اشباع گذرا'},{value:2,labelFa:'کاهش اشباع با یا بدون دستکاری'}]},
      {id:'bp',labelFa:'فشار خون',options:[{value:0,labelFa:'نرمال'},{value:1,labelFa:'نوسان با دستکاری'},{value:2,labelFa:'افزایش یا کاهش فشار هنگام استراحت'}]},
      {id:'clinical',labelFa:'تصمیم / قضاوت کادر درمان',options:[{value:0,labelFa:'درد ندارد'},{value:1,labelFa:'فقط هنگام دستکاری درد دارد'},{value:2,labelFa:'شیرخوار دچار درد است'}]},
    ],
  },
};

export const VALID_SEVERITIES: Record<ScaleKey, SeverityKey[]> = {
  PIPP: ['none','moderate','severe'],
  NIPS: ['none','mild','moderate','severe'],
  CRIES: ['none','mild','moderate','severe'],
  MPAT: ['none','observe','mild','moderate','severe'],
};
