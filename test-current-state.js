const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Capture console messages
  const consoleLogs = [];
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    consoleLogs.push({ type, text });
    console.log(`[CONSOLE ${type.toUpperCase()}] ${text}`);
  });
  
  page.on('pageerror', error => {
    consoleLogs.push({ type: 'error', text: error.message });
    console.log(`[PAGE ERROR] ${error.message}`);
  });
  
  console.log('=== Step 1: Accessing http://localhost:8083/ ===\n');
  await page.goto('http://localhost:8083/', { waitUntil: 'networkidle0' });
  
  // Take initial screenshot
  await page.screenshot({ path: 'step1-initial.png', fullPage: false });
  console.log('\n✓ Screenshot saved: step1-initial.png');
  
  console.log('\n=== Step 2: Refreshing page ===\n');
  consoleLogs.length = 0; // Clear previous logs
  await page.reload({ waitUntil: 'networkidle0' });
  
  await page.screenshot({ path: 'step2-after-refresh.png', fullPage: false });
  console.log('✓ Screenshot saved: step2-after-refresh.png');
  
  // Wait a bit for any async operations
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('\n=== Step 3: Clicking the blue floating button ===\n');
  
  // Find and click the launcher button
  const launcherButton = await page.$('.sc-launcher');
  if (!launcherButton) {
    console.log('❌ ERROR: Launcher button not found!');
    await browser.close();
    return;
  }
  
  console.log('✓ Found launcher button');
  await launcherButton.click();
  console.log('✓ Clicked launcher button');
  
  // Wait for potential animation
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  await page.screenshot({ path: 'step3-after-click.png', fullPage: false });
  console.log('✓ Screenshot saved: step3-after-click.png');
  
  console.log('\n=== Step 4: Checking chat window ===\n');
  
  // Check if chat window appeared
  const chatWindow = await page.$('.sc-chat-window');
  if (chatWindow) {
    const isVisible = await chatWindow.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
    });
    
    if (isVisible) {
      console.log('✅ Chat window EXISTS and is VISIBLE');
    } else {
      console.log('⚠️  Chat window exists but is NOT visible');
      console.log('   Display:', await chatWindow.evaluate(el => window.getComputedStyle(el).display));
      console.log('   Visibility:', await chatWindow.evaluate(el => window.getComputedStyle(el).visibility));
      console.log('   Opacity:', await chatWindow.evaluate(el => window.getComputedStyle(el).opacity));
    }
  } else {
    console.log('❌ Chat window (.sc-chat-window) NOT FOUND in DOM');
    
    // Check for the unresolved chatwindow element
    const chatwindowElement = await page.$('chatwindow');
    if (chatwindowElement) {
      console.log('⚠️  Found unresolved <chatwindow> element (Vue component failed to render)');
      const hasContent = await chatwindowElement.evaluate(el => el.innerHTML.length > 0);
      console.log('   Has content:', hasContent);
    }
  }
  
  console.log('\n=== Step 5: Console Error Check ===\n');
  
  // Check for the specific error
  const resolveComponentErrors = consoleLogs.filter(log => 
    log.text.includes('resolveComponent can only be used in render() or setup()')
  );
  
  if (resolveComponentErrors.length > 0) {
    console.log(`❌ Found ${resolveComponentErrors.length} "resolveComponent" warning(s):`);
    resolveComponentErrors.forEach((log, idx) => {
      console.log(`   ${idx + 1}. [${log.type}] ${log.text}`);
    });
  } else {
    console.log('✅ No "resolveComponent" warnings found!');
  }
  
  // Show all console messages
  console.log('\n=== All Console Messages ===\n');
  consoleLogs.forEach((log, idx) => {
    console.log(`${idx + 1}. [${log.type.toUpperCase()}] ${log.text}`);
  });
  
  // Final DOM check
  console.log('\n=== DOM Structure Check ===\n');
  const domInfo = await page.evaluate(() => {
    const launcher = document.querySelector('.sc-launcher');
    const chatWindow = document.querySelector('.sc-chat-window');
    const chatwindow = document.querySelector('chatwindow');
    
    return {
      launcher: launcher ? {
        exists: true,
        classes: launcher.className
      } : { exists: false },
      chatWindow: chatWindow ? {
        exists: true,
        classes: chatWindow.className,
        innerHTML: chatWindow.innerHTML.substring(0, 100)
      } : { exists: false },
      chatwindow: chatwindow ? {
        exists: true,
        tagName: chatwindow.tagName,
        hasContent: chatwindow.innerHTML.length > 0
      } : { exists: false }
    };
  });
  
  console.log('Launcher:', JSON.stringify(domInfo.launcher, null, 2));
  console.log('ChatWindow (.sc-chat-window):', JSON.stringify(domInfo.chatWindow, null, 2));
  console.log('Chatwindow (unresolved):', JSON.stringify(domInfo.chatwindow, null, 2));
  
  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    chatWindowAppeared: !!domInfo.chatWindow.exists,
    chatWindowVisible: domInfo.chatWindow.exists && domInfo.chatWindow.classes.includes('opened'),
    unresolvedElement: domInfo.chatwindow.exists,
    resolveComponentErrors: resolveComponentErrors.length,
    allConsoleLogs: consoleLogs
  };
  
  fs.writeFileSync('test-report.json', JSON.stringify(report, null, 2));
  console.log('\n✓ Report saved to test-report.json');
  
  console.log('\n=== SUMMARY ===');
  console.log(`Chat Window Appeared: ${report.chatWindowAppeared ? '✅ YES' : '❌ NO'}`);
  console.log(`Chat Window Visible: ${report.chatWindowVisible ? '✅ YES' : '❌ NO'}`);
  console.log(`Unresolved Element: ${report.unresolvedElement ? '⚠️  YES (component failed)' : '✅ NO'}`);
  console.log(`ResolveComponent Errors: ${report.resolveComponentErrors > 0 ? `❌ ${report.resolveComponentErrors} error(s)` : '✅ NONE'}`);
  
  await browser.close();
})();
