const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    console.log(`CONSOLE [${msg.type()}]:`, msg.text());
  });
  
  // Enable error logging
  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
  });
  
  // Enable request logging
  page.on('requestfailed', request => {
    console.log('REQUEST FAILED:', request.url());
  });
  
  console.log('=== Navigating to http://localhost:8083/ ===');
  await page.goto('http://localhost:8083/', { waitUntil: 'networkidle0' });
  
  console.log('\n=== Initial State ===');
  
  // Get full DOM
  const fullHTML = await page.evaluate(() => document.documentElement.outerHTML);
  require('fs').writeFileSync('dom-initial.html', fullHTML);
  console.log('Initial DOM saved to dom-initial.html');
  
  // Check launcher
  const launcherExists = await page.$('.sc-launcher');
  console.log('Launcher button exists:', !!launcherExists);
  
  if (launcherExists) {
    // Get launcher state
    const launcherState = await page.evaluate(() => {
      const launcher = document.querySelector('.sc-launcher');
      return {
        classes: launcher.className,
        style: launcher.getAttribute('style'),
        innerHTML: launcher.innerHTML.substring(0, 200)
      };
    });
    console.log('Launcher state:', JSON.stringify(launcherState, null, 2));
    
    console.log('\n=== Clicking launcher button ===');
    await launcherExists.click();
    
    // Wait for potential animations
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('\n=== State After Click ===');
    
    // Get DOM after click
    const fullHTMLAfter = await page.evaluate(() => document.documentElement.outerHTML);
    require('fs').writeFileSync('dom-after-click.html', fullHTMLAfter);
    console.log('DOM after click saved to dom-after-click.html');
    
    // Check all possible chat window selectors
    const selectors = [
      '.sc-chat-window',
      '[class*="chat-window"]',
      '[class*="ChatWindow"]',
      '[data-v-app] > div > div:not(.demo-header)',
      '.beautiful-chat',
      '[class*="beautiful-chat"]'
    ];
    
    console.log('\nChecking various selectors:');
    for (const selector of selectors) {
      const element = await page.$(selector);
      console.log(`  ${selector}: ${element ? '✓ FOUND' : '✗ NOT FOUND'}`);
    }
    
    // Get all direct children of app
    const appChildren = await page.evaluate(() => {
      const app = document.querySelector('#app');
      if (!app) return [];
      
      return Array.from(app.children).map((child, idx) => ({
        index: idx,
        tag: child.tagName,
        classes: child.className,
        id: child.id,
        childCount: child.children.length,
        hasContent: child.innerHTML.length > 0
      }));
    });
    
    console.log('\nDirect children of #app:');
    console.log(JSON.stringify(appChildren, null, 2));
    
    // Check component tree
    const vueComponents = await page.evaluate(() => {
      const app = document.querySelector('#app');
      if (!app) return 'No #app element';
      
      // Get all elements with Vue data attributes
      const vueElements = app.querySelectorAll('[data-v-app], [data-v-740df574], [class*="sc-"]');
      return Array.from(vueElements).map(el => ({
        tag: el.tagName,
        classes: el.className,
        id: el.id,
        vueData: Array.from(el.attributes)
          .filter(attr => attr.name.startsWith('data-v-'))
          .map(attr => attr.name)
      }));
    });
    
    console.log('\nVue components found:');
    console.log(JSON.stringify(vueComponents, null, 2));
    
    // Take final screenshot
    await page.screenshot({ path: 'screenshot-detailed.png', fullPage: true });
    console.log('\nFull page screenshot saved to screenshot-detailed.png');
  }
  
  await browser.close();
})();
