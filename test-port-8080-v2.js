const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  const consoleLogs = [];
  page.on('console', msg => consoleLogs.push({ type: msg.type(), text: msg.text() }));
  page.on('pageerror', error => consoleLogs.push({ type: 'pageerror', text: error.message }));
  
  console.log('Accessing http://localhost:8080/ (timeout: 30s)...\n');
  
  try {
    await page.goto('http://localhost:8080/', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    // Wait for app to mount
    await page.waitForSelector('#app', { timeout: 10000 });
    console.log('✓ Page loaded');
    
    // Wait for Vue to initialize
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await page.screenshot({ path: 'port8080-initial.png' });
    console.log('✓ Screenshot: port8080-initial.png\n');
    
    // Look for launcher
    const launcher = await page.$('.sc-launcher');
    if (!launcher) {
      console.log('❌ No launcher button found');
      await browser.close();
      return;
    }
    
    console.log('✓ Found launcher button\n');
    console.log('Clicking...\n');
    
    await launcher.click();
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await page.screenshot({ path: 'port8080-after-click.png' });
    console.log('✓ Screenshot: port8080-after-click.png\n');
    
    // Check results
    const result = await page.evaluate(() => {
      return {
        chatWindow: {
          exists: !!document.querySelector('.sc-chat-window'),
          visible: document.querySelector('.sc-chat-window') ? 
            window.getComputedStyle(document.querySelector('.sc-chat-window')).display !== 'none' : false
        },
        unresolvedElement: !!document.querySelector('chatwindow')
      };
    });
    
    console.log('=== RESULTS ===\n');
    console.log('Chat Window (.sc-chat-window):');
    console.log('  Exists:', result.chatWindow.exists ? '✅ YES' : '❌ NO');
    console.log('  Visible:', result.chatWindow.visible ? '✅ YES' : '❌ NO');
    console.log('\nUnresolved <chatwindow>:', result.unresolvedElement ? '⚠️ YES (failed)' : '✅ NO');
    
    console.log('\n=== Console Messages ===\n');
    if (consoleLogs.length === 0) {
      console.log('✅ No console messages');
    } else {
      consoleLogs.forEach((log, i) => {
        const icon = log.type.includes('err') ? '❌' : log.type.includes('warn') ? '⚠️' : 'ℹ️';
        console.log(`${icon} [${log.type}] ${log.text}`);
      });
    }
    
    const hasResolveError = consoleLogs.some(log => log.text.includes('resolveComponent'));
    console.log('\nresolveComponent errors:', hasResolveError ? '❌ YES' : '✅ NO');
    
    console.log('\n' + '='.repeat(50));
    if (result.chatWindow.exists && result.chatWindow.visible) {
      console.log('✅✅✅ SUCCESS - CHAT WINDOW IS WORKING! ✅✅✅');
    } else if (result.unresolvedElement) {
      console.log('❌ FAILED - Component resolution issue');
    } else {
      console.log('❌ FAILED - Chat window not found');
    }
    console.log('='.repeat(50));
    
  } catch (error) {
    console.log('❌ ERROR:', error.message);
  }
  
  await browser.close();
})();
