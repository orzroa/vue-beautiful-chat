const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  const consoleLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(`[${msg.type().toUpperCase()}] ${text}`);
  });
  
  page.on('pageerror', error => {
    consoleLogs.push(`[ERROR] ${error.message}`);
  });
  
  console.log('Navigating...');
  await page.goto('http://localhost:8083/', { waitUntil: 'networkidle0' });
  
  console.log('\n=== Console logs on page load ===');
  consoleLogs.forEach(log => console.log(log));
  
  // Clear logs
  consoleLogs.length = 0;
  
  console.log('\n=== Clicking launcher ===');
  await page.click('.sc-launcher');
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  console.log('\n=== Console logs after click ===');
  consoleLogs.forEach(log => console.log(log));
  
  // Check what Vue sees
  const debugInfo = await page.evaluate(() => {
    // Get the Launcher component instance
    const launcherEl = document.querySelector('.sc-launcher')?.parentElement;
    if (!launcherEl) return { error: 'No launcher element' };
    
    const vueInstance = launcherEl.__vueParentComponent || launcherEl.__vue_app__?._instance;
    if (!vueInstance) return { error: 'No Vue instance' };
    
    // Check the component's registered components
    const componentOptions = vueInstance.type;
    
    return {
      componentName: componentOptions.name,
      hasComponents: !!componentOptions.components,
      registeredComponents: componentOptions.components ? Object.keys(componentOptions.components) : [],
      setupFn: !!componentOptions.setup,
      renderFn: !!componentOptions.render
    };
  });
  
  console.log('\n=== Launcher Component Debug Info ===');
  console.log(JSON.stringify(debugInfo, null, 2));
  
  // Check the chatwindow element more closely
  const chatwindowDebug = await page.evaluate(() => {
    const chatwindow = document.querySelector('chatwindow');
    if (!chatwindow) return { error: 'No chatwindow element' };
    
    // Check if it's a component or just a DOM element
    const isComponent = !!chatwindow.__vueParentComponent;
    const hasVNode = !!chatwindow._vnode;
    
    return {
      isVueComponent: isComponent,
      hasVNode: hasVNode,
      tagName: chatwindow.tagName,
      innerHTML: chatwindow.innerHTML.substring(0, 100)
    };
  });
  
  console.log('\n=== Chatwindow Element Debug Info ===');
  console.log(JSON.stringify(chatwindowDebug, null, 2));
  
  await browser.close();
})();
