import json,os,struct
from pathlib import Path
from urllib.parse import urlparse,parse_qs
from playwright.sync_api import sync_playwright
url=os.environ.get('DCIS_URL','http://localhost:5183').rstrip('/')
out=Path(os.environ.get('DCIS_EVIDENCE','/tmp/copper-native-ar'));out.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
 b=p.chromium.launch(args=['--no-sandbox','--enable-unsafe-swiftshader'])
 page=b.new_page(viewport={'width':390,'height':844},user_agent='Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36')
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(url+'/ar.html');link=page.locator('#launch').get_attribute('href');assert 'mode=ar_only' in link and 'package=com.google.ar.core' in link
 asset=parse_qs(link.split('?',1)[1].split('#Intent')[0])['file'][0];assert asset==url+'/lab/copper-connection-ar.glb'
 box=page.locator('#launch').bounding_box();assert box['y']+box['height']<844
 assert 'package=com.android.chrome' in page.locator('#chrome').get_attribute('href')
 page.screenshot(path=str(out/'390-native-launch.png'),full_page=True)
 response=page.request.get(asset);assert response.status==200
 raw=response.body();assert raw[:4]==b'glTF';doc=json.loads(raw[20:20+struct.unpack_from('<I',raw,12)[0]])
 assert doc.get('animations') and len(doc['animations'][0]['channels'])>2
 page.goto(url+'/ar.html?ar-unavailable=1');assert page.locator('#error').is_visible()
 page.goto(url+'/#copper');page.wait_for_selector('[data-ready=true]');page.get_by_role('button',name='Place in your space').click();page.wait_for_url('**/ar.html')
 # Load the actual exported GLB in the existing model-viewer runtime solely to inspect geometry and animation.
 page.goto(url+'/#lab');page.wait_for_selector('model-viewer');page.wait_for_function('document.querySelector("model-viewer").loaded')
 page.evaluate('''src=>{const old=document.querySelector('model-viewer');const m=document.createElement('model-viewer');m.style='width:100vw;height:100vh;background:#18303c';m.src=src;m.setAttribute('camera-controls','');m.setAttribute('camera-orbit','25deg 55deg auto');m.setAttribute('field-of-view','35deg');document.body.replaceChildren(m);}''',asset)
 page.wait_for_function('document.querySelector("model-viewer").loaded');names=page.evaluate('document.querySelector("model-viewer").availableAnimations');assert names
 page.evaluate('''()=>{const m=document.querySelector('model-viewer');m.animationName=m.availableAnimations[0];m.play();}''');page.wait_for_timeout(500);page.evaluate('''()=>{const m=document.querySelector('model-viewer');m.currentTime=.3;m.pause();}''');page.wait_for_timeout(800);page.screenshot(path=str(out/'ar-model-open.png'))
 page.evaluate('''()=>{const m=document.querySelector('model-viewer');m.currentTime=3;m.pause();}''');page.wait_for_timeout(800);page.screenshot(path=str(out/'ar-model-powered.png'))
 assert not errors,errors
 (out/'results.json').write_text(json.dumps({'nativeAROnlyIntent':link,'chromeHandoff':True,'fallbackVisible':True,'AndroidRoute':True,'assetBytes':len(raw),'animations':names,'errors':errors,'physicalARTested':False},indent=2));b.close()
print('PASS AR-only Android intent, Chrome handoff, fallback, actual animated GLB load. Physical placement untested.')
