import { test, expect, type Page } from '@playwright/test';

const TARGET_URL = 'https://reginaexmachina.github.io/';

/**
 * Suite: Portfolio Integrity Tests
 * Focuses on header navigation, external project links, and anchor scrolling.
 */
test.describe('Rachel Day Portfolio - TS Validation', () => {

  test('header should match the visual baseline', async ({ page }) => {
    // We target the header specifically to ensure branding and alignment stay consistent
    const header = page.locator('header');
    
    // The first time you run this, Playwright will create a "gold" image.
    // Future runs will compare against it.
    await expect(header).toHaveScreenshot('header-baseline.png', {
      threshold: 0.2, // Adjusts sensitivity to minor anti-aliasing differences
    });
  });

  test('hero section visual check', async ({ page }) => {
    const hero = page.locator('.hero');
    await expect(hero).toHaveScreenshot('hero-baseline.png');
  });

  test('mobile layout check', async ({ page }) => {
    // Force the viewport to a mobile size to test our new Media Query
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verify the header stacks correctly without overlapping text
    const header = page.locator('header');
    await expect(header).toHaveScreenshot('header-mobile-baseline.png');
  });

  test.beforeEach(async ({ page }: { page: Page }) => {
    await page.goto(TARGET_URL);
  });

  test('header contact links have valid destinations', async ({ page }) => {
    interface ContactLink {
      label: string;
      expectedUrl: string;
    }

    const contactLinks: ContactLink[] = [
      { label: 'LinkedIn', expectedUrl: 'linkedin.com/in/dayrachel' },
      { label: 'GitHub', expectedUrl: 'github.com/ReginaExMachina' }
    ];

    for (const link of contactLinks) {
      const anchor = page.locator(`.header-contact a:has-text("${link.label}")`);
      await expect(anchor).toBeVisible();
      
      const href = await anchor.getAttribute('href');
      expect(href).toContain(link.expectedUrl);
    }
  });

  test('navigation bar anchors scroll to correct sections', async ({ page }) => {
    const navSections: string[] = ['#ml', '#data', '#gamedev', '#active'];
    
    for (const id of navSections) {
      const navLink = page.locator(`.nav-bar a[href="${id}"]`);
      await expect(navLink).toBeVisible();
      
      await navLink.click();
      
      // Verify the element is visible in the viewport after smooth scroll
      const section = page.locator(id);
      await expect(section).toBeInViewport();
    }
  });

  test('external project cards return successful status', async ({ page }) => {
    // Selects all links within the bento-grid sections
    const projectCards = page.locator('.bento-grid a.card');
    const urls = await projectCards.evaluateAll((links: HTMLAnchorElement[]) => 
      links.map(link => link.href)
    );

    for (const url of urls) {
      // Using request.get to verify the link is alive (200-399 status)
      const response = await page.request.get(url);
      expect(response.status(), `Link failed: ${url}`).toBeLessThan(400);
    }
  });

  test('footer contains correct year and branding', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toContainText('Regina Ex Machina');
    await expect(footer).toContainText('MMXXVI'); // 2026
  });
});
