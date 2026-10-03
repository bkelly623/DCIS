"""Run with uv run --with playwright python scripts/check-play-ui.py.
DCIS_URL selects local or public host; DCIS_EVIDENCE selects screenshot output.
"""
from playwright.sync_api import sync_playwright, expect
from pathlib import Path
import json, os
url=os.environ.get('DCIS_URL','http://localhost:5183').rstrip('/')
out=Path(os.environ.get('DCIS_EVIDENCE','/tmp/dcis-play-evidence'));out.mkdir(parents=True,exist_ok=True)
results=[]
with sync_playwright() as p:
 b=p.chromium.launch(headless=True)
 for width,height in [(390,844),(1440,1000)]:
  page=b.new_page(viewport={'width':width,'height':height},device_scale_factor=1)
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(url+'/#home');page.get_by_role('link',name='Play the discovery').click()
  expect(page.locator('.play-choices button')).to_have_count(2)
  page.evaluate('document.fonts.ready');page.wait_for_timeout(300)
  def shot(name):
   page.screenshot(path=str(out/f'{width}-{name}.png'))
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  def above_nav(locator):
   box=locator.bounding_box();nav=page.locator('.museum-nav').bounding_box()
   assert box and nav and box['y']>=0 and box['y']+box['height']<=height,(box,nav)
   assert (box['y']+box['height']<=nav['y'] or box['y']>=nav['y']+nav['height']),(box,nav)
  shot('predict')
  for button in page.locator('.play-choices button').all(): above_nav(button)
  page.get_by_role('button',name='The pale patches').click();page.wait_for_timeout(1500)
  assert 'You called it' in page.locator('.play-feedback').inner_text()
  above_nav(page.locator('.play-primary'));shot('reveal')
  page.get_by_role('button',name='Normal light',exact=True).click()
  assert page.locator('.play-photo img').get_attribute('src').endswith('-normal.webp')
  page.reload();expect(page.get_by_role('button',name='Normal light',exact=True)).to_have_attribute('aria-pressed','true')
  page.locator('.play-topline a').click();expect(page).to_have_url(url+'/#map/minerals/4')
  page.reload();page.get_by_role('link',name='Resume play',exact=False).click()
  expect(page.get_by_role('button',name='Normal light',exact=True)).to_have_attribute('aria-pressed','true')
  assert 'You called it' in page.locator('.play-feedback').inner_text()
  page.get_by_role('button',name='UV light',exact=True).click()
  assert page.locator('.play-photo img').get_attribute('src').endswith('-uv.webp')
  page.locator('.play-primary').click();page.reload();expect(page.get_by_role('button',name='Play again')).to_be_visible();shot('complete')
  page.get_by_role('link',name='Find it in Mineral Hall').click();page.get_by_role('link',name='Resume play').click()
  page.get_by_role('button',name='Play again').click();page.reload();expect(page.locator('.play-choices button')).to_have_count(2)
  page.get_by_role('button',name='The dark rock').click();assert 'not the dark rock' in page.locator('.play-feedback').inner_text()
  page.wait_for_timeout(1500);shot('alternate')
  page.get_by_role('button',name='About this discovery').click();assert 'trained docent' in page.locator('.play-help').inner_text()
  page.get_by_role('link',name='Map',exact=True).click();page.get_by_role('link',name='Play',exact=True).click()
  assert 'not the dark rock' in page.locator('.play-feedback').inner_text()
  assert not errors,errors
  results.append({'viewport':[width,height],'branches':True,'toggle':True,'reload':True,'mapReturn':True,'completion':True,'reset':True,'homeAndNav':True,'actionsAboveNav':True,'errors':errors})
  page.evaluate("localStorage.setItem('dcis-play-v1',JSON.stringify({choice:'invalid',finished:true,view:'wrong'}))")
  page.reload();expect(page.locator('.play-choices button')).to_have_count(2);page.close()
 page=b.new_page(viewport={'width':390,'height':844},reduced_motion='reduce')
 page.goto(url+'/#play');page.get_by_role('button',name='The pale patches').click();page.wait_for_timeout(1500)
 expect(page.locator('.play-photo img')).to_be_visible();page.screenshot(path=str(out/'390-reduced-motion.png'))
 b.close()
(out/'results.json').write_text(json.dumps(results,indent=2));print(json.dumps(results,indent=2))
