const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    console.log('BROWSER CONSOLE:', msg.type(), msg.text());
  });
  
  // Enable error logging
  page.on('pageerror', error => {
    console.log('BROWSER ERROR:', error.message);
  });
  
  console.log('Navigating to http://localhost:8083/');
  await page.goto('http://localhost:8083/', { waitUntil: 'networkidle0' });
  
  // Take initial screenshot
  await page.screenshot({ path: 'screenshot-initial.png' });
  console.log('Initial screenshot saved');
  
  // Look for the launcher button
  const launcherButton = await page.$('.sc-launcher');
  if (launcherButton) {
    console.log('✓ Found launcher button (.sc-launcher)');
    
    // Click the launcher button
    console.log('Clicking launcher button...');
    await launcherButton.click();
    
    // Wait a bit for animation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Take screenshot after click
    await page.screenshot({ path: 'screenshot-after-click.png' });
    console.log('Screenshot after click saved');
    
    // Check if chat window appeared
    const chatWindow = await page.$('.sc-chat-window');
    if (chatWindow) {
      console.log('✓ Chat window found (.sc-chat-window)');
      
      // Check if it's visible
      const isVisible = await chatWindow.evaluate(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
      });
      console.log('Chat window visible:', isVisible);
    } else {
      console.log('✗ Chat window NOT found (.sc-chat-window)');
    }
    
    // Check for chatwindow element
    const chatwindowEl = await page.$('[data-testid="chatwindow"], .chatwindow, #chatwindow');
    if (chatwindowEl) {
      console.log('✓ Found chatwindow element');
    } else {
      console.log('✗ chatwindow element NOT found');
    }
    
    // Get all elements with 'chat' in class name
    const chatElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('[class*="chat"]');
      return Array.from(elements).map(el => ({
        tag: el.tagName,
        classes: el.className,
        id: el.id,
        visible: window.getComputedStyle(el).display !== 'none'
      }));
    });
    
    console.log('\nAll elements with "chat" in class name:');
    console.log(JSON.stringify(chatElements, null, 2));
    
  } else {
    console.log('✗ Launcher button NOT found (.sc-launcher)');
    
    // Try to find any button
    const allButtons = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button, [role="button"], .button');
      return Array.from(buttons).map(el => ({
        tag: el.tagName,
        classes: el.className,
        id: el.id,
        text: el.textContent.trim().substring(0, 50)
      }));
    });
    
    console.log('\nAll buttons found:');
    console.log(JSON.stringify(allButtons, null, 2));
  }
  
  // Get HTML structure
  const bodyHTML = await page.evaluate(() => document.body.innerHTML);
  console.log('\nPage structure (first 1000 chars):');
  console.log(bodyHTML.substring(0, 1000));
  
  await browser.close();
})();
