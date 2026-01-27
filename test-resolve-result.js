const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  await page.goto('http://localhost:8083/', { waitUntil: 'networkidle0' });
  
  // Test what resolveComponent returns
  const resolveTest = await page.evaluate(() => {
    const app = document.querySelector('#app').__vue_app__;
    const instance = app._instance.proxy;
    
    // Try to manually resolve the component
    const { resolveComponent } = window.Vue || {};
    
    if (!resolveComponent) {
      return { error: 'resolveComponent not available in window.Vue' };
    }
    
    // This will fail because we're calling it outside render context
    try {
      const result = resolveComponent('ChatWindow');
      return {
        success: true,
        resultType: typeof result,
        resultValue: result?.toString ? result.toString().substring(0, 100) : String(result)
      };
    } catch (e) {
      return {
        success: false,
        error: e.message
      };
    }
  });
  
  console.log('=== resolveComponent Test ===');
  console.log(JSON.stringify(resolveTest, null, 2));
  
  // Check the actual component instance in the DOM
  const componentCheck = await page.evaluate(() => {
    // Get the launcher element and its vue instance
    const launcherWrapper = document.querySelector('.sc-launcher')?.parentElement;
    if (!launcherWrapper) return { error: 'No launcher wrapper' };
    
    // Find its vue component instance
    let current = launcherWrapper;
    while (current && !current.__vueParentComponent) {
      current = current.parentElement;
    }
    
    if (!current || !current.__vueParentComponent) {
      return { error: 'No vue component found' };
    }
    
    const vueInstance = current.__vueParentComponent;
    const componentDef = vueInstance.type;
    
    return {
      componentName: componentDef.name,
      hasComponentsOption: !!componentDef.components,
      componentsKeys: componentDef.components ? Object.keys(componentDef.components) : [],
      chatWindowDef: componentDef.components?.ChatWindow ? {
        name: componentDef.components.ChatWindow.name,
        hasRender: !!componentDef.components.ChatWindow.render
      } : 'not found'
    };
  });
  
  console.log('\n=== Component Instance Check ===');
  console.log(JSON.stringify(componentCheck, null, 2));
  
  await browser.close();
})();
