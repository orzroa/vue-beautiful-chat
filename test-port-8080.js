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
  });
  
  page.on('pageerror', error => {
    consoleLogs.push({ type: 'pageerror', text: error.message });
  });
  
  console.log('=== Step 1: Accessing http://localhost:8080/ ===\n');
  
  try {
    await page.goto('http://localhost:8080/', { waitUntil: 'networkidle0', timeout: 10000 });
  } catch (error) {
    console.log('❌ ERROR: Failed to access http://localhost:8080/');
    console.log('   Error:', error.message);
    await browser.close();
    return;
  }
  
  console.log('✓ Page loaded successfully');
  
  // Take initial screenshot
  await page.screenshot({ path: 'port8080-step1-initial.png', fullPage: false });
  console.log('✓ Screenshot saved: port8080-step1-initial.png');
  
  // Wait a bit for page to fully render
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('\n=== Step 2: Looking for the blue floating button ===\n');
  
  // Find the launcher button
  const launcherButton = await page.$('.sc-launcher');
  if (!launcherButton) {
    console.log('❌ ERROR: Launcher button (.sc-launcher) not found!');
    
    // Try to find any button-like elements
    const buttons = await page.evaluate(() => {
      const btns = document.querySelectorAll('button, [role="button"], .launcher, [class*="launch"]');
      return Array.from(btns).map(btn => ({
        tag: btn.tagName,
        classes: btn.className,
        id: btn.id,
        text: btn.textContent?.trim().substring(0, 50)
      }));
    });
    
    console.log('Found these button-like elements:');
    buttons.forEach((btn, idx) => {
      console.log(`  ${idx + 1}. <${btn.tag}> class="${btn.classes}" id="${btn.id}"`);
    });
    
    await browser.close();
    return;
  }
  
  console.log('✓ Found launcher button');
  
  console.log('\n=== Step 3: Clicking the launcher button ===\n');
  
  await launcherButton.click();
  console.log('✓ Clicked launcher button');
  
  // Wait for animation/rendering
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  await page.screenshot({ path: 'port8080-step2-after-click.png', fullPage: false });
  console.log('✓ Screenshot saved: port8080-step2-after-click.png');
  
  console.log('\n=== Step 4: Checking if chat window appeared ===\n');
  
  // Check for chat window
  const chatWindow = await page.$('.sc-chat-window');
  
  if (chatWindow) {
    const isVisible = await chatWindow.evaluate(el => {
      const style = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return {
        display: style.display,
        visibility: style.visibility,
        opacity: style.opacity,
        hasSize: rect.width > 0 && rect.height > 0
      };
    });
    
    if (isVisible.display !== 'none' && isVisible.hasSize) {
      console.log('✅✅✅ SUCCESS! Chat window EXISTS and is VISIBLE! ✅✅✅');
      console.log('   Display:', isVisible.display);
      console.log('   Visibility:', isVisible.visibility);
      console.log('   Opacity:', isVisible.opacity);
      console.log('   Has Size:', isVisible.hasSize);
    } else {
      console.log('⚠️  Chat window exists but might not be fully visible');
      console.log('   Display:', isVisible.display);
      console.log('   Visibility:', isVisible.visibility);
      console.log('   Opacity:', isVisible.opacity);
      console.log('   Has Size:', isVisible.hasSize);
    }
    
    // Check if it has content
    const hasContent = await chatWindow.evaluate(el => el.innerHTML.length > 50);
    console.log('   Has Content:', hasContent ? '✓ YES' : '✗ NO (might be loading)');
    
  } else {
    console.log('❌ Chat window (.sc-chat-window) NOT FOUND in DOM');
    
    // Check for unresolved element
    const chatwindowElement = await page.$('chatwindow');
    if (chatwindowElement) {
      console.log('⚠️  Found unresolved <chatwindow> element');
    }
  }
  
  console.log('\n=== Step 5: Console Messages ===\n');
  
  if (consoleLogs.length === 0) {
    console.log('✅ No console messages');
  } else {
    console.log(`Found ${consoleLogs.length} console message(s):\n`);
    consoleLogs.forEach((log, idx) => {
      const icon = log.type === 'error' || log.type === 'pageerror' ? '❌' : 
                   log.type === 'warn' || log.type === 'warning' ? '⚠️' : 'ℹ️';
      console.log(`${icon} ${idx + 1}. [${log.type.toUpperCase()}] ${log.text}`);
    });
  }
  
  // Check specifically for resolveComponent errors
  console.log('\n=== Checking for resolveComponent errors ===\n');
  const resolveErrors = consoleLogs.filter(log => 
    log.text.includes('resolveComponent')
  );
  
  if (resolveErrors.length > 0) {
    console.log(`❌ Found ${resolveErrors.length} resolveComponent error(s)`);
  } else {
    console.log('✅ No resolveComponent errors!');
  }
  
  // DOM structure check
  console.log('\n=== DOM Structure ===\n');
  const domCheck = await page.evaluate(() => {
    return {
      launcher: {
        exists: !!document.querySelector('.sc-launcher'),
        classes: document.querySelector('.sc-launcher')?.className || 'N/A'
      },
      chatWindow: {
        exists: !!document.querySelector('.sc-chat-window'),
        classes: document.querySelector('.sc-chat-window')?.className || 'N/A'
      },
      unresolvedChatwindow: {
        exists: !!document.querySelector('chatwindow')
      }
    };
  });
  
  console.log('Launcher:', domCheck.launcher.exists ? `✓ Exists (${domCheck.launcher.classes})` : '✗ Not found');
  console.log('ChatWindow:', domCheck.chatWindow.exists ? `✓ Exists (${domCheck.chatWindow.classes})` : '✗ Not found');
  console.log('Unresolved <chatwindow>:', domCheck.unresolvedChatwindow.exists ? '⚠️ Exists (component failed)' : '✓ Not found');
  
  // Final summary
  console.log('\n' + '='.repeat(60));
  console.log('FINAL RESULT');
  console.log('='.repeat(60));
  
  const success = domCheck.chatWindow.exists && !domCheck.unresolvedChatwindow.exists;
  
  if (success) {
    console.log('✅✅✅ CHAT WINDOW IS WORKING! ✅✅✅');
    console.log('The chat window successfully appeared after clicking the button.');
  } else if (domCheck.unresolvedChatwindow.exists) {
    console.log('❌ CHAT WINDOW FAILED TO RENDER');
    console.log('The ChatWindow component is not being resolved correctly.');
    console.log('This is a Vue 3 component resolution issue.');
  } else {
    console.log('❌ CHAT WINDOW NOT FOUND');
    console.log('The chat window did not appear in the DOM.');
  }
  
  console.log('='.repeat(60) + '\n');
  
  await browser.close();
})();
