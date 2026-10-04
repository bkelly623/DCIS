import json,os
from pathlib import Path
from playwright.sync_api import sync_playwright
out=Path(os.environ.get('DCIS_EVIDENCE','/tmp/dcis-copper-evidence'));out.mkdir(parents=True,exist_ok=True)
url=os.environ.get('DCIS_URL','http://localhost:5183')
results=[]
with sync_playwright() as p:
 b=p.chromium.launch(args=['--no-sandbox','--enable-unsafe-swiftshader'])
 for w,h in [(390,844),(1440,1000)]:
  page=b.new_page(viewport={'width':w,'height':h});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(url+'/#copper');page.wait_for_selector('[data-ready=true]');page.wait_for_timeout(1200)
  assert page.locator('.cu-find img').evaluate('(x)=>x.complete&&x.naturalWidth>0')
  page.screenshot(path=str(out/f'{w}-find.png'),full_page=True)
  page.get_by_role('button',name='Not there?').click()
  page.get_by_role('button',name='Reveal the copper connection').click()
  page.get_by_role('button',name='Bring the town to life').click()
  page.get_by_role('button',name='Copper metal conductor').click()
  page.get_by_role('button',name='Close the switch',exact=True).click()
  page.wait_for_selector('[data-powered=true]');page.wait_for_timeout(1800);page.evaluate('window.scrollTo(0,0)')
  page.screenshot(path=str(out/f'{w}-powered.png'),full_page=True)
  page.get_by_role('button',name='Rubber insulating material').click()
  page.wait_for_selector('[data-powered=false]');assert 'Rubber interrupts' in page.locator('.cu-feedback').inner_text()
  page.get_by_role('button',name='Open the switch',exact=True).click()
  assert page.locator('.copper-demo').get_attribute('data-complete')=='true'
  page.reload();page.wait_for_selector('[data-ready=true]');assert page.locator('.copper-demo').get_attribute('data-complete')=='true'
  page.get_by_role('button',name='Copper metal conductor').click();page.get_by_role('button',name='Close the switch',exact=True).click();page.wait_for_timeout(1200)
  page.evaluate('window.scrollTo(0,0)');page.screenshot(path=str(out/f'{w}-complete.png'),full_page=True)
  page.get_by_role('button',name='Place in your space').click();page.wait_for_selector('.cu-device-status');assert not page.locator('.is-ar').count()
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'), 'horizontal overflow'
  page.get_by_role('button',name='Restart copper experiment').click();page.wait_for_selector('[data-stage=find]');assert page.locator('.copper-demo').get_attribute('data-complete')=='false'
  assert not errors,errors
  results.append({'viewport':[w,h],'photoLoaded':True,'copperPowerRubberBreak':True,'reload':True,'restart':True,'arFallback':True,'errors':errors})
  (out/'results.json').write_text(json.dumps(results,indent=2));page.close()
 b.close()
print(json.dumps(results))
