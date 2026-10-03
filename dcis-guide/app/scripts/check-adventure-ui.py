from playwright.sync_api import sync_playwright
from pathlib import Path
import json, os
out=Path(os.environ.get('ADVENTURE_EVIDENCE','/tmp/dcis-adventure')); out.mkdir(parents=True,exist_ok=True)
width=int(os.environ.get('ADVENTURE_WIDTH','390'))
url=os.environ.get('DCIS_URL','http://localhost:5183').rstrip('/')
with sync_playwright() as p:
 b=p.chromium.launch(headless=True)
 page=b.new_page(viewport={'width':width,'height':844},device_scale_factor=1)
 errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 def shot(name):
  page.evaluate('window.scrollTo(0,0)');page.screenshot(path=str(out/(name+'.png')),full_page=True)
  page.screenshot(path=str(out/(name+'-viewport.png')),full_page=False)
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),name
 page.goto(url+'/#experiences');page.get_by_role('link',name='Try the three-stop adventure').click()
 start=page.get_by_role('button',name='Try from home'); box=start.bounding_box(); assert width!=390 or (box and box['y']+box['height']<780), 'mode action below fold'
 start.click();shot('01-world')
 if width==390:
  box=page.get_by_role('button',name='Enter the adventure').bounding_box(); assert box and box['y']+box['height']<780, 'start action below fold'
 page.get_by_role('button',name='Enter the adventure').click();shot('02-pattern')
 page.get_by_role('button',name='Longer light & dark zones').click()
 page.get_by_role('link',name='Find this display').click();page.reload()
 page.get_by_role('link',name='Resume adventure').click()
 assert page.get_by_role('button',name='Longer light & dark zones').get_attribute('aria-pressed')=='true'
 page.get_by_role('button',name='Add this discovery').click();shot('03-world-grown')
 page.get_by_role('button',name='Continue the trail').click();shot('04-garden')
 page.get_by_role('button',name='Where crystal meets host').click()
 page.get_by_role('button',name='Add this discovery').click()
 page.get_by_role('button',name='Continue the trail').click();shot('05-grotto')
 page.get_by_role('button',name='The pink mass',exact=True).click()
 page.get_by_role('button',name='Turn over the story').click();shot('06-reveal')
 page.reload();assert page.get_by_text('Crystals can hide in plain sight.',exact=True).is_visible()
 page.get_by_role('button',name='See the world you made').click();shot('07-ending')
 assert page.get_by_text('long flowing zones',exact=False).is_visible()
 page.reload();assert page.get_by_role('button',name='Play again').is_visible()
 page.get_by_role('button',name='Play again').click()
 page.get_by_role('button',name='I’m at the museum').click()
 page.get_by_role('button',name='Enter the adventure').click()
 assert page.get_by_role('button',name='Use recorded photos instead').is_visible()
 page.get_by_role('button',name='Use recorded photos instead').click()
 assert page.locator('.adv-photos img').count()==2
 page.get_by_role('button',name='I’m not sure').click()
 page.get_by_role('button',name='Add this discovery').click()
 page.goto(url+'/#map');shot('08-map')
 page.goto(url+'/#experiences');shot('09-home')
 assert not errors,errors
 print(json.dumps({'errors':errors,'width':width,'pass':['three encounters','map detour + reload','prediction + reveal persistence','personalized ending','completion reload','replay','onsite photo fallback','not sure continuation','page overflow'],'screenshots':len(list(out.glob('*.png')))},indent=2))
 b.close()
