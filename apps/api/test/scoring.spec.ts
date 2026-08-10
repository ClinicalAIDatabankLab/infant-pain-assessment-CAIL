import { describe,expect,it } from 'vitest';
import { ScoringService } from '../src/clinical/scoring.service';
const scoring=new ScoringService();
describe('ScoringService boundaries',()=>{
  it.each([[9,0],[10,1],[39,1],[40,2],[69,2],[70,3]])('maps PIPP facial percentage %s to %s',(value,expected)=>expect(scoring.pippPercentScore(value)).toBe(expected));
  it('rounds SpO₂ delta to the documented tenth precision',()=>expect(scoring.pippSpo2Score(98,95.6)).toBe(0));
  it('keeps PIPP gestational mismatch non-blocking',()=>expect(scoring.pippGestationalMismatch(30,0)[0]).toMatchObject({code:'PIPP_GESTATIONAL_AGE_MISMATCH',blocking:false}));
  it.each([['PIPP',6,'none'],['PIPP',7,'moderate'],['PIPP',13,'severe'],['NIPS',2,'mild'],['NIPS',3,'moderate'],['NIPS',6,'severe'],['CRIES',3,'mild'],['CRIES',4,'moderate'],['CRIES',7,'severe'],['MPAT',3,'observe'],['MPAT',4,'mild'],['MPAT',7,'moderate'],['MPAT',13,'severe']] as const)('%s score %s => %s',(scale,score,severity)=>expect(scoring.classifyScore(scale,score).severity).toBe(severity));
});
