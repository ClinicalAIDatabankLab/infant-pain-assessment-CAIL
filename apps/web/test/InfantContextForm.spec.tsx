import { render,screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe,expect,it,vi } from 'vitest';
import { EMPTY_CONTEXT,InfantContextForm } from '../src/features/infant-context/InfantContextForm';

describe('InfantContextForm',()=>{
  it('renders two compact semantic sections without optional copy',()=>{
    const {container}=render(<InfantContextForm value={EMPTY_CONTEXT} onChange={vi.fn()} onSubmit={vi.fn()}/>);

    expect(screen.getByRole('heading',{name:'اطلاعات نوزاد'})).toBeVisible();
    expect(screen.getByRole('heading',{name:'وضعیت و هدف ارزیابی'})).toBeVisible();
    expect(screen.queryByText(/اختیاری/)).toBeNull();
    expect(screen.getByRole('group',{name:'جنسیت'})).toBeVisible();
    expect(screen.getByRole('group',{name:'وضعیت بالینی'})).toBeVisible();
    expect(screen.getByRole('group',{name:'نوع ارزیابی'})).toBeVisible();
    expect(container.querySelectorAll('.context-section')).toHaveLength(2);
    expect(container.querySelector('.infant-details-grid')).toBeInTheDocument();
    expect(container.querySelector('.clinical-choice-grid')).toBeInTheDocument();
  });

  it('labels the recommended scale and keeps every scale selectable',async()=>{
    const onChooseScale=vi.fn();
    const {container}=render(<InfantContextForm value={EMPTY_CONTEXT} onChange={vi.fn()} onSubmit={vi.fn()} recommended="NIPS" onChooseScale={onChooseScale}/>);

    expect(screen.getByText('پیشنهادشده')).toBeVisible();
    for(const scale of ['PIPP','NIPS','CRIES','MPAT']) expect(screen.getByRole('button',{name:new RegExp(scale)})).toBeVisible();
    expect(container.querySelector('.scale-choice-grid')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button',{name:/NIPS/}));
    expect(onChooseScale).toHaveBeenCalledWith('NIPS');
  });
});
