"""Portable hunt acceptance: DCIS_URL and DCIS_EVIDENCE configure target/output."""
from playwright.sync_api import sync_playwright
from pathlib import Path
import json, os
url=os.environ.get('DCIS_URL','http://localhost:5183').rstrip('/')
out=Path(os.environ.get('DCIS_EVIDENCE','/tmp/dcis-hunt-evidence'));out.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,args=['--no-sandbox'])
 results=[]
 for width in [390,1440]:
  page=b.new_page(viewport={'width':width,'height':844 if width==390 else 1000},reduced_motion='reduce')
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(url+'/#hunt');page.wait_for_selector('.hunt-tile')
  def shot(name):
   page.screenshot(path=str(out/f'{width}-{name}.png'),full_page=True)
   page.screenshot(path=str(out/f'{width}-{name}-viewport.png'))
  shot('board');page.locator('.hunt-tile').first.click();shot('clue')
  page.locator('.hunt-answers button').nth(1).click();assert page.get_by_role('status').count();shot('wrong')
  page.get_by_role('button',name='Need a hint?',exact=True).click();shot('hint')
  page.get_by_role('button',name='One more hint',exact=True).click()
  page.reload();assert page.locator('.hunt-hint').count()==1
  page.locator('.hunt-locator').click();page.wait_for_selector('.experience-resume');page.get_by_role('link',name='← Return to your hunt').click();page.wait_for_selector('.hunt-hint')
  page.get_by_role('button',name='Show specimen photo',exact=True).click();assert page.locator('.hunt figure img').is_visible()
  page.locator('.hunt-answers button').nth(0).click();shot('answer');assert 'Solved with help' in page.locator('.hunt-success').inner_text()
  page.get_by_role('button',name='Next open clue').click()
  for i,answer in enumerate([1,2,0,1]):
   page.locator('.hunt-answers button').nth((answer+1)%3).click();assert page.get_by_role('status').count()
   page.locator('.hunt-answers button').nth(answer).click()
   assert page.locator('.hunt-success').count()==1
   if i<3:page.get_by_role('button',name='Next open clue').click()
   else:page.get_by_role('button',name='See your collection').click()
  assert '5 / 5 collected' in page.locator('.hunt-progress').inner_text();shot('ending')
  page.locator('.hunt-favorites button').first.click();assert page.get_by_role('status').count()
  page.reload();assert '5 / 5 collected' in page.locator('.hunt-progress').inner_text()
  page.get_by_role('link',name='Map & bathroom').click();page.get_by_text('Visitor bathroom',exact=False).first.wait_for(state='attached')
  page.get_by_role('link',name='← Return to your hunt').click()
  page.locator('summary').click();page.once('dialog',lambda d:d.accept());page.get_by_role('button',name='Restart hunt',exact=True).click();assert '0 / 5 collected' in page.locator('.hunt-progress').inner_text()
  page.locator('input[type=checkbox]').check();page.locator('.hunt-tile').first.click();assert page.locator('.hunt figure img').is_visible();page.locator('.hunt-answers button').first.click();assert 'Photo discovery' in page.locator('.hunt-success').inner_text()
  page.get_by_role('button',name='Next open clue').click();page.get_by_role('button',name='Can’t find it',exact=False).click();assert '1 unavailable' in page.locator('.hunt-progress').inner_text()
  page.reload();assert '1 unavailable' in page.locator('.hunt-progress').inner_text();assert page.locator('input[type=checkbox]').is_checked()
  page.locator('.hunt-tile').nth(1).click()
  for i,answer in enumerate([1,2,0,1]):
   assert page.locator('.hunt figure img').is_visible()
   page.get_by_role('button',name='Need a hint?',exact=True).click()
   page.get_by_role('button',name='One more hint',exact=True).click()
   page.locator('.hunt-answers button').nth(answer).click()
   assert 'Photo discovery' in page.locator('.hunt-success').inner_text()
   page.get_by_role('button',name='See your collection' if i==3 else 'Next open clue').click()
  assert '5 / 5 collected' in page.locator('.hunt-progress').inner_text()
  assert '0 unavailable' in page.locator('.hunt-progress').inner_text()
  assert not errors,errors
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  page.keyboard.press('Tab');assert page.evaluate('document.activeElement.tagName') in ['BUTTON','A','SUMMARY','INPUT']
  results.append({'width':width,'all_five':True,'wrong_hint_reload_map_remote_skip_replay_keyboard':True,'errors':errors});page.close()
 b.close();(out/'results.json').write_text(json.dumps(results,indent=2));print(json.dumps(results))
