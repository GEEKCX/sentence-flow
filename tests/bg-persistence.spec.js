import { test, expect } from '@playwright/test';

test('verify background color persistence', async ({ page }) => {
  // 1. Navigate to the app
  await page.goto('/');

  // 2. Open Settings Panel
  // Header button with Settings icon
  await page.click('header button:has(svg.lucide-settings)');

  // 3. Switch to Appearance Settings
  await page.click('text=外观设置');

  // 4. Change Background Color
  // Find the theme buttons. They are in a grid.
  // We'll select the second one (Blue theme) to ensure a change from default (Purple)
  // Default: purple, Index 0
  // Target: blue, Index 1
  const themeButtons = page.locator('.grid.grid-cols-3 button');
  await themeButtons.nth(1).click();

  // Wait for the background to update
  // The root div in App.jsx has the style. 
  // App.jsx structure: <div style={{ background: ... }}> ... </div>
  const appRoot = page.locator('#root > div').first();
  
  // Verify the change happened (Blue theme gradient)
  // Note: Browsers might normalize colors, so we check for presence of blue-ish values or just change
  await expect(appRoot).toHaveCSS('background-image', /linear-gradient/);
  
  // Get the current background image value to compare later
  const newBg = await appRoot.evaluate(el => getComputedStyle(el).backgroundImage);
  console.log('New background:', newBg);

  // 5. Reload the page
  await page.reload();

  // 6. Verify Background Color is Persisted
  await expect(appRoot).toHaveCSS('background-image', newBg);

  // 7. Check localStorage
  const storageData = await page.evaluate(() => localStorage.getItem('sentence-flow-storage'));
  expect(storageData).toBeTruthy();
  
  const parsed = JSON.parse(storageData);
  console.log('LocalStorage Snapshot:', parsed);
  
  // Verify the background color in storage matches the blue theme
  // Blue theme value from SettingsModal.jsx: 'linear-gradient(to right bottom, #1e40af, #3b82f6, #60a5fa)'
  const expectedStoredValue = 'linear-gradient(to right bottom, #1e40af, #3b82f6, #60a5fa)';
  expect(parsed.state.backgroundColor).toBe(expectedStoredValue);
});
