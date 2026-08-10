const STEPS=['زمینه بالینی','ارزیابی درد','مداخله','ارزیابی مجدد','ثبت و گزارش'];
export function WorkflowStepper({current,maxReached,onStep}:{current:number;maxReached:number;onStep:(step:number)=>void}){
  return <nav className="workflow-stepper" aria-label="مراحل مسیر بالینی">{STEPS.map((label,index)=>{const step=index+1;const available=step<=maxReached;const active=step===current;return <button key={label} type="button" className={`workflow-step ${active?'is-current':''} ${step<maxReached?'is-complete':''}`} disabled={!available} aria-current={active?'step':undefined} onClick={()=>available&&onStep(step)}><span className="workflow-step__num">{step<current?'✓':step}</span><span>{label}</span></button>})}</nav>
}
