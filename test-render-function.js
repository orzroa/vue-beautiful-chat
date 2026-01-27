const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  await page.goto('http://localhost:8083/', { waitUntil: 'networkidle0' });
  
  // Get the Launcher component's render function source
  const renderInfo = await page.evaluate(() => {
    // Find the BeautifulChat/Launcher component
    const app = document.querySelector('#app');
    if (!app || !app.__vue_app__) {
      return { error: 'No Vue app' };
    }
    
    const vueApp = app.__vue_app__;
    const BeautifulChat = vueApp._context.components['BeautifulChat'];
    
    if (!BeautifulChat) {
      return { error: 'No BeautifulChat component' };
    }
    
    return {
      name: BeautifulChat.name,
      hasRender: !!BeautifulChat.render,
      renderSource: BeautifulChat.render ? BeautifulChat.render.toString().substring(0, 2000) : 'no render',
      hasSetup: !!BeautifulChat.setup,
      hasComponents: !!BeautifulChat.components,
      components: BeautifulChat.components ? Object.keys(BeautifulChat.components) : []
    };
  });
  
  console.log('=== Launcher Component Render Info ===');
  console.log(JSON.stringify(renderInfo, null, 2));
  
  fs.writeFileSync('render-function.txt', renderInfo.renderSource || 'N/A');
  console.log('\nRender function saved to render-function.txt');
  
  await browser.close();
})();
