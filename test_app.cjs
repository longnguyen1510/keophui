const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log('CONSOLE [', msg.type(), ']:', msg.text());
  });

  page.on('pageerror', error => {
    console.log('PAGE ERROR (uncaught):', error.message);
  });

  await page.goto('http://localhost:5174');
  await new Promise(r => setTimeout(r, 1000));

  const tabs = await page.$$('button.flex.flex-col');
  if (tabs.length > 2) {
    console.log('Switching to Kèo của tôi tab...');
    await tabs[1].click(); // Kèo của tôi tab
    await new Promise(r => setTimeout(r, 1000));
    
    let matchCards = await page.$$('.bg-appDark-card.cursor-pointer');
    console.log('My Matches tab match cards:', matchCards.length);
    for (let i = 0; i < matchCards.length; i++) {
      console.log('Clicking card', i);
      await matchCards[i].click();
      await new Promise(r => setTimeout(r, 500));
      const closeBtn = await page.$('.w-7.h-7.rounded-full');
      if (closeBtn) {
          await closeBtn.click();
      } else {
          console.log('Close btn not found!');
      }
      await new Promise(r => setTimeout(r, 200));
    }
  }

  await browser.close();
  process.exit(0);
})();
