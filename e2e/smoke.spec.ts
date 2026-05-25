import { test, expect } from "@playwright/test";

/**
 * Smoke tests — critical happy paths.
 * These must pass before any production deploy.
 */

test.describe("Public pages", () => {
  test("homepage loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Chetan Hi-Tech/i);
    await expect(page.locator("nav")).toBeVisible();
  });

  test("catalog page loads", async ({ page }) => {
    await page.goto("/catalog");
    await expect(page.locator("h1")).toContainText("Equipment Catalog");
  });

  test("knowledge center loads", async ({ page }) => {
    await page.goto("/knowledge");
    await expect(page.locator("h1")).toContainText("Engineering Insights");
  });

  test("health endpoint returns ok", async ({ page }) => {
    const res = await page.request.get("/api/health");
    expect(res.status()).toBeLessThan(400);
    const body = await res.json() as { status: string };
    expect(body.status).toBe("ok");
  });
});

test.describe("Auth pages", () => {
  test("login page loads", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("form")).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test("signup page loads", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.locator('input[name="email"]')).toBeVisible();
  });

  test("portal redirects unauthenticated to login", async ({ page }) => {
    await page.goto("/portal");
    await expect(page).toHaveURL(/login/);
  });

  test("admin redirects unauthenticated to login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/login/);
  });
});

test.describe("Cart", () => {
  test("cart page loads without auth", async ({ page }) => {
    await page.goto("/cart");
    // Cart page should load (shows empty guest state)
    await expect(page.locator("body")).toBeVisible();
  });
});
