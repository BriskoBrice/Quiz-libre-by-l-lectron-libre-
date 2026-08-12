from pathlib import Path
from playwright.sync_api import sync_playwright
import sys

source=sys.argv[1] if len(sys.argv)>1 else str(Path(__file__).resolve().parents[1]/'dist/quiz-libre-v4-test.html')
if source.startswith('file://'):
    source=source[7:]
html=Path(source).read_text(encoding='utf-8')
# The sandbox blocks browser navigation. set_content keeps this a real Chromium DOM test;
# mock localStorage only because about:blank has no persistent origin.
mock="""<script>(function(){try{localStorage.setItem('__qlt','1');localStorage.removeItem('__qlt');}catch(e){const s={};Object.defineProperty(window,'localStorage',{value:{getItem:k=>Object.prototype.hasOwnProperty.call(s,k)?s[k]:null,setItem:(k,v)=>{s[k]=String(v)},removeItem:k=>{delete s[k]},clear:()=>{for(const k of Object.keys(s))delete s[k]}}});}})();</script>"""
html=html.replace('<body>','<body>'+mock,1)
errors=[]

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox'])

    def load(page):
        page.on('console', lambda msg: errors.append(f'console {msg.type}: {msg.text}') if msg.type=='error' else None)
        page.on('pageerror', lambda exc: errors.append(f'pageerror: {exc}'))
        page.set_content(html,wait_until='load')
        page.wait_for_function("document.documentElement.dataset.selftest === 'ok'")

    for width,height in [(360,800),(393,852)]:
        page=browser.new_page(viewport={'width':width,'height':height})
        load(page)
        overflow=page.evaluate('document.documentElement.scrollWidth > document.documentElement.clientWidth')
        assert not overflow, f'débordement horizontal à {width}px'
        assert page.locator('.cleanHero').count()==1
        assert '500 QUESTIONS' in page.locator('.cleanHeroMeta').inner_text()
        page.close()

    page=browser.new_page(viewport={'width':393,'height':852})
    load(page)
    page.select_option('#answerMode','qcm')
    page.select_option('#count','5')
    page.click('#startBtn')
    for _ in range(5):
        page.locator('#answers .answer').first.click()
        page.wait_for_selector('#feedback:not(.hidden)')
        page.click('#nextBtn')
    page.wait_for_selector('#resultScreen:not(.hidden)')

    page.click('#backBtn')
    page.select_option('#answerMode','free')
    page.select_option('#count','5')
    page.click('#startBtn')
    page.fill('#freeAnswerInput','réponse de test volontairement fausse')
    page.click('#freeAnswerBtn')
    page.wait_for_selector('#feedback:not(.hidden)')
    assert page.locator('#nextBtn').is_visible()

    page.click('#homeBtn')
    page.select_option('#answerMode','mixed')
    page.select_option('#count','10')
    page.click('#startBtn')
    seen=set()
    for _ in range(10):
        kind=page.locator('#answerTypeBadge').text_content().strip()
        seen.add(kind)
        if kind=='Réponse libre':
            page.fill('#freeAnswerInput','x')
            page.click('#freeAnswerBtn')
        else:
            page.locator('#answers .answer').first.click()
        page.wait_for_selector('#feedback:not(.hidden)')
        page.click('#nextBtn')
    assert seen=={'QCM','Réponse libre'},f'mixte incomplet: {seen}'
    page.wait_for_selector('#resultScreen:not(.hidden)')
    page.close()
    browser.close()

assert not errors, '\n'.join(errors)
print('PASS browser-v4: selftest ok, 360/393 sans overflow, QCM/libre/mixte fonctionnels')
