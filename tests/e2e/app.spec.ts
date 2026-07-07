import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("preview renders the fixture page after login", async ({ page }) => {
  await page.goto("/login?redirectTo=/preview/home");
  await page.getByLabel("Email").fill("viewer@test.com");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/preview\/home/);
  await expect(page.getByText("viewer@test.com · viewer")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Build pages with confidence" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Start editing" })).toBeVisible();
});

test("get started route is valid and links into studio", async ({ page }) => {
  await page.goto("/login?redirectTo=/get-started");
  await page.getByLabel("Email").fill("editor@test.com");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/get-started/);
  await expect(page.getByText("editor@test.com · editor")).toBeVisible();
  await page.getByRole("link", { name: "Open studio" }).click();

  await expect(page).toHaveURL(/\/studio\/home/);
});

test("CTA link opens the protected studio for publishers", async ({ page }) => {
  await page.goto("/login?redirectTo=/preview/home");
  await page.getByLabel("Email").fill("publisher@test.com");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();

  await page.getByRole("link", { name: "Start editing" }).click();

  await expect(page).toHaveURL(/\/studio\/home/);
});

test("studio edits appear in local draft preview", async ({ page }) => {
  await page.goto("/login?redirectTo=/studio/home");
  await page.getByLabel("Email").fill("publisher@test.com");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/studio\/home/);
  await page.getByLabel("Heading").first().fill("Draft headline from e2e");
  await page.getByRole("link", { name: "Preview draft" }).click();

  await expect(page).toHaveURL(/\/preview\/home\?draft=local/);
  await expect(page.getByText("Local draft preview")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Draft headline from e2e" }),
  ).toBeVisible();
});

test("preview has no critical axe violations", async ({ page }, testInfo) => {
  await page.goto("/login?redirectTo=/preview/home");
  await page.getByLabel("Email").fill("viewer@test.com");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();

  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const criticalViolations = accessibilityScanResults.violations.filter(
    (violation) => violation.impact === "critical",
  );

  await testInfo.attach("a11y-report", {
    body: JSON.stringify(accessibilityScanResults, null, 2),
    contentType: "application/json",
  });
  await mkdir(path.join(process.cwd(), "test-results"), { recursive: true });
  await writeFile(
    path.join(process.cwd(), "test-results", "a11y-report.json"),
    `${JSON.stringify(accessibilityScanResults, null, 2)}\n`,
    "utf8",
  );
  expect(criticalViolations).toEqual([]);
});
