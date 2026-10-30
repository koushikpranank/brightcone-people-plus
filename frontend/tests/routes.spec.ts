import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
test('every one of the 104 supplied view functions renders for the administrator',async({page})=>{
 test.setTimeout(120000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/login');await page.getByRole('button',{name:/^HR Admin /}).click();await page.getByRole('button',{name:'Sign in',exact:true}).click();await expect(page).toHaveURL(/\/plus\/suiteDash/);
 const inventory=JSON.parse(fs.readFileSync(path.resolve('..','specification','inventory.json'),'utf8')) as {views:string[]};
 for(const view of inventory.views){const result=await page.evaluate(v=>{try{(window as unknown as {go:(v:string)=>void}).go(v);return {ok:true,text:document.getElementById('content')?.textContent}}catch(error){return {ok:false,text:String(error)}}},view);expect(result.ok,view+': '+result.text).toBe(true);expect(result.text?.length,view).toBeGreaterThan(10);await page.keyboard.press('Escape');}
 expect(errors).toEqual([]);await page.goto('/plus/suiteDash');await expect(page.locator('#content h1')).toBeVisible();await page.screenshot({path:'../output/playwright/admin-dashboard.png',fullPage:true,animations:'disabled'});
});
