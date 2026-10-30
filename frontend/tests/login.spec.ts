import {test,expect} from '@playwright/test';
import fs from 'node:fs/promises';
test('login reference markup, demo fills, password reveal, forgot, SSO and exact CSS tokens',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/login');await expect(page.getByRole('heading',{name:'Sign in',exact:true})).toBeVisible();
 await page.getByRole('button',{name:/^HR Admin /}).click();await expect(page.locator('#le')).toHaveValue('ananya.rao@brightcone.ai');await expect(page.locator('#lpw')).toHaveValue('Admin@123');
 await page.getByRole('button',{name:'Show',exact:true}).click();await expect(page.locator('#lpw')).toHaveAttribute('type','text');
 await page.getByRole('button',{name:/^Employee /}).click();await expect(page.locator('#le')).toHaveValue('rahul.varma@brightcone.ai');
 await page.getByRole('button',{name:'Forgot password?',exact:true}).click();await expect(page.getByRole('heading',{name:'Reset your password'})).toBeVisible();
 await page.getByRole('button',{name:'Back to sign in'}).click();await page.getByRole('button',{name:'Continue with Microsoft'}).click();await expect(page.getByRole('alert')).toContainText('Microsoft single sign-on isn’t connected in this prototype.');
 expect(await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--brand').trim())).toBe('#0B6FDB');
 await page.goto('/login');await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:'../output/playwright/login-desktop.png',fullPage:true,animations:'disabled'});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'../output/playwright/login-mobile.png',fullPage:true,animations:'disabled'});
 expect(errors).toEqual([]);
});
