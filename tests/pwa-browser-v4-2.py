from playwright.sync_api import sync_playwright

URL = 'http://127.0.0.1:8765/'


def run():
    errors = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 360, 'height': 800})
        page = context.new_page()
        page.on('console', lambda msg: errors.append(msg.text) if msg.type == 'error' else None)
        page.on('pageerror', lambda exc: errors.append(str(exc)))

        page.goto(URL, wait_until='networkidle')
        page.wait_for_function("document.documentElement.dataset.selftest === 'ok'")
        page.wait_for_function('navigator.serviceWorker && navigator.serviceWorker.ready')
        page.reload(wait_until='networkidle')
        page.wait_for_function('navigator.serviceWorker.controller !== null')
        assert page.evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth')

        context.set_offline(True)
        page.reload(wait_until='domcontentloaded')
        page.wait_for_function("document.documentElement.dataset.selftest === 'ok'")

        page.select_option('#count', '5')
        page.select_option('#answerMode', 'qcm')
        page.click('#startBtn')
        for _ in range(5):
            page.wait_for_selector('#answers .answer')
            page.locator('#answers .answer').first.click()
            page.wait_for_selector('#nextBtn:not(.hidden)')
            page.click('#nextBtn')
        page.wait_for_selector('#resultScreen:not(.hidden)')

        page.set_viewport_size({'width': 393, 'height': 850})
        assert page.evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth')
        assert not errors, errors
        browser.close()


if __name__ == '__main__':
    run()
    print('OK: online install, offline reload and QCM run')
