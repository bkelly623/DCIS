"""Exercise experimental panes in real Chromium/WebGL; save durable evidence."""
from playwright.sync_api import sync_playwright
from pathlib import Path
import os,json
url=os.environ.get('DCIS_URL','http://127.0.0.1:5184')
out=Path(os.environ.get('DCIS_EVIDENCE','/home/precision_focused_solutions/.hermes/profiles/dcisagent/workspace/experiments-evidence'));out.mkdir(parents=True,exist_ok=True)
results=[]
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,args=['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader'])
 for width in [390,1440]:
  page=b.new_page(viewport={'width':width,'height':844 if width==390 else 1000},reduced_motion='reduce')
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(url+'/#hunt');page.locator('.hunt-tile').first.wait_for();page.get_by_role('link',name='Experiments').click();page.locator('.pip').wait_for()
  page.get_by_role('button',name='violet',exact=True).click();page.get_by_role('button',name='Explorer cap',exact=True).click();page.get_by_role('button',name='Wide-eyed',exact=True).click()
  page.reload();page.locator('.pip').wait_for();assert page.get_by_role('button',name='violet',exact=True).get_attribute('aria-pressed')=='true';assert page.get_by_role('button',name='Explorer cap',exact=True).get_attribute('aria-pressed')=='true';assert page.get_by_role('button',name='Wide-eyed',exact=True).get_attribute('aria-pressed')=='true'
  for _ in range(4):page.get_by_role('button',name='Add a layer').click()
  assert page.locator('.lattice-layer').count()==5;assert page.get_by_role('button',name='Add a layer').is_disabled()
  page.get_by_role('button',name='Tall pattern').click();assert page.locator('.lattice-layer i').count()==10
  assert page.locator('.pip-float').evaluate('(e)=>getComputedStyle(e).animationName')=='none'
  def shot(name):
   page.evaluate('window.scrollTo(0,0)');page.wait_for_timeout(150)
   selector={'companion':'.lab-custom button','room':'.lab-controls button','ar':'model-viewer'}[name]
   bounds=page.locator(selector).first.bounding_box()
   ceiling=page.evaluate('''() => Math.min(innerHeight,...[...document.querySelectorAll('nav')].filter(e=>getComputedStyle(e).position==='fixed'&&e.getBoundingClientRect().top>innerHeight/2).map(e=>e.getBoundingClientRect().top))''')
   assert bounds and bounds['y']>=0 and bounds['y']+bounds['height']<=ceiling,(name,bounds,ceiling)
   if name=='ar':
    fallback=page.locator('.lab-art-panel .lab-fine').bounding_box();assert fallback['y']+fallback['height']<=ceiling,(fallback,ceiling)
   page.screenshot(path=str(out/f'{width}-{name}.png'),full_page=True);page.screenshot(path=str(out/f'{width}-{name}-viewport.png'))
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),name+' overflow'
  shot('companion')
  page.get_by_role('link',name='02 Turn the hall').click();page.wait_for_function("document.querySelector('model-viewer')?.loaded",timeout=60000)
  page.wait_for_function("document.querySelector('.lab-status')?.textContent.includes('3D loaded')",timeout=15000)
  page.wait_for_timeout(800);shot('room')
  # Real pointer-driven orbit, not a synthetic camera assignment.
  mv=page.locator('model-viewer');before=mv.evaluate('(e)=>e.getCameraOrbit().theta');box=mv.bounding_box();page.mouse.move(box['x']+box['width']*.6,box['y']+box['height']*.5);page.mouse.down();page.mouse.move(box['x']+box['width']*.8,box['y']+box['height']*.55,steps=12);page.mouse.up();page.wait_for_timeout(700);after=mv.evaluate('(e)=>e.getCameraOrbit().theta');assert abs(before-after)>.01
  page.locator('.lab-hotspot').first.click();assert 'Gypsum' in page.locator('.lab-object h2').inner_text()
  for i in range(3):
   page.locator('.lab-stop-list button').nth(i).click();assert page.locator('.lab-object img').evaluate('(e)=>e.complete&&e.naturalWidth>0');assert page.locator('.lab-object a').get_attribute('href')==['#map/minerals/1','#map/minerals/3','#map/minerals/18'][i]
  page.get_by_role('button',name='Whole tabletop').click();assert mv.get_attribute('camera-target')=='0m 0m 0m'
  page.get_by_role('link',name='03 Try AR').click();page.wait_for_function("document.querySelector('model-viewer')?.loaded",timeout=60000);page.wait_for_timeout(800)
  assert 'pip-violet-cap-wonder.glb' in page.locator('model-viewer').evaluate('(e)=>e.src')  # React custom elements may set properties, not reflected attributes.
  assert not page.locator('model-viewer').evaluate('(e)=>e.canActivateAR');assert '3D preview on this browser' in page.locator('.lab').inner_text()
  assert not page.get_by_role('button',name='Place Pip in your space').is_visible()
  shot('ar')
  page.get_by_role('link',name='Back to the hunt').click();page.locator('.hunt-tile').first.wait_for();assert page.locator('.hunt-tile').count()==5
  page.get_by_role('link',name='Map & bathroom').click();page.get_by_text('Visitor bathroom',exact=False).first.wait_for(state='attached');assert page.get_by_text('Visitor bathroom',exact=False).count()>0
  assert not errors,errors
  results.append({'width':width,'passed':True,'orbit_delta':after-before,'webgl_models_loaded':True,'appearance_persisted':True,'ar_capability':False,'errors':errors})
  (out/'results.json').write_text(json.dumps(results,indent=2));page.close()
 b.close()
print(json.dumps(results,indent=2))
