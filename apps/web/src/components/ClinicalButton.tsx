import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowLeftIcon, CheckIcon } from './icons';

type Variant = 'primary'|'secondary'|'danger'|'ghost';
type Props = Omit<ComponentPropsWithoutRef<typeof motion.button>,'children'> & {
  children:ReactNode;
  variant?:Variant;
  loading?:boolean;
  success?:boolean;
  icon?:ReactNode;
  showArrow?:boolean;
};

export function ClinicalButton({children,variant='primary',loading=false,success=false,icon,showArrow=false,className='',disabled,...props}:Props){
  const reduced = useReducedMotion();
  const inactive = disabled || loading;
  return <motion.button
    type="button"
    {...props}
    disabled={inactive}
    aria-busy={loading || undefined}
    className={`clinical-button clinical-button--${variant} ${className}`}
    whileHover={reduced || inactive ? undefined : {scale:1.012}}
    whileTap={reduced || inactive ? undefined : {scale:.97}}
    transition={reduced ? {duration:0} : {type:'spring',stiffness:500,damping:30}}
  >
    <span className="clinical-button__content">
      <AnimatePresence mode="wait" initial={false}>
        {success ? <motion.span key="success" className="clinical-button__icon" initial={reduced?false:{opacity:0,scale:.75}} animate={{opacity:1,scale:1}} exit={{opacity:0}}><CheckIcon/></motion.span>
        : icon ? <span className="clinical-button__icon">{icon}</span> : null}
      </AnimatePresence>
      <span className="clinical-button__label">{loading ? 'در حال انجام…' : children}</span>
      {loading ? <span className="clinical-spinner" aria-hidden="true"/> : showArrow ? <motion.span className="clinical-button__arrow" animate={reduced?undefined:{x:[0,-2,0]}} transition={reduced?undefined:{duration:1.8,repeat:Infinity,repeatDelay:1.4}}><ArrowLeftIcon/></motion.span> : null}
    </span>
  </motion.button>
}
