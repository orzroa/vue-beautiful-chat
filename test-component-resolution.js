const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  console.log('=== Navigating to http://localhost:8083/ ===\n');
  await page.goto('http://localhost:8083/', { waitUntil: 'networkidle0' });
  
  // Execute code in page context to check Vue app
  const vueAppInfo = await page.evaluate(() => {
    const app = document.querySelector('#app');
    if (!app || !app.__vue_app__) {
      return { error: 'No Vue app found' };
    }
    
    const vueApp = app.__vue_app__;
    const rootComponent = vueApp._instance;
    
    // Check component registration
    const globalComponents = vueApp._context.components;
    
    return {
      hasApp: !!vueApp,
      globalComponents: Object.keys(globalComponents || {}),
      rootComponentType: rootComponent?.type?.name || 'unknown'
    };
  });
  
  console.log('Vue App Info:');
  console.log(JSON.stringify(vueAppInfo, null, 2));
  
  // Check if beautiful-chat component exists
  const beautifulChatInfo = await page.evaluate(() => {
    const app = document.querySelector('#app');
    if (!app || !app.__vue_app__) {
      return { error: 'No Vue app found' };
    }
    
    const vueApp = app.__vue_app__;
    const components = vueApp._context.components;
    
    // Check for BeautifulChat component
    const beautifulChat = components['BeautifulChat'] || components['beautiful-chat'];
    
    return {
      hasBeautifulChat: !!beautifulChat,
      beautifulChatType: beautifulChat?.name || 'not found',
      allComponents: Object.keys(components)
    };
  });
  
  console.log('\nBeautiful Chat Component Info:');
  console.log(JSON.stringify(beautifulChatInfo, null, 2));
  
  // Now click the launcher and check component state
  console.log('\n=== Clicking launcher ===\n');
  await page.click('.sc-launcher');
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Check the component tree after click
  const afterClickInfo = await page.evaluate(() => {
    // Find the beautiful-chat component instance
    const beautifulChatEl = document.querySelector('[class*="sc-launcher"]')?.parentElement?.parentElement;
    if (!beautifulChatEl) {
      return { error: 'Cannot find beautiful-chat element' };
    }
    
    // Check if it has a vue instance
    const vueInstance = beautifulChatEl.__vueParentComponent;
    
    // Look for chatwindow element
    const chatwindowEl = document.querySelector('chatwindow');
    
    return {
      hasVueInstance: !!vueInstance,
      chatwindowElement: {
        exists: !!chatwindowEl,
        tagName: chatwindowEl?.tagName,
        attributes: chatwindowEl ? Array.from(chatwindowEl.attributes).map(attr => ({
          name: attr.name,
          value: attr.value.substring(0, 50)
        })) : [],
        hasVueInstance: chatwindowEl ? !!chatwindowEl.__vueParentComponent : false
      }
    };
  });
  
  console.log('After Click Info:');
  console.log(JSON.stringify(afterClickInfo, null, 2));
  
  // Check for errors in console
  const logs = [];
  page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
  
  await browser.close();
})();
