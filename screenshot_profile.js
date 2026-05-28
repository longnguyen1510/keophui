import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  // Set to mobile viewport
  await page.setViewport({ width: 390, height: 844 });
  
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  
  // Wait for loading to finish
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Enter phone number
  await page.type('input[type="tel"]', '0123456789');
  await page.click('button[type="submit"]');
  
  // Wait for OTP dialog
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Enter OTP
  const inputs = await page.$$('input[type="text"]');
  const otp = "123456";
  for (let i = 0; i < Math.min(inputs.length, 6); i++) {
    await inputs[i].type(otp[i]);
  }
  
  // Wait for login to complete
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Click on "Tôi" tab
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('Tôi')) {
      await btn.click();
      break;
    }
  }
  
  // Wait for tab to load
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const artifactDir = '/Users/macbook/.gemini/antigravity/brain/52df2e17-5a75-4819-aafa-240b559429cb/';
  const imagePath = path.join(artifactDir, 'profile_layout_fixed.png');
  
  await page.screenshot({ path: imagePath, fullPage: true });
  console.log('Screenshot saved to', imagePath);
  
  await browser.close();
})();
