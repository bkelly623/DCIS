import json, os
from pathlib import Path
from playwright.sync_api import sync_playwright
base=Path(__file__).resolve().parents[1]
url=os.environ.get('DCIS_URL','http://127.0.0.1:5183').rstrip('/')
g=json.loads((base/'content/experiences/guide.json').read_text()); m=json.loads((base/'content/experiences/mystery.json').read_text())
out=Path(os.environ.get('EXPERIENCE_QA_DIR','/home/precision_focused_solutions/.hermes/profiles/dcisagent/workspace/experience-ui'));out.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True)
 results=[]
 for width in [390,1440]:
  page=browser.new_page(viewport={'width':width,'height':900});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  def visit(route):
   page.goto(url+'/#'+route);page.wait_for_timeout(90)
  def check():
   assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'overflow'
   for img in page.locator('.experience img,.experience-home img').all():
    assert img.evaluate('(i)=>i.complete&&i.naturalWidth>0')
  visit('home');check();page.screenshot(path=str(out/f'home-{width}.png'),full_page=True)
  for s in g['stops']:
   visit('guide/'+s['id']);page.get_by_role('heading',name=s['title'],exact=True).wait_for();check()
   for label in ['Find this specimen','The specimen’s story','The wider hall story',s['deeper']['label'],s['notFound']['label'],'Visiting safely']:
    page.get_by_text(label,exact=True).click()
   assert page.get_by_text(s['objectStory'],exact=True).is_visible()
   page.get_by_role('button',name='Map',exact=True).click();page.reload();page.get_by_role('link',name='← Resume guide / mystery').click();page.get_by_role('heading',name=s['title'],exact=True).wait_for()
   page.get_by_role('link',name='Skip this stop',exact=True).click()
   assert page.url.endswith('/'+s['nextStopId'])
  page.get_by_role('heading',name=g['finish']['title'],exact=True).wait_for();page.get_by_role('link',name='Try Hidden Appearance',exact=True).click()
  count=0
  for node in m['nodes']:
   for choice in node.get('choices',[]):
    visit('mystery/'+node['id']);page.get_by_role('button',name=choice['label'],exact=True).click()
    response=page.get_by_text(choice['response'],exact=True);assert response.is_visible();assert page.url.endswith('/'+node['id'])
    page.reload();assert page.get_by_text(choice['response'],exact=True).is_visible()
    page.get_by_role('button',name='Map',exact=True).click();page.reload();page.get_by_role('link',name='← Resume guide / mystery').click();page.get_by_text(choice['response'],exact=True).wait_for()
    page.get_by_role('button',name='Continue →',exact=True).click();assert page.url.endswith('/'+choice['next']);check();count+=1
  visit('mystery/reveal');page.get_by_role('button',name='UV light',exact=True).click();assert page.locator('.experience-photo img').get_attribute('src').endswith('-uv.webp');page.screenshot(path=str(out/f'reveal-{width}.png'),full_page=True)
  page.get_by_role('button',name='Normal light',exact=True).click();assert page.locator('.experience-photo img').get_attribute('src').endswith('-normal.webp')
  page.get_by_role('button',name='Restart mystery',exact=True).click();assert page.url.endswith('/find');assert not page.locator('.experience-response').count()
  visit('mystery/explain');page.get_by_text('Why scheelite?',exact=True).click();assert page.get_by_text(m['nodes'][4]['deeper']['text'],exact=True).is_visible();page.get_by_role('link',name='Take this way of looking with you →',exact=True).click();assert page.url.endswith('/takeaway')
  for a in m['nodes'][-1]['actions']:
   visit('mystery/takeaway');page.get_by_role('link',name=a['label']+' →',exact=True).click();assert page.url.endswith('/'+a.get('nodeId',a.get('stopId')))
  visit('guide/local');page.get_by_role('button',name='Restart guide',exact=True).click();assert page.url.endswith('/smith');page.get_by_role('link',name='Next stop →',exact=True).click();page.go_back();assert page.url.endswith('/smith')
  page.screenshot(path=str(out/f'guide-{width}.png'),full_page=True)
  page.evaluate("localStorage.setItem('dcis-experiences-v1',JSON.stringify({guide:'bad',mystery:'__proto__',answers:[],light:'x'}))");visit('home');page.get_by_role('link',name='Choose a guide stop',exact=True).click();page.get_by_role('link',name='Resume guide',exact=True).click();assert page.url.endswith('/smith')
  assert not errors,errors
  results.append({'width':width,'guideStops':len(g['stops']),'choiceResponses':count,'errors':errors,'checks':'finish, reset, map detour/reload, all continuation actions, toggle, browser back, malformed storage, no overflow, images loaded'})
  page.close()
 # blocked storage remains usable
 context=browser.new_context();context.add_init_script("Object.defineProperty(Storage.prototype,'setItem',{value(){throw new Error('blocked')}});Object.defineProperty(Storage.prototype,'getItem',{value(){throw new Error('blocked')}})")
 page=context.new_page();page.goto(url+'/#mystery/find');page.get_by_role('button',name='I think I have it',exact=True).click();page.get_by_role('button',name='Continue →',exact=True).click();assert page.url.endswith('/observe')
 (out/'results.json').write_text(json.dumps(results,indent=2));print(json.dumps(results,indent=2));print('Blocked storage: passed');browser.close()
