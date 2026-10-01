"""Exercise the emitted public app. Run: uv run --with playwright python scripts/check-public-ui.py"""
import functools
import http.server
import json
import os
from pathlib import Path
import re
import threading
from playwright.sync_api import sync_playwright

APP = Path(__file__).resolve().parents[1]
DATA = json.loads((APP / 'content/mineral-hall.public.json').read_text())
OUT = Path(os.environ.get('DCIS_UI_EVIDENCE', '/tmp/dcis-public-map-evidence'))
OUT.mkdir(parents=True, exist_ok=True)
def check_cards(page, display_id, size):
    expected = [r for r in DATA['records'] if r['displayId'] == display_id and r['type'] != 'exhibit identity']
    assert page.locator('.map-specimens article h3').all_text_contents() == [r['name'] for r in expected]
    for record in expected:
        card = page.locator(f'[data-record-id="{record["id"]}"]')
        card.scroll_into_view_if_needed()
        assert card.count() == 1
        for index, image in enumerate(record.get('images', [])):
            if len(record['images']) > 1:
                button = card.get_by_role('button', name=image.get('label', f'View {index + 1}'), exact=True)
                button.click()
                assert button.get_attribute('aria-pressed') == 'true'
            photo = card.locator('img')
            photo.scroll_into_view_if_needed()
            page.wait_for_function('(src) => [...document.images].some(i => i.getAttribute("src") === src && i.complete && i.naturalWidth > 0)', arg=image['src'])
            assert photo.get_attribute('src') == image['src']
            assert photo.get_attribute('alt') == image['alt']
            if record['id'] == 'DCIS-WR-000037':
                card.screenshot(path=str(OUT / f'scheelite-{index}-{size}.png'))
        if record.get('observationPrompt'):
            card.locator('summary').click()
            assert card.locator('details').get_attribute('open') is not None
            assert card.locator('details p').inner_text() == record['observationPrompt']
            assert card.locator('details p').is_visible()
        assert card.evaluate('(e) => e.scrollWidth <= e.clientWidth + 1 && [...e.querySelectorAll("p,h3,strong,details")].every(x => x.scrollWidth <= x.clientWidth + 1)')
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
        if record['id'] in ['DCIS-WR-000389', 'DCIS-WR-000493']:
            card.screenshot(path=str(OUT / f'{record["id"]}-{size}.png'))

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass
server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(QuietHandler, directory=str(APP / 'dist')))
threading.Thread(target=server.serve_forever, daemon=True).start()
try:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        errors = []
        for width, height, size in [(390,844,'mobile'), (1440,1000,'desktop')]:
            page = browser.new_page(viewport={'width':width,'height':height})
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.on('console', lambda msg: errors.append(msg.text) if msg.type == 'error' else None)
            page.on('requestfailed', lambda req: errors.append(f'Failed request: {req.url}'))
            page.on('response', lambda response: errors.append(f'HTTP {response.status}: {response.url}') if response.status >= 400 else None)
            page.goto(f'http://127.0.0.1:{server.server_port}', wait_until='networkidle')
            page.screenshot(path=str(OUT / f'home-{size}.png'), full_page=True)
            page.get_by_role('button', name='Map', exact=True).click()
            page.get_by_role('heading', name='First floor', exact=True).wait_for()
            assert page.locator('.public-floor-plan').is_visible()
            assert page.get_by_role('button', name='Floor 1', exact=True).count() == 0
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
            text = page.locator('.floor-map-screen').inner_text()
            assert not re.search(r'staff|office|supply|artifact room|rear bathroom|GPS|you are here', text, re.I)
            for name, heading in [('Stairs and visitor bathroom area','Stairs & bathroom'), ('Special Exhibit Room','Special Exhibit Room'), ('Front and inner entrances','Front entrance')]:
                target = page.get_by_role('button', name=name, exact=True)
                box = target.bounding_box()
                assert box['width'] >= 44 and box['height'] >= 44
                target.focus(); target.press('Space')
                assert page.locator('.floor-selection h2').inner_text() == heading
            page.evaluate('window.scrollTo(0, 0)')
            page.screenshot(path=str(OUT / f'first-floor-{size}.png'), full_page=True)
            hall = page.get_by_role('button', name='Mineral Hall — open exhibit map', exact=True)
            hall.focus(); hall.press('Enter')
            assert page.get_by_text(DATA['notice'], exact=True).count() == 1
            assert page.locator('.sketch-pin').count() == len(DATA['mapItems'])
            for item in DATA['mapItems']:
                pin = page.get_by_role('button', name=f"{item['label']}: {item['summary']}", exact=True)
                pin.focus(); pin.press('Enter')
                assert page.locator('.map-detail h2').inner_text() == item['label']
                target = page.get_by_role('button', name=f"Select {item['label']}", exact=True)
                box = target.bounding_box()
                assert box['width'] >= 44 and box['height'] >= 44
                target.click()
                if item['id'] == '4':
                    heading = page.locator('.map-detail h2').bounding_box()
                    photo = page.locator('.map-detail img').first.bounding_box()
                    assert 0 <= heading['y'] < height / 2
                    assert photo['y'] < height - 100
                    assert page.locator('.mineral-card').first.bounding_box()['width'] >= (320 if size == 'mobile' else 420)
                    page.screenshot(path=str(OUT / f'focused-case4-{size}.png'))
                check_cards(page, item['displayId'], size)
                text = page.locator('.map-detail').inner_text()
                assert not re.search(r'Telegram|Brendan|IMG-\d|/home/|Evidence|Confidence|confirmed|searchable|KB ID|reviewed_observation|issue_ids|public_approved|museum-records', text)
            page.evaluate('window.scrollTo(0, 0)')
            page.screenshot(path=str(OUT / f'mineral-detail-{size}.png'), full_page=True)
            page.get_by_role('button', name='Explore the island collection', exact=True).click()
            check_cards(page, 'MH-WORK-MINERAL-ISLAND', size)
            if size == 'desktop':
                board = page.locator('.map-board').bounding_box()
                detail = page.locator('.map-detail').bounding_box()
                assert abs(board['y'] - detail['y']) < 2, 'Detail must remain beside map, not a new grid row'
            page.evaluate('window.scrollTo(0, 0)')
            page.screenshot(path=str(OUT / f'island-{size}.png'), full_page=True)
            page.get_by_role('button', name='Whole first floor').click()
            page.get_by_role('heading', name='First floor', exact=True).wait_for()
            page.get_by_role('button', name='Back to exploring', exact=True).click()
            page.get_by_role('button', name=re.compile('Museum map')).click()
            page.get_by_role('heading', name='First floor', exact=True).wait_for()
            page.get_by_role('button', name='Back to exploring', exact=True).click()
            # Existing discovery, map detour, reward and persistence are unchanged.
            page.get_by_role('button', name=re.compile('Find my first discovery')).click()
            page.get_by_role('button', name='Different minerals might glow.').click()
            page.get_by_role('button', name='Find Case 4 on the map').click()
            assert page.locator('.map-detail h2').inner_text() == '4 Fluorescent'
            page.get_by_role('button', name='Whole first floor').click()
            page.get_by_role('button', name='Back to exploring', exact=True).click()
            page.get_by_role('heading', name=re.compile('steal the spotlight')).wait_for()
            assert 'chosen' in page.get_by_role('button', name='Different minerals might glow.').get_attribute('class')
            page.get_by_role('button', name='Different minerals might glow.').click()
            page.get_by_role('button', name=re.compile('Test my guess')).click()
            page.get_by_role('button', name=re.compile('I spotted the glow')).click()
            assert page.evaluate("localStorage.getItem('dcis-glow-discovery-v1')") == 'yes'
            page.reload()
            assert page.get_by_text('Glow Detective is in your collection.', exact=False).is_visible()
            page.get_by_role('button', name=re.compile('Make a day of it')).click()
            assert page.locator('.path-grid button').count() == 3
            page.locator('.path-grid button').first.click()
            page.get_by_role('button', name='Back to paths', exact=True).click()
            assert page.locator('.path-grid button').count() == 3
            page.locator('.path-grid button').first.click()
            page.get_by_role('button', name='Start with defaults', exact=False).click()
            title = page.locator('.stop-panel h1').inner_text()
            page.get_by_role('button', name='Map', exact=True).click()
            page.get_by_role('button', name='Continue', exact=True).click()
            assert page.locator('.stop-panel h1').inner_text() == title
            page.get_by_role('button', name='Map', exact=True).click()
            page.get_by_role('button', name='Mineral Hall — open exhibit map', exact=True).click()
            page.get_by_role('searchbox').fill('scheelite')
            page.locator('.browse-results button').click()
            assert page.locator('.map-detail h2').inner_text() == '4 Fluorescent'
            page.get_by_role('button', name='Back to map & displays', exact=True).click()
            assert page.get_by_role('searchbox').evaluate('(e) => e === document.activeElement')
            page.get_by_role('searchbox').fill('no such mineral xyz')
            assert page.get_by_text('No match in this curated selection.', exact=False).is_visible()
            page.close()
        assert not errors, errors
        browser.close()
        print(f'Public UI passed at 390 and 1440: visual map entry, public-only areas, keyboard/44px controls, {len(DATA["mapItems"])} selections and {len(DATA["records"])} records per viewport, return paths, discovery/reward persistence, 3 existing tours; no overflow or runtime errors. Screenshots: {OUT}')
finally:
    server.shutdown()
    server.server_close()
