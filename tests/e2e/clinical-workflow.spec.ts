import { expect,test } from '@playwright/test';

test('quick NIPS result exposes non-medication recommendations immediately',async({page})=>{
  await page.goto('/quick');
  await page.getByRole('button',{name:/NIPS/}).click();
  const groups=page.locator('.criterion-card');
  for(let i=0;i<await groups.count();i++) await groups.nth(i).locator('input[type="radio"]').last().check();
  await page.getByRole('button',{name:/محاسبه نتیجه/}).click();
  await expect(page.getByRole('heading',{name:'اقدامات غیردارویی پیشنهادی'})).toBeVisible();
  await expect(page.getByRole('heading',{name:'اقدام پزشکی / درمان دارویی'})).toBeVisible();
  await expect(page.locator('.recommendation-section--nonmed li').first()).toBeVisible();
});

test('PIPP sliders are keyboard-operable and gestational mismatch is non-blocking',async({page})=>{
  await page.goto('/quick');
  await page.getByRole('button',{name:/PIPP/}).click();
  const sliders=page.getByRole('slider');
  await expect(sliders.first()).toBeDisabled();
  await page.getByLabel(/۳۶ هفته یا بیشتر/).check();
  await page.getByLabel(/بیدار\/فعال/).check();
  await page.getByLabel('HR خط پایه').fill('140');
  await page.getByLabel('SpO₂ خط پایه').fill('98');
  await page.getByRole('button',{name:/ثبت خط پایه/}).click();
  await page.getByText('اقدام دردناک / درمانی انجام شد.').click();
  await expect(sliders.first()).toBeEnabled();
  await sliders.first().focus();
  await page.keyboard.press('ArrowRight');
  await expect(sliders.first()).toHaveAttribute('aria-valuetext',/درصد/);
});
