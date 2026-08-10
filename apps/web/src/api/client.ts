import type { AssessmentResult, Encounter, EncounterSummary, InfantContext, RecordedIntervention, ScaleKey, ScaleDefinition } from '@neonatal/clinical-domain';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export class ApiError extends Error {
  constructor(public readonly status:number, public readonly payload:any) {
    super(payload?.messageFa ?? payload?.message ?? `API error ${status}`);
    this.name='ApiError';
  }
}

async function request<T>(path:string, init?:RequestInit):Promise<T> {
  const response = await fetch(`${API_BASE}${path}`,{
    ...init,
    headers:{'Content-Type':'application/json',...(init?.headers ?? {})},
  });
  const payload = await response.json().catch(()=>({}));
  if (!response.ok) throw new ApiError(response.status,payload);
  return payload as T;
}

export function getScales():Promise<ScaleDefinition[]> { return request('/scales'); }
export function recommendScale(context:InfantContext):Promise<{scale:ScaleKey}> { return request('/recommend-scale',{method:'POST',body:JSON.stringify(context)}); }
export function createEncounter(context:InfantContext):Promise<Encounter> { return request('/encounters',{method:'POST',body:JSON.stringify(context)}); }
export function getEncounterSummary(id:string):Promise<EncounterSummary> { return request(`/encounters/${id}/summary`); }

export function evaluateAssessment(input:{scale:ScaleKey;answers:Record<string,number>;infantContext?:InfantContext;encounterId?:string}):Promise<AssessmentResult> {
  if (input.encounterId) {
    return request(`/encounters/${input.encounterId}/assessments`,{method:'POST',body:JSON.stringify({scale:input.scale,answers:input.answers})});
  }
  return request('/assessments/evaluate',{method:'POST',body:JSON.stringify(input)});
}

export function saveInterventions(encounterId:string,interventions:Array<Pick<RecordedIntervention,'actionId'|'labelFa'|'kind'>>):Promise<{saved:number;interventions:RecordedIntervention[]}> {
  return request(`/encounters/${encounterId}/interventions`,{method:'POST',body:JSON.stringify({interventions})});
}
