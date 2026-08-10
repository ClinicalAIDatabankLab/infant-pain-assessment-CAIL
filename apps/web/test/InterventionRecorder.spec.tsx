import { render,screen,waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NON_MEDICATION_ACTION_CATALOG,type AssessmentResult,type RecordedIntervention } from '@neonatal/clinical-domain';
import { beforeEach,describe,expect,it,vi } from 'vitest';
import { saveInterventions } from '../src/api/client';
import { InterventionRecorder } from '../src/features/intervention/InterventionRecorder';

vi.mock('../src/api/client',()=>({saveInterventions:vi.fn()}));

const result={
  id:'assessment-1',encounterId:'encounter-1',scale:'NIPS',score:0,severity:'none',severityLabelFa:'بدون درد',completedCriteria:6,totalCriteria:6,measurements:{},warnings:[],createdAt:new Date().toISOString(),
  recommendation:{
    scale:'NIPS',severity:'none',titleFa:'بدون درد',
    nonMedication:[
      {id:'reduce-stimulation',labelFa:'کاهش نور، صدا و دستکاری غیرضروری'},
      {id:'positioning',labelFa:'پوزیشن مناسب و حمایت وضعیت بدن نوزاد'},
    ],
    medicalActionFa:'مراقبت معمول',escalationFa:'در صورت تغییر وضعیت ارزیابی تکرار شود.',reassessment:{labelFa:'هر ۴ ساعت'},
    sourceRefs:[{id:'source',label:'source',reviewStatus:'source-transcribed'}],
  },
} satisfies AssessmentResult;

describe('InterventionRecorder',()=>{
  beforeEach(()=>vi.clearAllMocks());

  it('keeps the full catalog selectable and labels only recommended actions',async()=>{
    const recordedSucrose:RecordedIntervention={id:'recorded-1',actionId:'sucrose',labelFa:'سوکروز در صورت نداشتن منع خوراکی و مطابق پروتکل واحد',kind:'non-medication',performedAt:new Date().toISOString()};
    vi.mocked(saveInterventions).mockResolvedValue({saved:1,interventions:[recordedSucrose]});
    const onSaved=vi.fn();
    render(<InterventionRecorder encounterId="encounter-1" result={result} onSaved={onSaved}/>);

    expect(screen.getAllByRole('checkbox')).toHaveLength(NON_MEDICATION_ACTION_CATALOG.length);
    expect(screen.getAllByText('پیشنهادشده')).toHaveLength(2);
    await userEvent.click(screen.getByRole('checkbox',{name:/سوکروز/}));
    await userEvent.click(screen.getByRole('button',{name:/ثبت مداخلات و ادامه/}));

    await waitFor(()=>expect(saveInterventions).toHaveBeenCalledWith('encounter-1',[
      expect.objectContaining({actionId:'sucrose',kind:'non-medication'}),
    ]));
    expect(onSaved).toHaveBeenCalledWith([recordedSucrose]);
  });
});
