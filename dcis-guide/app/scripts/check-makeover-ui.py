"""Additive acceptance for the editorial redesign; existing suites unchanged."""
import asyncio,json,os
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=Path(os.environ.get('DCIS_EVIDENCE','/tmp/dcis-total-makeover'))
async def main():
 OUT.mkdir(parents=True,exist_ok=True)
 mystery=json.loads((ROOT/'content/experiences/mystery.json').read_text())
 results=[]
 async with async_playwright() as p:
  browser=await p.chromium.launch(args=['--no-sandbox'])
  for width in [390,1440]:
   page=await browser.new_page(viewport={'width':width,'height':900},reduced_motion='reduce')
   errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   async def visit(route):
    await page.goto('http://localhost:5183/#'+route)
    await page.wait_for_timeout(100)
    assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth'),route
   for name,route in [('home','home'),('map','map'),('guide','guide/smith'),('reveal','mystery/reveal'),('browse','browse')]:
    await visit(route)
    if name=='browse':
     assert await page.locator('.collection-tile').count()==28
     await page.get_by_label('Search the collection').fill('scheelite')
     assert await page.locator('.collection-tile').count()==1
     await page.get_by_label('Search the collection').fill('')
     await page.get_by_label('Category',exact=True).select_option('Two lighting views')
     assert await page.locator('.collection-tile').count()==1
     await page.get_by_label('Category',exact=True).select_option('')
     await page.get_by_label('Display',exact=True).select_option('MH-DISP-012')
     assert await page.locator('.collection-tile').count()==2
     await page.locator('.collection-tile').first.click()
     photo=page.locator('.collection-focus .photo-open').first
     await photo.wait_for()
     box=await photo.bounding_box()
     assert box and box['y']<900,'selected photograph offscreen'
     await page.screenshot(path=str(OUT/f'focused-collection-{width}.png'))
     await page.get_by_role('button',name='Find on map →',exact=True).click()
     assert page.url.endswith('#map/minerals/12')
     assert await page.locator('.map-detail h2').inner_text()=='12 Ground'
     await page.get_by_role('navigation',name='Museum navigation').get_by_role('link',name='Collection',exact=True).click()
     await page.get_by_label('Search the collection').fill('no such mineral xyz')
     assert await page.locator('.collection-tile').count()==0
     await page.get_by_role('button',name='Show the whole selection').click()
     assert await page.locator('.collection-tile').count()==28
    if name=='reveal':await page.get_by_role('button',name='UV light',exact=True).click()
    await page.evaluate('window.scrollTo(0,0)')
    await page.screenshot(path=str(OUT/f'accepted-{name}-{width}.png'),full_page=True)
    await page.screenshot(path=str(OUT/f'viewport-{name}-{width}.png'))
   await visit('guide/smith')
   await page.get_by_text('I’ve looked — tell me the story',exact=True).click()
   assert await page.locator('details[open]').count()==1
   await page.locator('.photo-open').first.click()
   assert await page.locator('dialog[open]').count()==1
   assert await page.get_by_role('dialog').get_attribute('aria-label')
   await page.keyboard.press('Tab')
   assert await page.evaluate('!!document.activeElement.closest("dialog")'), 'modal focus escaped into navigation'
   await page.screenshot(path=str(OUT/f'focused-photo-{width}.png'))
   await page.keyboard.press('Escape')
   assert await page.locator('dialog[open]').count()==0
   assert await page.locator('.photo-open').first.evaluate('(e)=>e===document.activeElement'), 'photo opener did not regain focus'
   choices=0
   for node in mystery['nodes']:
    for choice in node.get('choices',[]):
     await visit('mystery/'+node['id'])
     await page.get_by_role('button',name=choice['label'],exact=True).click()
     assert await page.locator('.experience-response').inner_text()==choice['response']+'\n\nContinue →'
     await page.locator('.experience-response button').click()
     await page.wait_for_timeout(60)
     assert page.url.endswith('#mystery/'+choice['next'])
     choices+=1
   assert choices==15
   assert not errors,errors
   results.append({'width':width,'choiceResponses':choices,'overflow':False,'photoDialogAndEscape':True,'progressiveStory':True,'selectedPhotoInViewport':True,'runtimeErrors':errors})
   await page.close()
  await browser.close()
 (OUT/'acceptance.json').write_text(json.dumps(results,indent=2))
 print(json.dumps(results,indent=2))
asyncio.run(main())
