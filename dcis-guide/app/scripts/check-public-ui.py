"""Smoke-test the emitted public app, without external services or KB inputs.
Run: uv run --with playwright python scripts/check-public-ui.py
"""
import functools
import http.server
import json
from pathlib import Path
import re
import threading
from playwright.sync_api import sync_playwright

APP = Path(__file__).resolve().parents[1]
DATA = json.loads((APP / 'content/mineral-hall.public.json').read_text())

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass

server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(QuietHandler, directory=str(APP / 'dist')))
thread = threading.Thread(target=server.serve_forever, daemon=True)
thread.start()
try:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 390, 'height': 844})
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(f'http://127.0.0.1:{server.server_port}', wait_until='networkidle')
        page.get_by_role('button', name=re.compile('Find your way')).click()
        page.get_by_role('button', name=re.compile('Mineral Hall')).click()
        page.get_by_text(DATA['notice'], exact=True).wait_for()
        pins = page.locator('.sketch-pin')
        assert pins.count() == len(DATA['mapItems'])
        for item in DATA['mapItems']:
            pin = page.get_by_role('button', name=f"{item['label']}: {item['summary']}", exact=True)
            # Keyboard selection exercises map lookup without relying on tiny touch targets.
            pin.focus()
            pin.press('Enter')
            assert page.locator('.map-detail h2').inner_text() == item['label']
            actual = page.locator('.map-specimens article h3').all_text_contents()
            expected = [r['name'] for r in DATA['records'] if r['displayId'] == item['displayId']]
            assert actual == expected, (item['id'], actual, expected)
            text = page.locator('.map-detail').inner_text()
            assert not re.search(r'Telegram|Brendan|IMG-\d|/home/|Evidence|Confidence|confirmed|searchable|KB ID', text)
            if item['id'] == '3':
                assert text.count('Identification is tentative') == 6
        page.get_by_role('button', name='Back to visitor app').click()
        assert not errors, errors
        browser.close()
        print(f"Public UI passed: {len(DATA['mapItems'])} map selections, {len(DATA['records'])} display-linked records, tentative notices, back navigation; no runtime errors")
finally:
    server.shutdown()
    server.server_close()
