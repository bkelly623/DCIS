from playwright.sync_api import sync_playwright
from pathlib import Path
import json,struct,os
url=os.environ.get('DCIS_URL','http://localhost:5183').rstrip('/')
out=Path(os.environ.get('DCIS_EVIDENCE','/tmp/dcis-character-rebuild-evidence'));out.mkdir(parents=True,exist_ok=True)
results=[]
with sync_playwright() as p:
 b=p.chromium.launch(args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 for w,h in [(390,844),(1440,1000)]:
  c=b.new_context(viewport={'width':w,'height':h},record_video_dir=str(out/'video'),record_video_size={'width':w,'height':h});page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(url+'/#lab');page.wait_for_function('document.querySelector("model-viewer")?.loaded');page.wait_for_timeout(1200);page.screenshot(path=str(out/f'{w}-first.png'))
  for body in ['Man','Woman']:
   page.get_by_role('button',name=body,exact=True).click();page.wait_for_function('document.querySelector("model-viewer")?.loaded');page.wait_for_timeout(400)
   for kit in ['Field helmet','Trail pack']:
    page.get_by_role('button',name=kit,exact=True).click();page.wait_for_function('document.querySelector("model-viewer")?.loaded');page.wait_for_timeout(2000);page.evaluate('scrollTo(0,0)')
    page.screenshot(path=str(out/f'{w}-{body}-{kit.replace(" ","-")}.png'))
  page.get_by_role('button',name='Say hello',exact=True).click();page.wait_for_timeout(450);page.screenshot(path=str(out/f'{w}-wave-frame.png'));page.wait_for_timeout(1500);page.get_by_role('button',name='Try the UV light',exact=True).click();page.wait_for_timeout(500);assert page.evaluate('document.querySelector("model-viewer").animationName')=='Idle';page.screenshot(path=str(out/f'{w}-gesture.png'));page.wait_for_timeout(1600);assert page.get_by_role('button',name='Switch UV off',exact=True).is_enabled();page.screenshot(path=str(out/f'{w}-uv.png'))
  page.get_by_role('button',name='deep',exact=True).click();page.reload();page.wait_for_function('document.querySelector("model-viewer")?.loaded');page.wait_for_timeout(500);assert page.get_by_role('button',name='deep',exact=True).get_attribute('aria-pressed')=='true';assert page.get_by_role('button',name='Switch UV off',exact=True).is_visible()
  page.get_by_text('Export & prototype boundaries',exact=True).click()
  with page.expect_download() as d:page.get_by_role('button',name='Download your GLB').click()
  dest=out/f'{w}-export.glb';d.value.save_as(str(dest));data=dest.read_bytes();g=json.loads(data[20:20+struct.unpack_from('<I',data,12)[0]]);assert any(n.get('name')=='Illustrative_fluorescence_sample' for n in g['nodes']);assert any(n.get('name')=='Lamp_housing' for n in g['nodes']);assert next(m for m in g['materials'] if m.get('name')=='Lamp lens')['emissiveFactor'][2]>.5;assert next(m for m in g['materials'] if m.get('name')=='UV beam')['pbrMetallicRoughness']['baseColorFactor'][3]>0;assert any('Adventurer' in n.get('name','') for n in g['nodes']);assert next(m for m in g['materials'] if m.get('name')=='Specimen')['emissiveFactor'][1]>.5
  page.get_by_role('button',name='Bring this partner',exact=False).click();assert page.locator('model-viewer').get_attribute('ar-modes')=='webxr quick-look';page.evaluate('scrollTo(0,0)');page.wait_for_timeout(300)
  bounds=page.evaluate('''()=>({action:document.querySelector('.human-stage-actions').getBoundingClientRect().bottom,nav:document.querySelector('.museum-nav').getBoundingClientRect().top,overflow:document.documentElement.scrollWidth>innerWidth})''');assert not bounds['overflow'];assert bounds['action']<(bounds['nav'] if w==390 else h),bounds
  page.screenshot(path=str(out/f'{w}-after.png'));assert not errors,errors;results.append({'width':w,'bounds':bounds,'errors':errors,'exportBytes':len(data),'all4Models':True,'interaction':True,'persistence':True});c.close()
 b.close()
(out/'results.json').write_text(json.dumps(results,indent=2));print(results)
