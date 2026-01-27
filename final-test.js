const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  console.log('📱 访问 http://localhost:8080/\n');
  
  try {
    await page.goto('http://localhost:8080/', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    // Wait for Vue app to mount
    await page.waitForSelector('#app', { timeout: 10000 });
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('✅ 页面加载成功\n');
    
    // Take initial screenshot
    await page.screenshot({ path: 'test-initial.png', fullPage: true });
    console.log('📸 初始截图: test-initial.png\n');
    
    // Find launcher button
    console.log('🔍 寻找蓝色圆形悬浮按钮...\n');
    const launcher = await page.$('.sc-launcher');
    
    if (!launcher) {
      console.log('❌ 未找到悬浮按钮\n');
      await browser.close();
      return;
    }
    
    console.log('✅ 找到悬浮按钮\n');
    
    // Get button position
    const buttonInfo = await launcher.evaluate(el => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        position: `${rect.left}px, ${rect.top}px`,
        size: `${rect.width}x${rect.height}`,
        backgroundColor: style.backgroundColor,
        classes: el.className
      };
    });
    
    console.log('📍 按钮信息:');
    console.log(`   位置: ${buttonInfo.position}`);
    console.log(`   尺寸: ${buttonInfo.size}`);
    console.log(`   背景色: ${buttonInfo.backgroundColor}`);
    console.log(`   Classes: ${buttonInfo.classes}\n`);
    
    // Click the button
    console.log('🖱️  点击悬浮按钮...\n');
    await launcher.click();
    
    // Wait for chat window animation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Take screenshot after click
    await page.screenshot({ path: 'test-after-click.png', fullPage: true });
    console.log('📸 点击后截图: test-after-click.png\n');
    
    // Check if chat window appeared
    console.log('🔍 检查聊天窗口...\n');
    
    const chatWindow = await page.$('.sc-chat-window');
    
    if (!chatWindow) {
      console.log('❌ 未找到 .sc-chat-window 元素\n');
      
      // Check for unresolved component
      const unresolved = await page.$('chatwindow');
      if (unresolved) {
        console.log('⚠️  发现未解析的 <chatwindow> 元素（组件解析失败）\n');
      }
      
      await browser.close();
      return;
    }
    
    console.log('✅ 找到聊天窗口元素\n');
    
    // Check visibility and get details
    const windowInfo = await chatWindow.evaluate(el => {
      const style = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return {
        display: style.display,
        visibility: style.visibility,
        opacity: style.opacity,
        width: rect.width,
        height: rect.height,
        classes: el.className,
        hasContent: el.innerHTML.length > 100,
        contentLength: el.innerHTML.length
      };
    });
    
    console.log('📋 聊天窗口详情:');
    console.log(`   Display: ${windowInfo.display}`);
    console.log(`   Visibility: ${windowInfo.visibility}`);
    console.log(`   Opacity: ${windowInfo.opacity}`);
    console.log(`   尺寸: ${windowInfo.width}x${windowInfo.height}`);
    console.log(`   Classes: ${windowInfo.classes}`);
    console.log(`   有内容: ${windowInfo.hasContent ? '是' : '否'} (${windowInfo.contentLength} chars)`);
    console.log('');
    
    // Check for specific elements inside chat window
    const chatElements = await page.evaluate(() => {
      return {
        header: !!document.querySelector('.sc-header'),
        messageList: !!document.querySelector('.sc-message-list'),
        userInput: !!document.querySelector('.sc-user-input')
      };
    });
    
    console.log('📦 聊天窗口组件:');
    console.log(`   Header: ${chatElements.header ? '✅' : '❌'}`);
    console.log(`   Message List: ${chatElements.messageList ? '✅' : '❌'}`);
    console.log(`   User Input: ${chatElements.userInput ? '✅' : '❌'}`);
    console.log('');
    
    // Final verdict
    const isVisible = windowInfo.display !== 'none' && 
                     windowInfo.visibility !== 'hidden' && 
                     parseFloat(windowInfo.opacity) > 0 &&
                     windowInfo.width > 0 && 
                     windowInfo.height > 0;
    
    const isComplete = isVisible && windowInfo.hasContent && 
                      chatElements.header && 
                      chatElements.messageList && 
                      chatElements.userInput;
    
    console.log('='.repeat(60));
    if (isComplete) {
      console.log('✅✅✅ 测试成功！聊天窗口正常弹出并完整显示！✅✅✅');
    } else if (isVisible) {
      console.log('⚠️  聊天窗口已弹出，但可能不完整');
    } else {
      console.log('❌ 聊天窗口未能正常显示');
    }
    console.log('='.repeat(60));
    
  } catch (error) {
    console.log('❌ 错误:', error.message);
  }
  
  await browser.close();
})();
