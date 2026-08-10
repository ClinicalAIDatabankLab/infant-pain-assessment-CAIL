import type { AssessmentResult, InfantContext, ScaleKey } from '@neonatal/clinical-domain';
import { GenericScaleAssessment } from './GenericScaleAssessment';
import { PippAssessment } from './PippAssessment';
export function AssessmentRenderer(props:{scale:ScaleKey;infantContext?:InfantContext;encounterId?:string;onResult?:(result:AssessmentResult)=>void;onContinue?:(result:AssessmentResult)=>void;continueLabel?:string}){
  if(props.scale==='PIPP') return <PippAssessment {...props}/>;
  return <GenericScaleAssessment {...props} scale={props.scale}/>;
}
