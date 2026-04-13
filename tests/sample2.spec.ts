import { test, expect } from "@playwright/test";

const URL = "https://buildia-rho.vercel.app/sample2";

test.describe("sample2 - 会員予約システム", () => {

  // ── 1. ページ表示 ──
  test("トップにログイン画面が表示される", async ({ page }) => {
    await page.goto(URL);
    await expect(page.getByRole("heading", { name: "ログイン", exact: true })).toBeVisible();
  });

  test("新規登録ボタンが存在する", async ({ page }) => {
    await page.goto(URL);
    await expect(page.getByRole("button", { name: "新規登録はこちら" })).toBeVisible();
  });

  test("管理者ログインへのリンクが存在する", async ({ page }) => {
    await page.goto(URL);
    await expect(page.getByRole("button", { name: "管理者ログインはこちら" })).toBeVisible();
  });

  // ── 2. 新規登録フロー ──
  test("新規登録ボタンをクリックするとメールアドレス入力画面に遷移する", async ({ page }) => {
    await page.goto(URL);
    await page.getByRole("button", { name: "新規登録はこちら" }).click();

    await page.waitForURL("**/sample2/signup");
    await expect(page).toHaveURL(/\/sample2\/signup/);
  });

  test("signup画面にメールアドレス入力欄が存在する", async ({ page }) => {
    await page.goto(`${URL}/signup`);
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test("signup画面に認証コード送信ボタンが存在する", async ({ page }) => {
    await page.goto(`${URL}/signup`);
    await expect(page.getByRole("button", { name: "認証コードを送信" })).toBeVisible();
  });

  test("signup画面からログイン画面に戻れる", async ({ page }) => {
    await page.goto(`${URL}/signup`);
    await page.getByRole("button", { name: "← ログイン画面に戻る" }).click();

    await page.waitForURL("**/sample2");
    await expect(page).toHaveURL(/\/sample2$/);
  });

  // ── 3. ログイン画面 ──
  test("メールアドレス入力欄が存在する", async ({ page }) => {
    await page.goto(URL);
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test("パスワード入力欄が存在する", async ({ page }) => {
    await page.goto(URL);
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("ログインボタンが存在する", async ({ page }) => {
    await page.goto(URL);
    await expect(page.getByRole("button", { name: "ログイン", exact: true })).toBeVisible();
  });

  test("管理者ログインページに遷移できる", async ({ page }) => {
    await page.goto(URL);
    await page.getByRole("button", { name: "管理者ログインはこちら" }).click();

    await page.waitForURL("**/sample2/admin/login");
    await expect(page).toHaveURL(/\/sample2\/admin\/login/);
  });

  test("管理者ログインページに「管理者専用」バッジが表示される", async ({ page }) => {
    await page.goto(`${URL}/admin/login`);
    await expect(page.getByText("管理者専用")).toBeVisible();
  });
});
