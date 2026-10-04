import json,os
from pathlib import Path
from playwright.sync_api import sync_playwright
out=Path(os.environ.get('DCIS_EVIDENCE','/tmp/dcis-tree-world-evidence'));out.mkdir(parents=True,exist_ok=True)
url=os.environ.get('DCIS_URL','http://localhost:5183').rstrip('/')
results=[]
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,args=['--no-sandbox','--enable-unsafe-swiftshader'])
 for w,h in [(390,844),(1440,1000)]:
  page=b.new_page(viewport={'width':w,'height':h},device_scale_factor=1)
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(url+'/#world');page.wait_for_selector('.tree-canvas[data-player]');page.wait_for_timeout(800)
  def state():return json.loads(page.locator('.tree-canvas').get_attribute('data-player'))
  def hold(key,ms):
   page.keyboard.down(key);page.wait_for_timeout(ms);page.keyboard.up(key);page.wait_for_timeout(200)
  page.screenshot(path=str(out/f'{w}-initial.png'))
  initial=state();page.keyboard.down('w');page.wait_for_function("JSON.parse(document.querySelector('.tree-canvas').dataset.player).z<2.5",timeout=60000);page.keyboard.up('w');entered=state()
  # Long forward walk must stop at the instrument, rather than pass through it.
  hold('w',2500);collision=state();assert collision['z']>=1.24 and collision['z']<2.6,collision
  page.screenshot(path=str(out/f'{w}-midplay.png'))
  for i in range(3):page.get_by_role('button',name='Turn mirror +15').click();page.wait_for_timeout(200)
  assert state()['solved'],state()
  print('solved',w,state(),flush=True)
  def until(key,expression):
   page.keyboard.down(key)
   try:
    page.wait_for_function("JSON.parse(document.querySelector('.tree-canvas').dataset.player)."+expression,timeout=45000)
   except Exception:
    failure={'viewport':[w,h],'key':key,'target':expression,'state':state(),'errors':errors,'focus':page.evaluate('document.activeElement?.outerHTML')}
    (out/'failure.json').write_text(json.dumps(failure,indent=2));print(failure,flush=True);page.screenshot(path=str(out/f'{w}-failure.png'));raise
   finally:page.keyboard.up(key)
   page.wait_for_timeout(250)
  until('d','x>2.2');print('strafe',state(),flush=True);until('w','z< -4');until('a','x<1.2')
  page.wait_for_timeout(700)
  page.get_by_role('button',name='Collect lantern seed').click();page.wait_for_timeout(350)
  assert state()['won'],state()
  page.screenshot(path=str(out/f'{w}-end.png'))
  boxes=page.locator('.tree-controls button').evaluate_all('(els)=>els.map(e=>{const r=e.getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right}})')
  assert all(x['bottom']<=h and x['left']>=0 and x['right']<=w for x in boxes)
  page.get_by_role('button',name='Restart',exact=True).click();page.wait_for_timeout(250);assert not state()['won'] and state()['z']==14
  button=page.get_by_role('button',name='Walk forward',exact=True);box=button.bounding_box();page.mouse.move(box['x']+20,box['y']+20);page.mouse.down();page.wait_for_timeout(550);page.mouse.up();page.wait_for_timeout(200);assert state()['z']<14
  button=page.get_by_role('button',name='Turn right',exact=True);box=button.bounding_box();page.mouse.move(box['x']+20,box['y']+20);page.mouse.down();page.wait_for_function("JSON.parse(document.querySelector('.tree-canvas').dataset.player).yaw<-.1",timeout=45000);page.mouse.up()
  assert state()['yaw']<-.1
  page.get_by_role('link',name='Character & AR lab').click();page.wait_for_selector('model-viewer');page.wait_for_function("document.querySelector('model-viewer').loaded",timeout=45000)
  page.get_by_role('button',name='Try the UV light').click();assert 'UV ON' in page.locator('.sample-tag').inner_text()
  page.goto(url+'/');page.wait_for_timeout(500);assert page.locator('.hunt').count() or 'hunt' in page.locator('body').inner_text().lower()
  results.append({'viewport':[w,h],'initial':initial,'entered':entered,'collision':collision,'complete':True,'restart':True,'touchHold':True,'ARModelAndUV':True,'huntDefault':True,'errors':errors,'controlBoxes':boxes})
  assert not errors,errors
  (out/'results.json').write_text(json.dumps(results,indent=2))
  page.close()
 b.close()
(out/'results.json').write_text(json.dumps(results,indent=2));print(json.dumps(results,indent=2))
