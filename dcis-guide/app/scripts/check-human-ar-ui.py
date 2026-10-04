from playwright.sync_api import sync_playwright
from pathlib import Path
import json, struct, os
url=os.environ.get('DCIS_URL','http://localhost:5183').rstrip('/')
out=Path(os.environ.get('DCIS_EVIDENCE','/tmp/dcis-human-ar-evidence'));out.mkdir(parents=True,exist_ok=True)
results=[]
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 for w,h in [(390,844),(1440,1000)]:
  page=b.new_page(viewport={'width':w,'height':h},reduced_motion='reduce'); errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(url+'/#lab');page.wait_for_function('document.querySelector("model-viewer")?.loaded',timeout=60000)
  page.wait_for_timeout(1500)
  page.screenshot(path=str(out/f'{w}-create-viewport.png'));page.screenshot(path=str(out/f'{w}-create-full.png'),full_page=True)
  bounds=page.evaluate('''()=>{const b=document.querySelector('.human-stage-actions button').getBoundingClientRect();const n=document.querySelector('.museum-nav').getBoundingClientRect();return {actionBottom:b.bottom,navTop:n.top,navBottom:n.bottom,height:innerHeight}}''')
  assert bounds['actionBottom']< (bounds['navTop'] if w==390 else h),bounds
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  quick=page.get_by_label('Choose a field role');box=quick.bounding_box();assert box['y']+box['height']<(bounds['navTop'] if w==390 else h)
  for role in ['archaeologist','naturalist','geologist','explorer']:
   quick.select_option(role);assert page.get_by_role('button',name=role.title(),exact=True).get_attribute('aria-pressed')=='true'
  for tone in ['light','medium','deep']:
   page.get_by_role('button',name=tone,exact=True).click()
  for hair in ['black','brown','silver']:
   page.get_by_role('button',name=hair,exact=True).click()
  page.get_by_role('button',name='Naturalist',exact=True).click();page.get_by_role('button',name='deep',exact=True).click();page.get_by_role('button',name='silver',exact=True).click()
  material=page.evaluate('document.querySelector("model-viewer").model.materials.map(m=>({name:m.name,color:m.pbrMetallicRoughness.baseColorFactor}))')
  with page.expect_download() as d:page.get_by_role('button',name='Download your GLB').click()
  d.value.save_as(str(out/f'{w}-customized.glb'))
  data=(out/f'{w}-customized.glb').read_bytes();assert data[:4]==b'glTF';g=json.loads(data[20:20+struct.unpack_from('<I',data,12)[0]])
  mats={x['name']:x['pbrMetallicRoughness']['baseColorFactor'] for x in g['materials']}
  live={x['name']:x['color'] for x in material};assert all(abs(mats['Skin'][i]-live['Skin'][i])<0.0001 for i in range(4))
  page.reload();page.wait_for_function('document.querySelector("model-viewer")?.loaded',timeout=60000);assert page.get_by_role('button',name='Naturalist',exact=True).get_attribute('aria-pressed')=='true'
  page.get_by_role('link',name='02 · View in your space').click();page.wait_for_timeout(600);page.screenshot(path=str(out/f'{w}-ar-viewport.png'));page.screenshot(path=str(out/f'{w}-ar-full.png'),full_page=True)
  assert page.locator('model-viewer').get_attribute('ar-modes')=='webxr quick-look'
  page.get_by_text('Make it look like me · photo personalization',exact=True).click();assert page.get_by_text('Not available in this prototype.',exact=True).is_visible();assert page.locator('input[type=file]').count()==0
  page.screenshot(path=str(out/f'{w}-privacy.png'),full_page=True)
  assert not errors,errors
  results.append({'viewport':[w,h],'webglLoaded':True,'firstAction':bounds,'customizationPersistence':True,'exportedMaterialMatches':True,'glbBytes':len(data),'arModes':'webxr quick-look','phoneAR':'not physically tested','errors':errors,'materials':material});page.close()
 b.close()
(out/'results.json').write_text(json.dumps(results,indent=2));print(json.dumps(results,indent=2))
