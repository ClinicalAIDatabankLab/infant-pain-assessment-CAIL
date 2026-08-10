import { NavLink, Route, Routes } from 'react-router-dom';
import { PrototypeBanner } from './components/PrototypeBanner';
import { ClinicalWorkflowPage } from './pages/ClinicalWorkflowPage';
import { GuidePage } from './pages/GuidePage';
import { ProceduresPage } from './pages/ProceduresPage';
import { QuickAssessmentPage } from './pages/QuickAssessmentPage';

export default function App(){return <div className="app-root"><a className="skip-link" href="#main-content">رفتن به محتوای اصلی</a><header className="app-header"><div className="brand"><span className="brand-mark" aria-hidden="true">NP</span><div><strong>Neonatal Pain CDSS</strong><small>سامانه تصمیم‌یار درد نوزاد</small></div></div><nav className="top-nav" aria-label="ناوبری اصلی"><NavLink to="/" end>مسیر بالینی</NavLink><NavLink to="/quick">ارزیابی سریع</NavLink><NavLink to="/procedures">رویه‌ها</NavLink><NavLink to="/guide">راهنما</NavLink></nav></header><PrototypeBanner/><div id="main-content"><Routes><Route path="/" element={<ClinicalWorkflowPage/>}/><Route path="/quick" element={<QuickAssessmentPage/>}/><Route path="/procedures" element={<ProceduresPage/>}/><Route path="/guide" element={<GuidePage/>}/></Routes></div><footer className="app-footer"><span>Prototype · React + NestJS · In-memory repository</span><span>تصمیم نهایی بالینی بر عهده تیم درمان است.</span></footer></div>}
