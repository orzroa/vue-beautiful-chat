const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  await page.goto('http://localhost:8083/', { waitUntil: 'networkidle0' });
  
  // Get the full render function
  const renderSource = await page.evaluate(() => {
    const app = document.querySelector('#app');
    if (!app || !app.__vue_app__) return 'No app';
    
    const BeautifulChat = app.__vue_app__._context.components['BeautifulChat'];
    return BeautifulChat?.render?.toString() || 'No render function';
  });
  
  fs.writeFileSync('render-function-full.txt', renderSource);
  console.log(`Render function saved (${renderSource.length} chars)`);
  console.log('\nFirst 1000 chars:');
  console.log(renderSource.substring(0, 1000));
  console.log('\n... (see render-function-full.txt for complete output)');
  
  // Search for ChatWindow usage
  const chatWindowUsage = renderSource.match(/ChatWindow[\s\S]{0,500}/g);
  if (chatWindowUsage) {
    console.log('\n=== ChatWindow usage in render function ===');
    chatWindowUsage.forEach((match, idx) => {
      console.log(`\nMatch ${idx + 1}:`);
      console.log(match.substring(0, 300));
    });
  }
  
  await browser.close();
})();
